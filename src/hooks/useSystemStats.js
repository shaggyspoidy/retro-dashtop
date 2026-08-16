import fs from "node:fs";
import { useEffect, useRef, useState } from "react";
import os from "node:os";
import si from "systeminformation";
import {
  cpuLoadRatio,
  gpuLoadRatio,
  memRatio,
  batteryRatio,
  tempRatio,
  diskRatio,
  aggregateDiskRatio,
  NetworkPressureTracker,
  daysSince,
  diskBreakdown,
  formatRate,
} from "../utils/calculations.js";

const FAST_POLL_MS = 1000;
const SLOW_POLL_MS = 2000;
const NET_HISTORY_LEN = 120;

const initialState = {
  cpuRatio: 0,
  gpuRatio: null,
  memRatio: 0,
  battRatio: null,
  battTimeRemainingMinutes: null,
  uptimeSeconds: 0,
  isCharging: false,
  tempRatio: null,
  tempCelsius: null,
  diskRatio: 0,
  cgoRatio: 0,
  netRatio: 0,
  netRawBytesPerSec: 0,
  netHistory: [],
  processes: [],
  ready: false,
  odoDays: null,
  disks: [],
  uploadRatio: 0,
  downloadRatio: 0,
  uploadRateBytesPerSec: 0,
  downloadRateBytesPerSec: 0,
  uploadHistory: [],
  downloadHistory: [],
  uploadTotalBytes: 0,
  downloadTotalBytes: 0,
  uploadPeakBytesPerSec: 0,
  downloadPeakBytesPerSec: 0,
};

export function useSystemStats() {
  const [stats, setStats] = useState(initialState);
  const netTracker = useRef(new NetworkPressureTracker());
  const netHistoryRef = useRef([]);
  const busyFast = useRef(false);
  const busySlow = useRef(false);
  const mounted = useRef(true);
  const uploadTracker = useRef(new NetworkPressureTracker());
  const downloadTracker = useRef(new NetworkPressureTracker());
  const uploadHistoryRef = useRef([]);
  const downloadHistoryRef = useRef([]);
  const netBaselineRef = useRef(null);
  const uploadPeakRef = useRef(0);
  const downloadPeakRef = useRef(0);

  useEffect(() => {
    mounted.current = true;

    // ODO: OS install age from the root partition's birthtime.
    // Computed once — doesn't change during a session.
    try {
      const odoDays = daysSince(fs.statSync("/").birthtime);
      if (mounted.current) setStats((prev) => ({ ...prev, odoDays }));
    } catch {
      // leave odoDays as null
    }

    async function pollFast() {
      if (busyFast.current || !mounted.current) return;
      busyFast.current = true;
      try {
        const [load, mem, graphics, temp, net] = await Promise.all([
          si.currentLoad(),
          si.mem(),
          si.graphics(),
          si.cpuTemperature(),
          si.networkStats(),
        ]);

        const rxSec = (net || []).reduce((sum, i) => sum + (i.rx_sec || 0), 0);
        const txSec = (net || []).reduce((sum, i) => sum + (i.tx_sec || 0), 0);
        const rxBytesCum = (net || []).reduce((sum, i) => sum + (i.rx_bytes || 0), 0);
        const txBytesCum = (net || []).reduce((sum, i) => sum + (i.tx_bytes || 0), 0);

        if (netBaselineRef.current === null) {
          netBaselineRef.current = { rx: rxBytesCum, tx: txBytesCum };
        }
        const downloadTotalBytes = Math.max(0, rxBytesCum - netBaselineRef.current.rx);
        const uploadTotalBytes = Math.max(0, txBytesCum - netBaselineRef.current.tx);

        const { ratio: uploadRatio, raw: uploadRateBytesPerSec } = uploadTracker.current.sample(txSec);
        const { ratio: downloadRatio, raw: downloadRateBytesPerSec } = downloadTracker.current.sample(rxSec);

        uploadPeakRef.current = Math.max(uploadPeakRef.current, uploadRateBytesPerSec);
        downloadPeakRef.current = Math.max(downloadPeakRef.current, downloadRateBytesPerSec);

        uploadHistoryRef.current = [...uploadHistoryRef.current, uploadRatio].slice(-NET_HISTORY_LEN);
        downloadHistoryRef.current = [...downloadHistoryRef.current, downloadRatio].slice(-NET_HISTORY_LEN);

        const totalBytesPerSec = (net || []).reduce(
          (sum, iface) => sum + (iface.rx_sec || 0) + (iface.tx_sec || 0),
          0
        );
        const { ratio: netRatio, raw: netRawBytesPerSec } =
          netTracker.current.sample(totalBytesPerSec);

        netHistoryRef.current = [...netHistoryRef.current, netRatio].slice(-NET_HISTORY_LEN);

        if (mounted.current) {
          setStats((prev) => ({
            ...prev,
            cpuRatio: cpuLoadRatio(load.currentLoad),
            gpuRatio: gpuLoadRatio(graphics.controllers),
            memRatio: memRatio(mem),
            tempRatio: tempRatio(temp.main),
            tempCelsius: temp.main ?? null,
            netRatio,
            netRawBytesPerSec,
            netHistory: netHistoryRef.current,
            ready: true,
            uploadRatio,
            downloadRatio,
            uploadRateBytesPerSec,
            downloadRateBytesPerSec,
            uploadHistory: uploadHistoryRef.current,
            downloadHistory: downloadHistoryRef.current,
            uploadTotalBytes,
            downloadTotalBytes,
            uploadPeakBytesPerSec: uploadPeakRef.current,
            downloadPeakBytesPerSec: downloadPeakRef.current,
          }));
        }
      } finally {
        busyFast.current = false;
      }
    }

    async function pollSlow() {
      if (busySlow.current || !mounted.current) return;
      busySlow.current = true;
      try {
        const [procs, batt, disks] = await Promise.all([
          si.processes(),
          si.battery(),
          si.fsSize(),
        ]);

        if (mounted.current) {
          setStats((prev) => ({
            ...prev,
            processes: (procs.list || []).map((p) => ({
              pid: p.pid,
              user: p.user || "?",
              pmem: p.mem || 0,
              pcpu: p.cpu || 0,
              command: p.command || p.name || "?",
            })),
            battRatio: batteryRatio(batt),
            battTimeRemainingMinutes: batt.timeRemaining ?? null,
            uptimeSeconds: os.uptime(),
            isCharging: !!batt.isCharging,
            diskRatio: diskRatio(disks),
            cgoRatio: aggregateDiskRatio(disks),
            disks: diskBreakdown(disks),
          }));
        }
      } finally {
        busySlow.current = false;
      }
    }

    pollFast();
    pollSlow();
    const fastTimer = setInterval(pollFast, FAST_POLL_MS);
    const slowTimer = setInterval(pollSlow, SLOW_POLL_MS);

    return () => {
      mounted.current = false;
      clearInterval(fastTimer);
      clearInterval(slowTimer);
    };
  }, []);

  return stats;
}
