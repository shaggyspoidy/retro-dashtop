import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

const CELL = "+---";

// Subtle grid/graph-paper texture rendered behind the whole app via
// position:"absolute" — confirmed working in scripts/background-spike.js.
// Uses theme.textDim explicitly (not a bare color name) so it stays
// correct regardless of the terminal's own ANSI color scheme.
export function Background({ width, height }) {
  const row = CELL.repeat(Math.ceil(width / CELL.length)).slice(0, width);
  return h(
    Box,
    { position: "absolute", flexDirection: "column" },
    ...Array.from({ length: height }, (_, i) =>
      h(Text, { key: i, color: theme.textDim }, row)
    )
  );
}
