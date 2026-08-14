#!/usr/bin/env node
import { arcEnvelope, renderEnvelopeOutline, renderArcCells } from "../src/utils/arcGauge.js";

const width = 40;
const height = 10;
const envelope = arcEnvelope(width, height);
const rows = renderEnvelopeOutline(envelope, height);
const peakCol = envelope.indexOf(Math.max(...envelope));

console.log(`left wall  ~${(envelope[0] / 8).toFixed(1)} rows`);
console.log(`right wall ~${(envelope[width - 1] / 8).toFixed(1)} rows`);
console.log(`peak       ~${(Math.max(...envelope) / 8).toFixed(1)} rows at column ${peakCol} of ${width} (${((peakCol / width) * 100).toFixed(0)}%)\n`);
rows.forEach((r) => console.log(r));

console.log("\n--- renderArcCells (hardcoded load ratios) ---");
for (const ratio of [0, 0.3, 0.6, 1]) {
  const lit = Math.round(ratio * width);
  console.log(`\nload ${ratio.toFixed(1)} (${lit}/${width} columns lit):`);
  const cells = renderArcCells(envelope, height, lit);
  for (const row of cells) {
    let line = "";
    for (const cell of row) {
      line += cell.zone === "cap" ? "\x1b[31m" + cell.char + "\x1b[0m"
        : cell.zone === "fill" ? "\x1b[32m" + cell.char + "\x1b[0m"
        : cell.char;
    }
    console.log(line);
  }
}
