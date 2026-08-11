/**
 * @fileoverview Sub-pixel Braille Canvas.
 * Each glyph is a 2x4 dot matrix, giving 2x horizontal and 4x vertical 
 * resolution over plain block chars. Used to draw a smooth 
 * oscilloscope-style trace in just a few terminal rows.
 */

const BASE = 0x2800; // The base Unicode hex for an empty Braille character

// Bitmasks for activating specific dots in the 2x4 Braille grid
const LEFT_BITS = [0x01, 0x02, 0x04, 0x40];
const RIGHT_BITS = [0x08, 0x10, 0x20, 0x80];

export class BrailleCanvas {
  /**
   * Initializes a high-performance sub-pixel drawing canvas.
   * 
   * @param {number} cols - The width of the canvas in terminal characters.
   * @param {number} rows - The height of the canvas in terminal characters.
   */
  constructor(cols, rows) {
    this.cols = Math.max(1, cols);
    this.rows = Math.max(1, rows);
    
    // Actual sub-pixel resolution is 2x width and 4x height
    this.width = this.cols * 2;
    this.height = this.rows * 4;
    
    // 1D typed array for maximum memory efficiency and speed
    this.cells = new Uint8Array(this.cols * this.rows);
  }

  /**
   * Wipes the canvas clean by zeroing out the typed array.
   */
  clear() {
    this.cells.fill(0);
  }

  /**
   * Turns on a specific sub-pixel dot using bitwise operations.
   * 
   * @param {number} x - The x-coordinate (0 to this.width - 1).
   * @param {number} y - The y-coordinate (0 to this.height - 1).
   */
  set(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    
    const cellX = x >> 1; // Equivalent to Math.floor(x / 2)
    const cellY = y >> 2; // Equivalent to Math.floor(y / 4)
    
    // Determine which dot to flip based on odd/even coordinates
    const bit = x & 1 ? RIGHT_BITS[y & 3] : LEFT_BITS[y & 3];
    
    // Activate the dot via bitwise OR
    this.cells[cellY * this.cols + cellX] |= bit;
  }

  /**
   * Draws a continuous line between two points using Bresenham's algorithm.
   * 
   * @param {number} x0 - Starting x-coordinate.
   * @param {number} y0 - Starting y-coordinate.
   * @param {number} x1 - Ending x-coordinate.
   * @param {number} y1 - Ending y-coordinate.
   */
  line(x0, y0, x1, y1) {
    x0 = Math.round(x0); y0 = Math.round(y0);
    x1 = Math.round(x1); y1 = Math.round(y1);
    
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    
    for (;;) {
      this.set(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  /**
   * Plots a normalized (0.0 to 1.0) series as a connected trace, 
   * placing the most recent sample on the right like a scrolling scope.
   * 
   * @param {number[]} values - Array of normalized data points.
   */
  plotSeries(values) {
    this.clear();
    const w = this.width;
    if (!values || values.length === 0) return;
    
    const series = values.slice(-w);
    const offset = w - series.length;
    
    const yFor = (v) => {
      const clamped = Math.min(1, Math.max(0, v));
      return Math.round((1 - clamped) * (this.height - 1));
    };
    
    let prevX = null, prevY = null;
    series.forEach((v, i) => {
      const x = offset + i;
      const y = yFor(v);
      
      if (prevX !== null) this.line(prevX, prevY, x, y);
      else this.set(x, y);
      
      prevX = x; prevY = y;
    });
  }

  /**
   * Converts the internal pixel matrix into standard Unicode Braille characters.
   * 
   * @returns {string[]} An array of strings, where each string represents one terminal row.
   */
  toLines() {
    const lines = [];
    for (let r = 0; r < this.rows; r++) {
      let line = "";
      for (let c = 0; c < this.cols; c++) {
        // Construct the final Unicode character by adding the bitmask to the base hex
        line += String.fromCodePoint(BASE + this.cells[r * this.cols + c]);
      }
      lines.push(line);
    }
    return lines;
  }
}
