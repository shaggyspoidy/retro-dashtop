#!/usr/bin/env node
import { render, Box, Text } from "ink";
import { h } from "../src/utils/h.js";
import { ChargingIndicator } from "../src/components/ChargingIndicator.js";

function Check() {
  return h(
    Box,
    { flexDirection: "row", gap: 4 },
    h(
      Box,
      { flexDirection: "column", alignItems: "center" },
      h(Text, null, "charging: true"),
      h(ChargingIndicator, { charging: true })
    ),
    h(
      Box,
      { flexDirection: "column", alignItems: "center" },
      h(Text, null, "charging: false"),
      h(ChargingIndicator, { charging: false }),
      h(Text, { color: "gray" }, "(nothing above this line)")
    )
  );
}

render(h(Check));
