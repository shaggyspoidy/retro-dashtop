import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { colorForLoad } from "../utils/gauge.js";
import { ArcGauge } from "./ArcGauge.js";

export function Powerband({ label, value, width = 24, height = 8, subLabel, unavailable = false }) {
  const ratio = unavailable || value === null ? 0 : value;
  const color = colorForLoad(ratio);

  return h(
    Box,
    { flexDirection: "column", width },
    h(
      Box,
      { justifyContent: "space-between" },
      h(Text, { bold: true, color: theme.green }, label),
      h(Text, { bold: true, color: unavailable ? theme.textDim : color },
        unavailable ? "N/A" : `${Math.round(ratio * 100)}%`)
    ),
    h(ArcGauge, { ratio, width, height }),
    subLabel ? h(Text, { color: theme.textDim }, subLabel) : null
  );
}
