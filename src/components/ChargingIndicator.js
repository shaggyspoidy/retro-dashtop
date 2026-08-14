import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

/**
 * The charging dot + "REFUELING" text from SRS 4.1.1 — always
 * visible now (per revision): bright amber when charging, dim
 * textDim when not. Static, no animation.
 */
export function ChargingIndicator({ charging }) {
  const color = charging ? theme.amber : theme.textDim;
  return h(
    Box,
    { flexDirection: "column", alignItems: "center" },
    h(Text, { color, bold: charging }, "\u25C6"),
    h(Text, { color, bold: charging }, "REFUELING")
  );
}
