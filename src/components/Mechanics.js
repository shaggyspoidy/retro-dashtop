import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { CargoBays } from "./CargoBays.js";
import { Telemetry } from "./Telemetry.js";

// Section 2 left column: Cargo Bays (per-disk breakdown) stacked on
// top of Telemetry (network waveform). Both placeholders for now.
export function Mechanics({ stats, width, height }) {
  const cargoHeight = Math.max(4, Math.floor(height / 2));
  const telemetryHeight = Math.max(4, height - cargoHeight);

  return h(
    Box,
    { flexDirection: "column", width, height },
    h(CargoBays, { disks: stats.disks, width, height: cargoHeight }),
    h(Telemetry, { stats, width, height: telemetryHeight })
  );
}
