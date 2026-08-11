import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { ledSegments, colorForLoad } from "../utils/gauge.js";

export function Powerband({ label, value, width = 24, subLabel, unavailable = false }) {
  const ratio = unavailable || value === null ? 0 : value;
  const { chars } = ledSegments(ratio, Math.max(6, width));
  const color = colorForLoad(ratio);

  return h(
    Box,
    { flexDirection: "column", width },
    h(
      Box,
      { justifyContent: "space-between" },
      h(Text, { bold: true, color: theme.cyan }, label),
      h(Text, { bold: true, color: unavailable ? theme.textDim : color },
        unavailable ? "N/A" : `${Math.round(ratio * 100)}%`)
    ),
    h(Text, { color: unavailable ? theme.textDim : color }, chars.join("")),
    subLabel ? h(Text, { color: theme.textDim }, subLabel) : null
  );
}
