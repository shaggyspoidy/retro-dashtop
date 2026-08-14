import { Box, Text } from "ink";
import { ChargingIndicator } from "./ChargingIndicator.js";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { VerticalGauge } from "./VerticalGauge.js";

// NOTE: scoped exception to SRS 5.2's "no borders in Section 1" -
// FUEL specifically gets an outline to match the physical gauge cell
// in the reference photo. CPU/GPU/TEMP/OIL/CGO stay border-free.
export function FuelGauge({ value, charging, width = 20 }) {
  const hasBattery = value !== null && value !== undefined;
  const ratio = hasBattery ? value : 0;

  return h(
    Box,
    { flexDirection: "column", width, alignItems: "center" },
    
    // The simple green FUEL label requested by the guide
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
    
  );
}
