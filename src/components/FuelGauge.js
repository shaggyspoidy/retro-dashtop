/**
 * @fileoverview Fuel Gauge Component.
 * Displays battery life as a vertical fluid tank, along with 
 * retro-styled Odometer (OS age) and Trip (uptime) readouts.
 */

import { Box, Text } from "ink";
import { tripReadout, odoReadout } from "../utils/calculations.js";
import { ChargingIndicator } from "./ChargingIndicator.js";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

import { VerticalGauge, gaugeVisualRows } from "./VerticalGauge.js";

const GAUGE_ROWS = gaugeVisualRows();
const TRACK_HEIGHT = GAUGE_ROWS + 2; // +2 for the bordered box's top/bottom edge

// Total rows this whole panel needs, derived (not guessed) — used by
// Dashboard.js to size the row that holds every Section 1 panel.
export const FUEL_PANEL_ROWS =
  1 /* FUEL label */ + 1 /* diamond */ + 1 /* REFUELING */ + 1 /* marginTop */ +
  TRACK_HEIGHT + 1 /* TRIP */ + 1 /* ODO */;


// NOTE: scoped exception to SRS 5.2's "no borders in Section 1" -
// FUEL specifically gets an outline to match the physical gauge cell
// in the reference photo. CPU/GPU/TEMP/OIL/CGO stay border-free.
export function FuelGauge({ value, charging, battTimeRemainingMinutes, uptimeSeconds, odoDays, width = 20 }) {
  const hasBattery = value !== null && value !== undefined;
  const ratio = hasBattery ? value : 0;

  return h(
    Box,
    { flexDirection: "column", justifyContent: "space-between", marginRight: 1 },
    // The simple green FUEL label
    h(Text, { bold: true, color: theme.green }, "FUEL"),
    h(ChargingIndicator, { charging }),
    
    h(
      Box,
      { flexDirection: "row", marginTop: 1 },
      h(
        Box,
        { flexDirection: "column", justifyContent: "space-between", height: 14, marginRight: 1 },
        h(Text, { color: theme.textDim }, "F"),
        h(Text, { color: theme.textDim }, "\u00BD"), // 1/2 symbol
        h(Text, { color: theme.textDim }, "E")
      ),
      h(
        Box,
        { borderStyle: "single", borderColor: theme.textDim, paddingX: 1 },
        h(VerticalGauge, { ratio })
      )
    ),
    
    // Trip (Uptime) Readout
    h(Text, { color: theme.textDim }, tripReadout({
      isCharging: charging,
      hasBattery: value !== null && value !== undefined,
      timeRemainingMinutes: battTimeRemainingMinutes,
      uptimeSeconds,
    })),
    
    // Odometer (OS Install Age) Readout
    h(Text, { color: theme.textDim }, odoReadout(odoDays))
  );
}
