#!/usr/bin/env node
import { render, Box, Text } from "ink";
import { h } from "../src/utils/h.js";
import { theme } from "../src/utils/theme.js";
import { TitledBox } from "../src/components/TitledBox.js";

// Same grid as background-spike.js, but the foreground is a real
// TitledBox (hand-drawn top-border Text line + inner Box with
// borderTop:false) instead of a single plain bordered Box — this is
// the actual shape every Section 1/2 panel uses. If position:
// "absolute" breaks here, THIS is the real bug, not the simple case.
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
      { marginTop: 2, marginLeft: 4 },
      h(
        TitledBox,
        { title: "TEST", width: 20, height: 5, backgroundColor: "magenta" },
        h(Text, { color: theme.green, backgroundColor: "magenta" }, "content row 1"),
        h(Text, { color: theme.green, backgroundColor: "magenta" }, "content row 2"),
        h(Text, { backgroundColor: "magenta" }, "")
      )
    )
  );
}

render(h(App));
