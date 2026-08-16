import { Box } from "ink";
import { h } from "../utils/h.js";
import { Powerband } from "./Powerband.js";
import { FuelGauge, FUEL_PANEL_ROWS } from "./FuelGauge.js";
import { GaugeReadout } from "./GaugeReadout.js";

export function Dashboard({ stats, width, height }) {
  const interiorW = Math.max(24, width - 2); // paddingX: 1 on both sides
  const interiorH = Math.max(8, height);
  const gaugeRowHeight = FUEL_PANEL_ROWS; // real content height — don't stretch to fill available space
  const arcHeight = Math.max(4, gaugeRowHeight - 2); // minus label row + sublabel row

  // Weighted split instead of an even 4-way: CPU/GPU arcs read better
  // with more horizontal room than FUEL or the TEMP/OIL/CGO cluster.
  const gap = 3; // 1 char between each of the 4 panels
  const unit = Math.max(6, Math.floor((interiorW - gap) / 5));
  const fuelWidth = unit;
  const arcWidth = Math.floor(unit * 3);
  const clusterWidth = interiorW - gap - fuelWidth - arcWidth;
  const clusterItemWidth = Math.max(6, Math.floor((clusterWidth - 2) / 3));

  return h(
    Box,
    { flexDirection: "column", width, height, paddingX: 1 },
    h(
      Box,
      { height: gaugeRowHeight },
      h(FuelGauge, {
        value: stats.battRatio,
        charging: stats.isCharging,
        battTimeRemainingMinutes: stats.battTimeRemainingMinutes,
        uptimeSeconds: stats.uptimeSeconds,
        width: fuelWidth,
        odoDays: stats.odoDays,
      }),
      h(Box, { width: 1 }),
      h(Powerband, { label: "CPU", value: stats.cpuRatio, width: arcWidth, height: arcHeight, subLabel: "load avg" }),
      h(Box, { flexGrow: 1 }),
      h(
        Box,
        { width: clusterWidth, justifyContent: "space-between" },
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
    )
  );
}
