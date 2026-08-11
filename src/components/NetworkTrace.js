import { useMemo } from "react";
import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { BrailleCanvas } from "../utils/braille.js";

export function NetworkTrace({ history, rawLabel, width = 60, height = 4 }) {
  const cols = Math.max(10, width);
  const rows = Math.max(2, height);

  const lines = useMemo(() => {
    const canvas = new BrailleCanvas(cols, rows);
    canvas.plotSeries(history || []);
    return canvas.toLines();
  }, [history, cols, rows]);

  return h(
    Box,
    { flexDirection: "column", width: cols },
    h(
      Box,
      { justifyContent: "space-between" },
      h(Text, { bold: true, color: theme.cyan }, "NET PRESSURE"),
      h(Text, { bold: true, color: theme.green }, rawLabel)
    ),
    ...lines.map((line, i) => h(Text, { key: i, color: theme.green }, line || " "))
  );
}
