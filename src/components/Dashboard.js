import { Box } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { Powerband } from "./Powerband.js";
import { FuelGauge, FUEL_PANEL_ROWS } from "./FuelGauge.js";
import { GaugeReadout } from "./GaugeReadout.js";
import { TitledBox } from "./TitledBox.js";

// Every boxed panel here uses TitledBox now, whose embedded-title
// border costs the same overhead as the old plain bordered Box: 4
// columns (border+paddingX each side), 2 rows (title/border-top line
// + bottom border) — so this math is unchanged.
const BOX_OVERHEAD_W = 4;
const BOX_OVERHEAD_H = 2;

export function Dashboard({ stats, width, height }) {
  const interiorW = Math.max(24, width - 2);
  const interiorH = Math.max(8, height);
  const gaugeRowHeight = FUEL_PANEL_ROWS;

  const gap = 3;
  const unit = Math.max(6, Math.floor((interiorW - gap) / 5));
  const fuelWidth = unit;
  const arcWidthUnboxed = Math.floor(unit * 3);
  const clusterWidthUnboxed = interiorW - gap - fuelWidth - arcWidthUnboxed;

  const cpuOuterWidth = arcWidthUnboxed - BOX_OVERHEAD_W;
  const clusterOuterWidth = clusterWidthUnboxed + BOX_OVERHEAD_W;

  const cpuInteriorW = Math.max(6, cpuOuterWidth - BOX_OVERHEAD_W);
  // minus TitledBox chrome, minus Powerband's own value row + subLabel row
  const cpuArcHeight = Math.max(4, gaugeRowHeight - BOX_OVERHEAD_H - 2);

  const clusterInteriorW = Math.max(6, clusterOuterWidth - BOX_OVERHEAD_W);
  const clusterItemWidth = Math.max(6, Math.floor((clusterInteriorW - 2) / 3));

  return h(
    Box,
    { flexDirection: "column", width, height, paddingX: 1, backgroundColor: theme.background },
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
      h(
        TitledBox,
        { title: "CPU", width: cpuOuterWidth, height: gaugeRowHeight },
        h(Powerband, { value: stats.cpuRatio, width: cpuInteriorW, height: cpuArcHeight, subLabel: "load avg" })
      ),
      h(Box, { flexGrow: 1 }),
      h(
        TitledBox,
        { title: "STATUS", width: clusterOuterWidth, height: gaugeRowHeight },
        h(
          Box,
          { flexDirection: "row", justifyContent: "space-between", width: clusterInteriorW },
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
    )
  );
}
