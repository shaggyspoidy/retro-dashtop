#!/usr/bin/env node
import { render, Box, Text } from "ink";
import { h } from "../src/utils/h.js";
import { theme } from "../src/utils/theme.js";

// If position:"absolute" genuinely layers, this dim grid should show
// through in the empty space AROUND the foreground box, and the
// foreground box should render cleanly on top of it, not merged or
// broken. If it doesn't work, expect garbled/overlapping text, or
// the grid simply not appearing at all.
function Grid({ width, height }) {
  const row = ("+" + "-".repeat(3)).repeat(Math.ceil(width / 4)).slice(0, width);
  return h(
    Box,
    { position: "absolute", flexDirection: "column" },
    ...Array.from({ length: height }, (_, i) => h(Text, { key: i, dimColor: true }, row))
  );
}

function App() {
  return h(
    Box,
    { width: 40, height: 12 },
    h(Grid, { width: 40, height: 12 }),

    h(
      Box,
      { borderStyle: "round", borderColor: theme.green, width: 20, height: 5, marginTop: 2, marginLeft: 4 },
      h(Text, { color: theme.green }, "foreground")
    )
  );
}

render(h(App));
