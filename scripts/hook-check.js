#!/usr/bin/env node

/**
 * @fileoverview Phase 1 Hook Verification Script
 * Tests the `useSystemStats` React hook inside an actual Ink rendering environment.
 * Ensures state updates trigger terminal redraws cleanly without flickering.
 */

import { render, Box, Text } from "ink";
import { h } from "../src/utils/h.js";
import { useSystemStats } from "../src/hooks/useSystemStats.js";

function HookCheck() {
  const s = useSystemStats();

  // Show a loading state until the first fast poll completes
  if (!s.ready) {
    return h(Text, { color: "gray" }, "waiting for first poll...");
  }

  // Render the live data payload inside a styled cyan box
  return h(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", padding: 1 },
    h(Text, { bold: true }, "useSystemStats() live check"),
    h(Text, null, `cpuRatio:  ${s.cpuRatio.toFixed(3)}`),
    h(Text, null, `gpuRatio:  ${s.gpuRatio === null ? "null" : s.gpuRatio.toFixed(3)}`),
    h(Text, null, `memRatio:  ${s.memRatio.toFixed(3)}`),
    h(Text, null, `battRatio: ${s.battRatio === null ? "null" : s.battRatio.toFixed(3)}`),
    h(Text, null, `tempRatio: ${s.tempRatio === null ? "null" : s.tempRatio.toFixed(3)} (${s.tempCelsius}°C)`),
    h(Text, null, `diskRatio: ${s.diskRatio.toFixed(3)}`),
    h(Text, null, `netRatio:  ${s.netRatio.toFixed(3)} (${s.netRawBytesPerSec.toFixed(0)} B/s)`),
    h(Text, null, `processes: ${s.processes.length} found`)
  );
}

// Mount the React component to the terminal
render(h(HookCheck));
