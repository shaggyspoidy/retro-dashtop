#!/usr/bin/env node

/**
 * @fileoverview Phase 1 Probe Script for retro-dashtop.
 * This is a headless, throwaway verification script used to test the pure math functions 
 * in `calculations.js` and ensure that `systeminformation` is properly extracting 
 * live hardware data. It runs directly in the terminal without React or Ink.
 */

import si from "systeminformation";
import {
  cpuLoadRatio,
  gpuLoadRatio,
  memRatio,
  batteryRatio,
  tempRatio,
  diskRatio,
  NetworkPressureTracker,
} from "../src/utils/calculations.js";

/** 
 * Instantiate a global network tracker to maintain state between polling ticks.
 * This allows the network ratio to auto-scale against peak throughput over time.
 * @type {NetworkPressureTracker} 
 */
const netTracker = new NetworkPressureTracker();

/**
 * Renders a simple ASCII progress bar based on a 0.0 to 1.0 ratio.
 * 
 * @param {number|null} ratio - The normalized metric ratio (0.0 to 1.0). If null, returns "N/A".
 * @param {number} [width=20] - The total character width of the rendered bar.
 * @returns {string} A string representing the visual bar (e.g., "██████░░░░").
 */
function bar(ratio, width = 20) {
  if (ratio === null) return "N/A".padEnd(width);
  const filled = Math.round(ratio * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

/**
 * The main polling loop. 
 * Fetches raw system metrics asynchronously, passes them through the pure 
 * calculation functions to get 0-1 ratios, and prints the formatted results 
 * to the console.
 * 
 * @async
 * @returns {Promise<void>}
 */
async function tick() {
  // Fetch all system metrics concurrently for maximum efficiency
  const [load, mem, graphics, temp, battery, disks, net] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.graphics(),
    si.cpuTemperature(),
    si.battery(),
    si.fsSize(),
    si.networkStats(),
  ]);

  // Convert raw hardware metrics into normalized 0.0 - 1.0 ratios
  const cpuR = cpuLoadRatio(load.currentLoad);
  const gpuR = gpuLoadRatio(graphics.controllers);
  const memR = memRatio(mem);
  const battR = batteryRatio(battery);
  const tempR = tempRatio(temp.main);
  const diskR = diskRatio(disks);

  // Combine RX (receive) and TX (transmit) for all network interfaces
  const totalBytesPerSec = (net || []).reduce(
    (sum, iface) => sum + (iface.rx_sec || 0) + (iface.tx_sec || 0),
    0
  );
  
  // Calculate the network ratio against the tracked peak
  const { ratio: netR, raw } = netTracker.sample(totalBytesPerSec);

  // Clear the terminal and render the UI
  console.clear();
  console.log("retro-dashtop :: Phase 1 probe (Ctrl+C to stop)\n");
  console.log(`CPU   ${bar(cpuR)}  ${(cpuR * 100).toFixed(1)}%   (raw: ${load.currentLoad.toFixed(1)}%)`);
  console.log(`GPU   ${bar(gpuR)}  ${gpuR === null ? "N/A" : (gpuR * 100).toFixed(1) + "%"}`);
  console.log(`MEM   ${bar(memR)}  ${(memR * 100).toFixed(1)}%`);
  console.log(`FUEL  ${bar(battR)}  ${battR === null ? "N/A (no battery)" : (battR * 100).toFixed(1) + "%"}`);
  console.log(`TEMP  ${bar(tempR)}  ${tempR === null ? "N/A" : (tempR * 100).toFixed(1) + "%"}   (raw: ${temp.main ?? "?"}°C)`);
  console.log(`DISK  ${bar(diskR)}  ${(diskR * 100).toFixed(1)}%`);
  console.log(`NET   ${bar(netR)}  raw: ${raw.toFixed(0)} B/s`);
}

// Start the continuous polling engine at a 1000ms interval
setInterval(tick, 1000);

// Fire the first tick immediately so we don't wait 1 second for the first paint
tick();
