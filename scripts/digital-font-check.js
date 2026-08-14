#!/usr/bin/env node
import { renderDigitalText, digitalTextWidth } from "../src/utils/digitalFont.js";

for (const label of ["CPU", "GPU", "FUEL", "TEMP", "OIL", "CGO"]) {
  console.log(`\n--- "${label}" (needs ${digitalTextWidth(label)} chars wide) ---`);
  renderDigitalText(label).forEach((row) => console.log(row));
}
