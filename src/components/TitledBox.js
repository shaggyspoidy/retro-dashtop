import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

/**
 * A bordered box with its title embedded directly in the top border
 * line: "┌─ TITLE ──────┐". Left/right/bottom use Ink's native
 * border rendering; borderTop is disabled so our hand-drawn top line
 * takes its place instead.
 */
export function TitledBox({ title, width, height, borderColor = theme.panelBorder, flexDirection = "column", children }) {
  const innerWidth = Math.max(4, width - 2);
  const labelPart = ` ${title} `;
  const dashCount = Math.max(1, innerWidth - 1 - labelPart.length);
  const topLine = "\u256D\u2500" + labelPart + "\u2500".repeat(dashCount) + "\u256E";

  return h(
    Box,
    { flexDirection: "column", width, height },
    h(Text, { color: borderColor }, topLine),
    h(
      Box,
      { flexDirection, width, height: Math.max(1, height - 1), borderStyle: "round", borderColor, borderTop: false, paddingX: 1 },
      children
    )
  );
}
