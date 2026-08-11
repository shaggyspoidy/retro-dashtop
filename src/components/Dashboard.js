import { Box } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { Powerband } from "./Powerband.js";
import { FuelGauge } from "./FuelGauge.js";
import { TempSlider } from "./TempSlider.js";
import { NetworkTrace } from "./NetworkTrace.js";

function fmtRate(bytesPerSec) {
  if (bytesPerSec >= 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  if (bytesPerSec >= 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${Math.round(bytesPerSec)} B/s`;
}

export function Dashboard({ stats, width, height }) {
  const interiorW = Math.max(24, width - 2);
  const interiorH = Math.max(8, height - 2);

  const netRows = Math.max(2, Math.min(6, interiorH - 4));
  const gaugeRowHeight = Math.max(3, interiorH - netRows - 1);

  const panelWidth = Math.max(10, Math.floor((interiorW - 3) / 4));

  return h(
    Box,
    {
      flexDirection: "column",
      width,
      height,
      borderStyle: "round",
      borderColor: theme.panelBorder,
      paddingX: 1,
    },
    h(
      Box,
      { height: gaugeRowHeight },
      h(Powerband, { label: "CPU", value: stats.cpuRatio, width: panelWidth, subLabel: "load avg" }),
      h(Box, { width: 1 }),
      h(Powerband, {
        label: "GPU",
        value: stats.gpuRatio ?? 0,
        width: panelWidth,
        unavailable: stats.gpuRatio === null,
        subLabel: "no sensor",
      }),
      h(Box, { width: 1 }),
      h(FuelGauge, { value: stats.battRatio, charging: stats.isCharging, width: panelWidth }),
      h(Box, { width: 1 }),
      h(TempSlider, { ratio: stats.tempRatio, celsius: stats.tempCelsius, width: panelWidth })
    ),
    h(NetworkTrace, {
      history: stats.netHistory,
      rawLabel: fmtRate(stats.netRawBytesPerSec),
      width: interiorW,
      height: netRows,
    })
  );
}
