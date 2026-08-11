/**
 * @fileoverview Placeholder Process Manager Component.
 * Used to verify the layout footprint of the process table before
 * implementing the complex sorting and scrolling logic.
 */

import { Box, Text } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";

export function ProcessManager({ width, height }) {
  return h(
    Box,
    {
      width,
      height,
      borderStyle: "round",
      borderColor: theme.textDim, // Using a dimmer border to keep focus on the main dashboard
      paddingX: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    },
    h(Text, { color: theme.textDim }, "[ process table placeholder — sortable/scrollable list ]")
  );
}
