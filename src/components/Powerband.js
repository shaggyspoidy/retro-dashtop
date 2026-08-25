import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { colorForLoad } from "../utils/gauge.js";
import { ArcGauge } from "./ArcGauge.js";

/**
 * CPU/GPU load panel: percentage readout above the arc gauge. The
 * panel's own label lives in the parent TitledBox's embedded border
 * title, not here. (Tried a big LED-digit readout here — it rendered
 * as broken/overlapping blocks since not every terminal font handles
 * the dot-matrix block characters cleanly, so back to plain text.)
 */
export function Powerband({ value, width = 24, height = 8, subLabel, unavailable = false }) {
  const ratio = unavailable || value === null ? 0 : value;
  const color = unavailable ? theme.textDim : colorForLoad(ratio);

  return h(
    Box,
    { flexDirection: "column", width },
    h(
      Box,
      { justifyContent: "flex-end" },
      h(Text, { bold: true, color }, unavailable ? "N/A" : `${Math.round(ratio * 100)}%`)
    ),
    h(ArcGauge, { ratio, width, height }),
    subLabel ? h(Text, { color: theme.textDim }, subLabel) : null
  );
}
