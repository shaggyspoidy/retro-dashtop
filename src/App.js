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
import { ProcessManager } from "./components/ProcessManager.js";
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
  const dashboardHeight = Math.max(FUEL_PANEL_ROWS + 7, Math.round(bodyHeight * 0.3));
  const processHeight = Math.max(6, bodyHeight - dashboardHeight);

  return h(
    Box,
    { flexDirection: "column", width: termWidth, height: termHeight },
    
    // --- TOP HEADER ---
    h(
      Box,
      { height: headerRows, justifyContent: "space-between" },
      h(Text, { bold: true, color: theme.amber }, "◈ RETRO-DASHTOP ◈"),
      h(Text, { color: theme.textDim }, "q to quit")
    ),
    
    // --- 30% DASHBOARD ---
    h(Dashboard, {stats, width: termWidth, height: dashboardHeight }),
    
    // --- 70% PROCESS MANAGER ---
    h(ProcessManager, { width: termWidth, height: processHeight })
  );
}
