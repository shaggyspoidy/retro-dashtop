/**
 * @fileoverview Fuel Gauge Component.
 *
 * Renders the FUEL panel as a btop-style titled box (title embedded
 * directly in the top border line, via TitledBox) containing:
 *   - a REFUELING indicator — always visible; bright amber while
 *     charging, dim grey ("unlit bulb") otherwise
 *   - F / ½ / E scale markers sitting just outside a second, TIGHT
 *     single-line border that hugs only the segmented LED gauge
 *   - TRIP (remaining battery time, or uptime while charging)
 *   - ODO (days since OS install)
 *
 * Two borders are intentional, not a mistake: the outer TitledBox
 * groups the whole panel (consistent with every other Section 1
 * panel now), while the inner border is the literal "physical gauge
 * cell" from the reference photo — it only wraps the LED bar itself.
 */
import { Box, Text } from "ink";
import { tripReadout, odoReadout } from "../utils/calculations.js";
import { ChargingIndicator } from "./ChargingIndicator.js";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { VerticalGauge, gaugeVisualRows } from "./VerticalGauge.js";
import { TitledBox } from "./TitledBox.js";

const GAUGE_ROWS = gaugeVisualRows();
// +2 accounts for the tight inner border's own top/bottom edge.
const TRACK_HEIGHT = GAUGE_ROWS + 2;

/**
 * Total terminal rows this panel needs, derived (not guessed) from
 * its actual content — Dashboard.js uses this to size the row that
 * holds every Section 1 panel.
 *
 *   TitledBox title line       (1)
 * + gauge row (REFUELING column stretches to match TRACK_HEIGHT)
 * + TRIP line                  (1)
 * + ODO line                   (1)
 * + TitledBox's own bottom border (1)
 */
export const FUEL_PANEL_ROWS = 1 + TRACK_HEIGHT + 1 + 1 + 1 + 1; // + 1 new row for the LEVEL % readout

export function FuelGauge({ value, charging, battTimeRemainingMinutes, uptimeSeconds, odoDays, width = 20 }) {
  const hasBattery = value !== null && value !== undefined;
  const ratio = hasBattery ? value : 0;

  return h(
    TitledBox,
    { title: "FUEL", width, height: FUEL_PANEL_ROWS },

    h(
      Box,
      { flexDirection: "row" },
      h(
        Box,
        { flexDirection: "column", alignItems: "center", justifyContent: "center", marginRight: 1 },
        h(ChargingIndicator, { charging })
      ),
      h(
        Box,
        { flexDirection: "column", justifyContent: "space-between", marginRight: 1 },
        h(Text, { color: theme.textDim }, "F"),
        h(Text, { color: theme.textDim }, "\u00BD"), // ½
        h(Text, { color: theme.textDim }, "E")
      ),
      h(
        Box,
        { borderStyle: "single", borderColor: theme.textDim, paddingX: 1 },
        h(VerticalGauge, { ratio })
      )
    ),

    h(Text, { bold: true, color: theme.textPrimary }, hasBattery ? `${Math.round(ratio * 100)}%` : "N/A"),

    h(Text, { color: theme.textDim }, tripReadout({      
      isCharging: charging,
      hasBattery,
      timeRemainingMinutes: battTimeRemainingMinutes,
      uptimeSeconds,
    })),

    h(Text, { color: theme.textDim }, odoReadout(odoDays))
  );
}
