import { useEffect, useRef, useState } from "react";
import si from "systeminformation";
import {
  cpuLoadRatio,
  gpuLoadRatio,
  memRatio,
  batteryRatio,
  tempRatio,
  diskRatio,
  NetworkPressureTracker,
} from "../utils/calculations.js";

/** 
 * Polling intervals in milliseconds.
 * Separated to prevent heavy system calls from bottlenecking the fast UI updates.
 */
const FAST_POLL_MS = 1000; // cpu / gpu / mem / net / temp
const SLOW_POLL_MS = 2000; // processes / battery / disk (heavier calls)

/**
 * Initial state shape for the system stats payload.
 * Ensures the UI has a safe, predictable structure before the first poll resolves.
 */
const initialState = {
  cpuRatio: 0,
  gpuRatio: null,
  memRatio: 0,
  battRatio: null,
  isCharging: false,
  tempRatio: null,
  tempCelsius: null,
  diskRatio: 0,
  netRatio: 0,
  netRawBytesPerSec: 0,
  processes: [],
  ready: false, // Flips to true once the first fast poll completes
};

/**
 * Custom React Hook: useSystemStats
 * 
 * Orchestrates a dual-rate polling engine that interacts with the OS via `systeminformation`.
 * It normalizes raw hardware data into 0.0 - 1.0 ratios for the UI to consume.
 * Includes concurrency guards to prevent overlapping async calls.
 * 
 * @returns {Object} The current hardware statistics payload (matches initialState shape).
 */
export function useSystemStats() {
  const [stats, setStats] = useState(initialState);
  
  // Persist the network tracker instance across renders to calculate dynamic peaks
  const netTracker = useRef(new NetworkPressureTracker());
  
  // Concurrency guards (Mutexes): Prevent stacking new polls if the previous one is still pending
  const busyFast = useRef(false);
  const busySlow = useRef(false);
  
  // Mount guard: Prevents React state updates on unmounted components (avoids memory leaks)
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    /**
     * Executes the high-frequency polling loop for metrics that change rapidly.
     * @async
     */
    async function pollFast() {
      // Abort if a previous fast poll is still hanging or if the component unmounted
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

        // Aggregate bandwidth across all active network interfaces
        const totalBytesPerSec = (net || []).reduce(
          (sum, iface) => sum + (iface.rx_sec || 0) + (iface.tx_sec || 0),
          0
        );
        const { ratio: netRatio, raw: netRawBytesPerSec } =
          netTracker.current.sample(totalBytesPerSec);

        // Only update state if the component is still alive
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
            ready: true,
          }));
        }
      } finally {
        // Always release the lock, even if the promise rejects/fails
        busyFast.current = false;
      }
    }

    /**
     * Executes the low-frequency polling loop for computationally heavier metrics.
     * @async
     */
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
          }));
        }
      } finally {
        busySlow.current = false;
      }
    }

    // Fire the initial polls immediately so the user doesn't wait for the first interval tick
    pollFast();
    pollSlow();
    
    // Start the continuous background engines
    const fastTimer = setInterval(pollFast, FAST_POLL_MS);
    const slowTimer = setInterval(pollSlow, SLOW_POLL_MS);

    // Cleanup function: Halts polling and invalidates state updates when unmounting
    return () => {
      mounted.current = false;
      clearInterval(fastTimer);
      clearInterval(slowTimer);
    };
  }, []);

  return stats;
}
