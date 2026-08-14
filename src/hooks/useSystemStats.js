import { useEffect, useRef, useState } from "react";
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
} from "../utils/calculations.js";

const FAST_POLL_MS = 1000;
const SLOW_POLL_MS = 2000;
const NET_HISTORY_LEN = 120;

const initialState = {
  cpuRatio: 0,
  gpuRatio: null,
  memRatio: 0,
  battRatio: null,
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
};

export function useSystemStats() {
  const [stats, setStats] = useState(initialState);
  const netTracker = useRef(new NetworkPressureTracker());
  const netHistoryRef = useRef([]);
  const busyFast = useRef(false);
  const busySlow = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

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
            processes: procs.list || [],
            battRatio: batteryRatio(batt),
            isCharging: !!batt.isCharging,
            diskRatio: diskRatio(disks),
            cgoRatio: aggregateDiskRatio(disks),
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
