import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { arcEnvelope, renderArcCells } from "../utils/arcGauge.js";
import { gradientColor } from "../utils/gauge.js";

const EMPTY_TEXTURE = "\u2591"; // ░ — same "unlit" language as Powerband/VerticalGauge

/**
 * The CPU/GPU arc powerband: a static red curve (uniform hue, no
 * gradient — reads as a clean line) tracing the top edge, with a
 * green->red fill beneath it that grows left-to-right as load
 * increases. The fill's color is gradiented by COLUMN POSITION, not
 * by current load: left = green (low-load region), right = red
 * (high-load region) — so the danger zone always sits on the right,
 * like a real tachometer redline, regardless of how far the fill
 * currently reaches.
 */
export function ArcGauge({ ratio, width = 32, height = 8 }) {
  const r = Math.min(1, Math.max(0, ratio ?? 0));
  const envelope = arcEnvelope(width, height);
  const litColumns = Math.round(r * width);
  const cells = renderArcCells(envelope, height, litColumns);

  return h(
    Box,
    { flexDirection: "column" },
    ...cells.map((row, i) =>
      h(
        Box,
        { key: i, flexDirection: "row" },
        ...row.map((cell, j) => {
          if (cell.zone === "cap") {
            return h(Text, { key: j, color: theme.red }, cell.char);
          }
          if (cell.zone === "fill") {
            const t = width === 1 ? 0 : j / (width - 1); // 0 = left/green, 1 = right/red
            return h(Text, { key: j, color: gradientColor(t) }, cell.char);
          }
          const isOutside = cell.char === " ";
          return h(Text, { key: j, color: theme.textDim }, isOutside ? " " : EMPTY_TEXTURE);
        })
      )
    )
  );
}
