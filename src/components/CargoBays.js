import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { smoothBar } from "../utils/gauge.js";

const LABEL_WIDTH = 10; // "Used: 100%" / "Free: 100%"
const VALUE_WIDTH = 10; // "999.9 GiB"
const FREE_COLOR = theme.panelBorder; // same green family, muted — distinct from Used's bright green

function fmtGiB(n) {
  return `${n.toFixed(1)} GiB`;
}

function statRow({ key, label, ratio, valueLabel, color, barWidth }) {
  const pct = Math.round(ratio * 100);
  return h(
    Box,
    { key, flexDirection: "row" },
    h(Text, { color: theme.textDim }, `${label}: ${String(pct).padStart(3)}%`.padEnd(LABEL_WIDTH + 1) + " "),
    h(Text, { color }, smoothBar(ratio, barWidth)),
    h(Text, { color: theme.textDim }, valueLabel.padStart(VALUE_WIDTH))
  );
}

// Each partition renders as a distinct "block": name+size header,
// then Used and Free as two separate bars — both in the green
// family, no load-based amber/red here.
export function CargoBays({ disks, width, height }) {
  const barWidth = Math.max(6, width - LABEL_WIDTH - VALUE_WIDTH - 5);
  const rows = disks || [];

  return h(
    Box,
    { width, height, borderStyle: "round", borderColor: theme.panelBorder, paddingX: 1, flexDirection: "column" },
    h(Text, { bold: true, color: theme.green }, "CARGO BAYS"),
    ...(rows.length === 0
      ? [h(Text, { color: theme.textDim }, "no volumes found")]
      : rows.flatMap((d, i) =>
          [
            i > 0 ? h(Text, { key: `${d.mount}-div`, color: theme.textDim }, "\u00B7".repeat(Math.max(4, width - 4))) : null,
            h(
              Box,
              { key: `${d.mount}-head`, flexDirection: "row", justifyContent: "space-between" },
              h(Text, { bold: true, color: theme.textPrimary }, d.mount),
              h(Text, { bold: true, color: theme.textDim }, fmtGiB(d.sizeGiB))
            ),
            statRow({ key: `${d.mount}-used`, label: "Used", ratio: d.ratio, valueLabel: fmtGiB(d.usedGiB), color: theme.green, barWidth }),
            statRow({ key: `${d.mount}-free`, label: "Free", ratio: 1 - d.ratio, valueLabel: fmtGiB(d.sizeGiB - d.usedGiB), color: FREE_COLOR, barWidth }),
          ].filter(Boolean)
        ))
  );
}
