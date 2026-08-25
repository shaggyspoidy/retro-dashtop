/**
 * @fileoverview Main Application Shell for RetroDash.
 * Manages global window resizing, core keyboard inputs (quit), 
 * and orchestrates the 30:70 flex layout split between the 
 * top dashboard and the bottom process manager.
 */

import { Box, Text, useApp, useInput } from "ink";
import { useTerminalSize } from "./hooks/useTerminalSize.js";
import { h } from "./utils/h.js";
import { theme } from "./utils/theme.js";
import { Dashboard } from "./components/Dashboard.js";
import { Mechanics } from "./components/Mechanics.js";
import { ProcessManager } from "./components/ProcessManager.js";
import { Grid } from "./components/Grid.js";
import { useSystemStats } from "./hooks/useSystemStats.js";
import { FUEL_PANEL_ROWS } from "./components/FuelGauge.js";

export function App() {
  const { exit } = useApp();
  const { width, height } = useTerminalSize();
  const stats = useSystemStats();

  // Global keybindings: quit cleanly on 'q' or 'Ctrl+C'
  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) exit();
  });

  // Set absolute minimum bounds so the UI doesn't crash in tiny windows
  const termWidth = Math.max(60, width || 100);
  const termHeight = Math.max(20, height || 40);

  // Layout Math: 1 row for header, 30% for dashboard (min 10), rest for processes (min 6)
  const headerRows = 1;
  const bodyHeight = termHeight - headerRows;
  const dashboardHeight = Math.max(FUEL_PANEL_ROWS, Math.round(bodyHeight * 0.3));
  const processHeight = Math.max(6, bodyHeight - dashboardHeight);

  // Section 2 left/right split — Mechanics (Cargo Bays + Telemetry)
  // gets ~40% width, ProcessManager gets the rest.
  const mechanicsWidth = Math.max(20, Math.floor(termWidth * 0.4));
  const processWidth = Math.max(20, termWidth - mechanicsWidth - 1);

  return h(
    Box,
    { flexDirection: "column", width: termWidth, height: termHeight, backgroundColor: theme.background },

    // --- BACKGROUND TEXTURE ---
    h(Grid, { width: termWidth, height: termHeight }),

    // --- TOP HEADER ---
        h(
      Box,
      { height: headerRows, justifyContent: "flex-end", backgroundColor: theme.background },
      h(Text, { color: theme.textDim, backgroundColor: theme.background }, "q to quit")
    ),

    // --- 30% DASHBOARD ---
    h(Dashboard, { stats, width: termWidth, height: dashboardHeight }),

    // --- 70% MECHANICS (left) + PROCESS MANAGER (right) ---
    h(
      Box,
      { flexDirection: "row", height: processHeight },
      h(Mechanics, { stats, width: mechanicsWidth, height: processHeight }),
      h(Box, { width: 1 }),
      h(ProcessManager, { processes: stats.processes, width: processWidth, height: processHeight })
    )
  );
}
