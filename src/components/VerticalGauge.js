import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { verticalSegments, gradientColor } from "../utils/gauge.js";

/**
 * A vertical stacked-segment gauge, double-resolution: each physical
 * terminal row renders TWO segments by coloring a half-block glyph's
 * foreground and background separately. segmentCount defaults higher
 * than the visible row count as a result — e.g. 24 segments only
 * needs 12 terminal rows.
 */
export function VerticalGauge({ ratio, segmentCount = 24, cellWidth = 4 }) {
  const rows = verticalSegments(ratio ?? 0, segmentCount); // index 0 = topmost
  const rowPairs = Math.ceil(segmentCount / 2);
  const glyph = "\u2580".repeat(cellWidth); // ▀ upper half block

  const colorFor = (idx, lit) => {
    if (!lit) return theme.textDim;
    const t = segmentCount === 1 ? 0 : idx / (segmentCount - 1);
    return gradientColor(t);
  };

  const elements = [];
  for (let r = 0; r < rowPairs; r++) {
    const topIdx = r * 2;
    const bottomIdx = Math.min(r * 2 + 1, segmentCount - 1);
    const topColor = colorFor(topIdx, rows[topIdx]);
    const bottomColor = colorFor(bottomIdx, rows[bottomIdx]);

    elements.push(
      h(Text, { key: r, color: topColor, backgroundColor: bottomColor }, glyph)
    );
  }

  return h(Box, { flexDirection: "column" }, ...elements);
}
