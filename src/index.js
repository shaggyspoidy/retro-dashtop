#!/usr/bin/env node
import React from "react";
import { render, Box, Text } from "ink";
import { h } from "./utils/h.js";

function Heartbeat() {
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return h(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1 },
    h(Text, { bold: true, color: "yellow" }, "◈ RETRO-DASHTOP ◈"),
    h(Text, { color: "gray" }, "Phase 0: scaffold alive."),
    h(Text, { color: "green" }, `Uptime: ${tick}s (Ctrl+C to quit)`)
  );
}

render(h(Heartbeat));
