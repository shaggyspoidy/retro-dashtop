import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

// Section 2 left column: Cargo Bays (per-disk breakdown) stacked on
// top of Telemetry (network waveform). Both placeholders for now.
export function Mechanics({ width, height }) {
  const cargoHeight = Math.max(4, Math.floor(height / 2));
  const telemetryHeight = Math.max(4, height - cargoHeight);

  return h(
    Box,
    { flexDirection: "column", width, height },
    h(
      Box,
      {
        width,
        height: cargoHeight,
        borderStyle: "round",
        borderColor: theme.panelBorder,
        paddingX: 1,
        justifyContent: "center",
      },
      h(Text, { color: theme.textDim }, "[ CARGO BAYS placeholder ]")
    ),
    h(
      Box,
      {
        width,
        height: telemetryHeight,
        borderStyle: "round",
        borderColor: theme.panelBorder,
        paddingX: 1,
        justifyContent: "center",
      },
      h(Text, { color: theme.textDim }, "[ TELEMETRY placeholder ]")
    )
  );
}
