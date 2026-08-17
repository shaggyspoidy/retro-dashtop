#!/usr/bin/env node
import { verticalTrackPosition } from "../src/utils/gauge.js";

for (const ratio of [0, 0.25, 0.5, 0.75, 1]) {
  console.log(`\nratio ${ratio}:`);
  const rows = verticalTrackPosition(ratio, 8);
  rows.forEach((r) => console.log(r === "marker" ? "  \u2500 <-- marker" : "  \u2502"));
}
