/**
 * @fileoverview Placeholder Dashboard Component.
 * Used strictly to verify Flexbox layout, border rendering, and terminal 
 * dimension awareness before injecting live data in Phase 4.
 */

import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

// PLACEHOLDER values - Phase 4 replaces these with real ratios from
// useSystemStats(). Layout correctness is being tested here, not data.
export function Dashboard({ width, height }) {
  return h(
    Box,
    {
      width,
      height,
      borderStyle: "round",
      borderColor: theme.panelBorder,
      paddingX: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center" // Ensures the text sits perfectly in the middle
    },
    h(Text, { color: theme.textDim }, "[ dashboard placeholder — CPU / GPU / FUEL / TEMP / NET ]")
  );
}
