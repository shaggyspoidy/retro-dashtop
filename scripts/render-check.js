#!/usr/bin/env node

/**
 * @fileoverview Phase 2 Rendering Verification Script.
 * Feeds static, hardcoded ratios into the pure rendering functions.
 * By completely removing live hardware data, any visual glitches 
 * can be strictly isolated to the rendering logic.
 */

import { ledSegments, smoothBar, trackPosition, colorForLoad } from "../src/utils/gauge.js";
import { BrailleCanvas } from "../src/utils/braille.js";

function ansi(hex, str) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m${str}\x1b[0m`;
}

console.log("--- ledSegments ---");
for (const r of [0, 0.25, 0.5, 0.75, 0.99, 1]) {
  const { chars } = ledSegments(r, 24);
  const color = colorForLoad(r);
  console.log(`${r.toFixed(2)}  ${ansi(color, chars.join(""))}`);
}

console.log("\n--- smoothBar ---");
// Test fractional sub-character rendering (0.13 and 0.87 will trigger the Unicode block-eighths)
for (const r of [0, 0.13, 0.5, 0.87, 1]) {
  console.log(`${r.toFixed(2)}  [${smoothBar(r, 24)}]`);
}

console.log("\n--- trackPosition ---");
// Test the slider position at absolute minimum, exact center, and absolute maximum
for (const r of [0, 0.5, 1]) {
  console.log(`${r.toFixed(2)}  ${trackPosition(r, 24)}`);
}

console.log("\n--- BrailleCanvas (sine wave, hardcoded, no live data) ---");
// Initialize a Braille grid 30 characters wide and 4 characters high
const canvas = new BrailleCanvas(30, 4);

// Generate a smooth mathematical sine wave to simulate incoming network data
const series = Array.from({ length: 60 }, (_, i) => (Math.sin(i / 4) + 1) / 2);

// Map the sine wave to the Braille dots and print it to the terminal
canvas.plotSeries(series);
canvas.toLines().forEach((l) => console.log(l));
