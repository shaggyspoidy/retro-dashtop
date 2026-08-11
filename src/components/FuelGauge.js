import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { smoothBar } from "../utils/gauge.js";

export function FuelGauge({ value, charging, width = 20 }) {
  const hasBattery = value !== null && value !== undefined;
  const ratio = hasBattery ? value : 0;
  const color = !hasBattery ? theme.textDim : ratio <= 0.15 ? theme.red : ratio <= 0.3 ? theme.amber : theme.cyan;
  const bar = smoothBar(ratio, Math.max(6, width - 2));

  return h(
    Box,
    { flexDirection: "column", width },
    h(
      Box,
      { justifyContent: "space-between" },
      h(Text, { bold: true, color: theme.cyan }, "FUEL"),
      h(Text, { bold: true, color },
        hasBattery ? `${Math.round(ratio * 100)}%${charging ? " \u26A1" : ""}` : "N/A")
    ),
    h(
      Box,
      null,
      h(Text, { color: theme.textDim }, "E"),
      h(Text, { color }, bar),
      h(Text, { color: theme.textDim }, "F")
    ),
    h(Text, { color: theme.textDim }, hasBattery ? (charging ? "charging" : "on battery") : "no battery")
  );
}
