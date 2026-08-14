import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { VerticalGauge } from "./VerticalGauge.js";

/**
 * A labeled vertical gauge: short label, a value readout, then the
 * fill below. Shared by TEMP, OIL, and CGO — any "current level"
 * metric that isn't CPU/GPU/FUEL.
 */
export function GaugeReadout({ label, ratio, valueLabel, width = 8 }) {
  const known = ratio !== null && ratio !== undefined;
  const r = known ? ratio : 0;

  return h(
    Box,
    { flexDirection: "column", width, alignItems: "center" },
    h(Text, { bold: true, color: theme.green }, label),
    h(Text, { bold: true, color: theme.textPrimary }, known ? valueLabel : "N/A"),
    h(VerticalGauge, { ratio: r, cellWidth: Math.max(2, width - 2) })
  );
}
