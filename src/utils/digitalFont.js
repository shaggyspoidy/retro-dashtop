// 5x7 dot-matrix "digital clock" font — the classic LED-sign/LCD
// bitmap style. Chunkier than a 3x5 grid, closer to a real VFD look.
// '#' = lit pixel, '.' = blank, in the source patterns below.
const GLYPH_HEIGHT = 7;
const GLYPH_WIDTH = 5;

const RAW = {
  C: [".###.", "#....", "#....", "#....", "#....", "#....", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  G: [".###.", "#....", "#....", "#.##.", "#...#", "#...#", ".###."],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

// Compile '#'/'.' patterns into actual block/space characters once,
// up front, rather than doing it on every render call.
const GLYPHS = Object.fromEntries(
  Object.entries(RAW).map(([ch, rows]) => [
    ch,
    rows.map((row) => row.replace(/#/g, "\u2588").replace(/\./g, " ")),
  ])
);

/**
 * Renders `text` as an array of GLYPH_HEIGHT strings. Characters not
 * in the table render as blank space instead of throwing, so a typo
 * doesn't crash the whole dashboard.
 */
export function renderDigitalText(text, gap = 1) {
  const chars = text.toUpperCase().split("");
  const rows = Array.from({ length: GLYPH_HEIGHT }, () => "");
  chars.forEach((ch, i) => {
    const glyph = GLYPHS[ch] || GLYPHS[" "];
    for (let r = 0; r < GLYPH_HEIGHT; r++) {
      rows[r] += glyph[r] + (i < chars.length - 1 ? " ".repeat(gap) : "");
    }
  });
  return rows;
}

export function digitalTextWidth(text, gap = 1) {
  return text.length * GLYPH_WIDTH + Math.max(0, text.length - 1) * gap;
}
