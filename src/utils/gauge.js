/**
 * @fileoverview Pure rendering primitives for the RetroDash UI.
 * Transforms normalized 0.0 - 1.0 ratios into retro ASCII/Unicode visual components.
 * Zero live data or I/O is handled here.
 */

/**
 * Renders an LED segmented bar-graph, mimicking 80s digital dashboard load displays.
 * Returns an array of characters rather than a string so the UI layer can map 
 * specific colors (green/amber/red) to specific indices.
 * 
 * @param {number} ratio - The normalized metric ratio (0.0 to 1.0).
 * @param {number} [segments=20] - The total number of LED segments in the bar.
 * @returns {{ chars: string[], litCount: number }} An array of lit/unlit characters and the count of lit segments.
 */
export function ledSegments(ratio, segments = 20) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const lit = Math.round(clamped * segments);
  const chars = [];
  for (let i = 0; i < segments; i++) {
    chars.push(i < lit ? "█" : "░");
  }
  return { chars, litCount: lit };
}

/**
 * Renders a sub-character-accurate horizontal bar using Unicode block-eighths.
 * Provides a much smoother visual fill than discrete segments. Ideal for fluid gauges like battery.
 * 
 * @param {number} ratio - The normalized metric ratio (0.0 to 1.0).
 * @param {number} width - The total character width of the rendered bar.
 * @returns {string} The fully rendered string representation of the fluid bar.
 */
export function smoothBar(ratio, width) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const eighths = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];
  
  const totalEighths = Math.round(clamped * width * 8);
  const fullCells = Math.floor(totalEighths / 8);
  const remainder = totalEighths % 8;
  
  let bar = "█".repeat(Math.min(fullCells, width));
  if (fullCells < width && remainder > 0) {
    bar += eighths[remainder];
  }
  // Fill the remaining empty space with a subtle track dot
  bar += "·".repeat(Math.max(0, width - bar.length));
  
  return bar;
}

/**
 * Positions a marker diamond along a horizontal track line.
 * Ideal for indicating single-point metrics like temperature.
 * 
 * @param {number} ratio - The normalized metric ratio (0.0 to 1.0).
 * @param {number} width - The total character width of the track.
 * @returns {string} The string representation of the track with the marker in position.
 */
export function trackPosition(ratio, width) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const pos = Math.round(clamped * (width - 1));
  const track = "─".repeat(width).split("");
  track[pos] = "◆";
  return track.join("");
}

/**
 * Determines the hex color code for a given load ratio, implementing a classic 
 * VFD (Vacuum Fluorescent Display) style redline scale.
 * 
 * @param {number} ratio - The normalized metric ratio (0.0 to 1.0).
 * @returns {string} The corresponding hex color code (Green, Amber, or Red).
 */
export function colorForLoad(ratio) {
  if (ratio >= 0.9) return "#FF3B30"; // redline
  if (ratio >= 0.7) return "#FF9500"; // amber warning
  return "#00FF9C"; // nominal green
}
