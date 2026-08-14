import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { trackPosition } from "../utils/gauge.js";

export function TempSlider({ ratio, celsius, width = 20 }) {
  const known = ratio !== null && ratio !== undefined;
  const r = known ? ratio : 0;
  const color = !known ? theme.textDim : r >= 0.85 ? theme.red : r >= 0.65 ? theme.amber : theme.green;
  const track = trackPosition(r, Math.max(6, width - 2));

  return h(
    Box,
    { flexDirection: "column", width },
    h(
      Box,
      { justifyContent: "space-between" },
      h(Text, { bold: true, color: theme.green }, "TEMP"),
      h(Text, { bold: true, color }, known ? `${Math.round(celsius)}\u00B0C` : "N/A")
    ),
    h(
      Box,
      null,
      h(Text, { color: theme.textDim }, "C"),
      h(Text, { color }, track),
      h(Text, { color: theme.textDim }, "H")
    )
  );
}
