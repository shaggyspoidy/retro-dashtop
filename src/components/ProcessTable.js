import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { COLUMNS, sortProcesses, truncate, padCell } from "../utils/processTable.js";
import { colorForLoad } from "../utils/gauge.js";

function columnColor(key, proc) {
  switch (key) {
    case "pid":
      return theme.textDim;
    case "user":
      return theme.green;
    case "pmem":
      return colorForLoad(Math.min(1, (proc.pmem || 0) / 100));
    case "pcpu":
      return colorForLoad(Math.min(1, (proc.pcpu || 0) / 100));
    default:
      return theme.textPrimary;
  }
}

// Widths computed once, shared by header + every data row. Gaps
// between columns are explicit 1-char spacer Boxes, not trailing
// whitespace inside a Text string — Ink/Yoga can trim trailing
// whitespace during text measurement, silently collapsing spacing.
function columnWidths(width) {
  const fixed = COLUMNS.filter((c) => c.width);
  const fixedTotal = fixed.reduce((s, c) => s + c.width, 0);
  const gaps = COLUMNS.length - 1;
  const commandWidth = Math.max(10, width - fixedTotal - gaps);
  return COLUMNS.map((c) => c.width || commandWidth);
}

function headerRow(widths) {
  const elements = [];
  COLUMNS.forEach((c, i) => {
    if (i > 0) elements.push(h(Box, { key: `hgap-${i}`, width: 1 }));
    elements.push(h(Text, { key: `hcell-${i}`, bold: true, color: theme.green }, padCell(c.label, widths[i], c.align)));
  });
  return h(Box, { flexDirection: "row" }, ...elements);
}

function dataRow(proc, isSelected, widths, key) {
  const bg = isSelected ? theme.green : undefined;
  const selectedFg = "#001a0f";
  const elements = [];
  COLUMNS.forEach((c, i) => {
    if (i > 0) elements.push(h(Box, { key: `${key}-gap-${i}`, width: 1, backgroundColor: bg }));
    const raw = c.key === "command" ? truncate(proc[c.key], widths[i]) : proc[c.key];
    const fg = isSelected ? selectedFg : columnColor(c.key, proc);
    elements.push(h(Text, { key: `${key}-cell-${i}`, backgroundColor: bg, color: fg }, padCell(raw, widths[i], c.align)));
  });
  return h(Box, { key, flexDirection: "row" }, ...elements);
}

export function ProcessTable({ processes, sortKey, sortDir, selectedPid, scrollTop, visibleRows, width }) {
  const sorted = sortProcesses(processes, sortKey, sortDir);
  const rows = sorted.slice(scrollTop, scrollTop + visibleRows);
  const widths = columnWidths(width);

  return h(
    Box,
    { flexDirection: "column", width },
    headerRow(widths),
    ...rows.map((p) => dataRow(p, p.pid === selectedPid, widths, p.pid))
  );
}
