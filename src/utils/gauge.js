/**
 * @fileoverview Pure rendering primitives for the RetroDash UI.
 * Transforms normalized 0.0 - 1.0 ratios into retro ASCII/Unicode visual components.
 * Zero live data or I/O is handled here.
 */

import { theme } from "./theme.js"

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
 * Computes lit/unlit state for a vertical stack of segments, like a
 * fuel gauge or oil-pressure cell stack. Fills from the bottom up as
 * ratio increases, matching how a real gauge behaves.
 *
 * @param {number} ratio - The normalized metric ratio (0.0 to 1.0).
 * @param {number} [segmentCount=8] - Total number of stacked segments.
 * @returns {boolean[]} Lit state per row, index 0 = topmost segment.
 */
export function verticalSegments(ratio, segmentCount = 8) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const lit = Math.round(clamped * segmentCount);
  const rows = [];
  for (let i = 0; i < segmentCount; i++) {
    const segmentIndexFromBottom = segmentCount - 1 - i;
    rows.push(segmentIndexFromBottom < lit);
  }
  return rows;
}

/**
 * Converts a hex color string to its RGB components.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Linearly interpolates between two hex colors.
 * @param {string} hexA
 * @param {string} hexB
 * @param {number} t - 0 = hexA, 1 = hexB
 * @returns {string} hex color
 */
function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const lerp = (x, y) => Math.round(x + (y - x) * t);
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(lerp(a.r, b.r))}${toHex(lerp(a.g, b.g))}${toHex(lerp(a.b, b.b))}`;
}

/**
 * Maps a 0..1 position to a color along the green -> amber -> red
 * VFD gradient, for per-segment zone coloring on stacked gauges.
 * Stays entirely within the SRS-approved phosphor palette — this is
 * a blend between existing theme colors, not new hues.
 * @param {number} t - 0 = green end, 1 = red end
 * @returns {string} hex color
 */
export function gradientColor(t) {
  const clamped = Math.min(1, Math.max(0, t));
  if (clamped < 0.5) {
    return lerpColor(theme.green, theme.amber, clamped / 0.5);
  }
  return lerpColor(theme.amber, theme.red, (clamped - 0.5) / 0.5);
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
  if (ratio >= 0.9) return theme.red;
  if (ratio >= 0.7) return theme.amber;
  return theme.green;
}

/**
 * Hard-cutoff zone color (no blending) — green/amber/red snap
 * distinctly at fixed thresholds, unlike gradientColor's smooth lerp.
 */
export function zoneColor(t) {
  if (t >= 0.85) return theme.red;
  if (t >= 0.6) return theme.amber;
  return theme.green;
}

/**
 * A vertical scale track: mostly "│" with a single marker row
 * showing the current position, like an analog gauge needle —
 * distinct from verticalSegments' filled-from-bottom LED style.
 * Row 0 = top of the track (highest value end).
 */
export function verticalTrackPosition(ratio, height) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const markerRow = Math.round((1 - clamped) * (height - 1));
  const rows = [];
  for (let i = 0; i < height; i++) {
    rows.push(i === markerRow ? "marker" : "track");
  }
  return rows;
}
