/**
 * @fileoverview Centralized color theme for RetroDash.
 * Keeps all UI components visually consistent and provides a 
 * single source of truth for standard hex codes.
 */

export const theme = {
  panelBorder: "#00D9FF", // Cyberpunk cyan for main layout borders
  amber: "#FF9500",       // Warning states (70%+ load)
  green: "#00FF9C",       // Nominal states (0-69% load)
  red: "#FF3B30",         // Critical/Redline states (90%+ load)
  cyan: "#00D9FF",        // Accents and active elements
  textPrimary: "#E8F6FF", // Bright icy white for main metric readouts
  textDim: "#5C7A82",     // Muted teal-grey for background labels and tracks
};
