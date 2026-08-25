import { useMemo } from "react";
import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { BrailleCanvas } from "../utils/braille.js";
import { formatRate, formatBytesTotal } from "../utils/calculations.js";
import { TitledBox } from "./TitledBox.js";

const UPLOAD_COLOR = theme.panelBorder;
const DOWNLOAD_COLOR = theme.green;

function Trace({ history, width, height, color }) {
  const lines = useMemo(() => {
    const canvas = new BrailleCanvas(width, height);
    canvas.plotSeries(history || []);
    return canvas.toLines();
  }, [history, width, height]);
  return h(
    Box,
    { flexDirection: "column" },
    ...lines.map((l, i) => h(Text, { key: i, color }, l || " "))
  );
}

export function Telemetry({ stats, width, height }) {
  const interiorW = Math.max(20, width - 4);
  const interiorH = Math.max(6, height - 2);
  // minus the 2 rate-label rows only — no separate title row to
  // account for anymore, it's embedded in the border now
  const traceRows = Math.max(1, Math.floor((interiorH - 2) / 2));

  return h(
    TitledBox,
    { title: "TELEMETRY", width, height },
    h(Text, { color: theme.textDim },
      `\u2191 ${formatRate(stats.uploadRateBytesPerSec)}  Top ${formatRate(stats.uploadPeakBytesPerSec)}  Total ${formatBytesTotal(stats.uploadTotalBytes)}`),
    h(Trace, { history: stats.uploadHistory, width: interiorW, height: traceRows, color: UPLOAD_COLOR }),
    h(Text, { color: theme.textDim },
      `\u2193 ${formatRate(stats.downloadRateBytesPerSec)}  Top ${formatRate(stats.downloadPeakBytesPerSec)}  Total ${formatBytesTotal(stats.downloadTotalBytes)}`),
    h(Trace, { history: stats.downloadHistory, width: interiorW, height: traceRows, color: DOWNLOAD_COLOR })
  );
}
