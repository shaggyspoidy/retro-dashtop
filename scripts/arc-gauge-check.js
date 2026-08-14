#!/usr/bin/env node
import { render, Box, Text } from "ink";
import { h } from "../src/utils/h.js";
import { ArcGauge } from "../src/components/ArcGauge.js";

function Check() {
  const ratios = [0, 0.3, 0.6, 1];
  return h(
    Box,
    { flexDirection: "row", gap: 3 },
    ...ratios.map((r) =>
      h(
        Box,
        { key: r, flexDirection: "column", alignItems: "center" },
        h(Text, null, r.toFixed(1)),
        h(ArcGauge, { ratio: r })
      )
    )
  );
}

render(h(Check));
