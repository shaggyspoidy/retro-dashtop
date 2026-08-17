import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { verticalSegments, zoneColor } from "../utils/gauge.js";

export const DEFAULT_SEGMENT_COUNT = 12;

// One row per segment now (was 2-per-row via half-block blending) —
// the visible gap this trades away is exactly the point this time.
export function gaugeVisualRows(segmentCount = DEFAULT_SEGMENT_COUNT) {
  return segmentCount;
}

/**
 * Chunky LED-style vertical gauge: discrete segments (▆, lower
 * three-quarters block) with a visible gap at the top of each lit
 * cell, colors snapping hard at zone boundaries instead of blending.
 */
export function VerticalGauge({ ratio, segmentCount = DEFAULT_SEGMENT_COUNT, cellWidth = 4, invert = false }) {
  const rows = verticalSegments(ratio ?? 0, segmentCount); // index 0 = topmost
  const glyph = "\u2586".repeat(cellWidth); // ▆
  const emptyGlyph = "\u2591".repeat(cellWidth); // ░

  return h(
    Box,
    { flexDirection: "column" },
    ...rows.map((lit, i) => {
      let t = segmentCount === 1 ? 0 : i / (segmentCount - 1); // 0 = top, 1 = bottom
      if (invert) t = 1 - t;
      return h(Text, { key: i, color: lit ? zoneColor(t) : theme.textDim }, lit ? glyph : emptyGlyph);
    })
  );
}
