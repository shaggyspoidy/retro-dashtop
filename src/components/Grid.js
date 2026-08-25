import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

/**
 * Decorative background texture — a dim repeating "+---" grid behind
 * every panel, like the brushed housing on an 80s instrument cluster.
 * Purely cosmetic (no live data drives this — it's chrome, not a
 * readout). Positioned absolute, confirmed working via
 * scripts/background-spike.js, so foreground panels layer cleanly on
 * top instead of this bleeding through empty interior cells.
 */
export function Grid({ width, height }) {
  const row = ("+" + "-".repeat(3)).repeat(Math.ceil(width / 4)).slice(0, width);
  return h(
    Box,
    { position: "absolute", flexDirection: "column" },
        ...Array.from({ length: height }, (_, i) =>
      h(Text, { key: i, dimColor: true, color: theme.panelBorder, backgroundColor: theme.background }, row)
    )
  );
}
