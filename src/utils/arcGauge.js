// Static outline: flat bottom, left wall shorter than right wall, and
// a smooth asymmetric hump on top peaking ~75% of the way across.
// Returns one boundary height per column, in "eighths of a row" (so
// rendering can use block-eighths glyphs for sub-row smoothness).
export function arcEnvelope(width, height, {
  leftWallFrac = 0.2,
  rightWallFrac = 0.4,
  peakFrac = 0.98,
  peakPosition = 0.75,
} = {}) {
  const maxEighths = height * 8;
  const leftH = leftWallFrac * maxEighths;
  const rightH = rightWallFrac * maxEighths;
  const peakH = peakFrac * maxEighths;

  function smoothstep(t) {
    const c = Math.min(1, Math.max(0, t));
    return c * c * (3 - 2 * c);
  }

  const envelope = [];
  for (let x = 0; x < width; x++) {
    const t = width === 1 ? 0 : x / (width - 1);
    let h;
    if (t <= peakPosition) {
      h = leftH + (peakH - leftH) * smoothstep(t / peakPosition);
    } else {
      h = peakH + (rightH - peakH) * smoothstep((t - peakPosition) / (1 - peakPosition));
    }
    envelope.push(Math.round(h));
  }
  return envelope;
}

const EIGHTHS = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

// Renders the envelope as a filled silhouette — a quick shape check,
// not the final colored look.
export function renderEnvelopeOutline(envelope, height) {
  const rows = [];
  for (let r = 0; r < height; r++) {
    const rowBottomEighths = (height - 1 - r) * 8;
    let line = "";
    for (const colEighths of envelope) {
      const filled = Math.min(8, Math.max(0, colEighths - rowBottomEighths));
      line += EIGHTHS[filled];
    }
    rows.push(line);
  }
  return rows;
}

/**
 * Computes per-cell render data for the live arc graph.
 * - 'cap' cells sit exactly on the envelope's top edge — the static
 *   red boundary curve, always fully drawn regardless of load.
 * - 'fill' cells are green, beneath the cap, only in columns to the
 *   left of `litColumns` — the part that grows with load.
 * - 'empty' cells are unlit background.
 */
export function renderArcCells(envelope, height, litColumns) {
  const rows = [];
  for (let r = 0; r < height; r++) {
    const rowTopEighths = (height - r) * 8;
    const rowBottomEighths = (height - 1 - r) * 8;
    const cols = [];
    for (let x = 0; x < envelope.length; x++) {
      const colHeight = envelope[x];
      const filled = Math.min(8, Math.max(0, colHeight - rowBottomEighths));
      const isCapRow = colHeight > rowBottomEighths && colHeight <= rowTopEighths;
      let zone = "empty";
      if (filled > 0) {
        zone = isCapRow ? "cap" : x < litColumns ? "fill" : "empty";
      }
      cols.push({ char: EIGHTHS[filled], zone });
    }
    rows.push(cols);
  }
  return rows;
}
