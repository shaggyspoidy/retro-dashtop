import { Box } from "ink";
import { h } from "../utils/h.js";
import { Powerband } from "./Powerband.js";
import { FuelGauge, FUEL_PANEL_ROWS } from "./FuelGauge.js";
import { GaugeReadout } from "./GaugeReadout.js";
import { NetworkTrace } from "./NetworkTrace.js";

function fmtRate(bytesPerSec) {
  if (bytesPerSec >= 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  if (bytesPerSec >= 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${Math.round(bytesPerSec)} B/s`;
}

export function Dashboard({ stats, width, height }) {
  const interiorW = Math.max(24, width - 2); // paddingX: 1 on both sides
  const interiorH = Math.max(8, height);

  const netRows = Math.max(2, Math.min(6, interiorH - 4));
  const gaugeRowHeight = Math.max(FUEL_PANEL_ROWS, interiorH - netRows - 1);
  const panelWidth = Math.max(10, Math.floor((interiorW - 3) / 4));
  const arcHeight = Math.max(4, gaugeRowHeight - 2); // minus label row + sublabel row
  const clusterItemWidth = Math.max(6, Math.floor((panelWidth - 2) / 3));

  return h(
    Box,
    { flexDirection: "column", width, height, paddingX: 1 },
    h(
      Box,
      { height: gaugeRowHeight },
      h(Powerband, { label: "CPU", value: stats.cpuRatio, width: panelWidth, height: arcHeight, subLabel: "load avg" }),
      h(Box, { width: 1 }),
      h(Powerband, {
        label: "GPU",
        value: stats.gpuRatio ?? 0,
        width: panelWidth,
        height: arcHeight,
        unavailable: stats.gpuRatio === null,
        subLabel: "no sensor",
      }),
      h(Box, { width: 1 }),
      h(FuelGauge, {
        value: stats.battRatio,
        charging: stats.isCharging,
        battTimeRemainingMinutes: stats.battTimeRemainingMinutes,
        uptimeSeconds: stats.uptimeSeconds,
        width: panelWidth,
        odoDays: stats.odoDays,
      }),
      h(Box, { width: 1 }),
      h(
        Box,
        { width: panelWidth, justifyContent: "space-between" },
        h(GaugeReadout, {
          label: "TEMP",
          ratio: stats.tempRatio,
          valueLabel: stats.tempCelsius !== null ? `${Math.round(stats.tempCelsius)}\u00B0C` : "N/A",
          width: clusterItemWidth,
        }),
        h(GaugeReadout, {
          label: "OIL",
          ratio: stats.memRatio,
          valueLabel: `${Math.round(stats.memRatio * 100)}%`,
          width: clusterItemWidth,
        }),
        h(GaugeReadout, {
          label: "CGO",
          ratio: stats.cgoRatio,
          valueLabel: `${Math.round(stats.cgoRatio * 100)}%`,
          width: clusterItemWidth,
        })
      )
    ),
    h(NetworkTrace, {
      history: stats.netHistory,
      rawLabel: fmtRate(stats.netRawBytesPerSec),
      width: interiorW,
      height: netRows,
    })
  );
}
