// Pure table logic: sorting, truncation, cell padding. No live data,
// no Ink — same discipline as gauge.js/braille.js/arcGauge.js.

export const COLUMNS = [
  { key: "pid", label: "PID", width: 8, align: "right", hotkey: "p" },
  { key: "user", label: "USER", width: 10, align: "left", hotkey: "u" },
  { key: "pmem", label: "MEM%", width: 6, align: "right", hotkey: "m" },
  { key: "pcpu", label: "CPU%", width: 6, align: "right", hotkey: "c" },
  { key: "command", label: "COMMAND", width: null, align: "left", hotkey: "n" }, // takes remaining width
];

/**
 * Sorts a process list by a column key. Numeric columns sort
 * numerically, string columns sort case-insensitively.
 * @param {number} sortDir - 1 for ascending, -1 for descending
 */
export function sortProcesses(list, sortKey, sortDir = -1) {
  const arr = [...(list || [])];
  arr.sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (typeof av === "string" || typeof bv === "string") {
      av = (av ?? "").toString().toLowerCase();
      bv = (bv ?? "").toString().toLowerCase();
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    }
    av = av ?? 0;
    bv = bv ?? 0;
    return (av - bv) * sortDir;
  });
  return arr;
}

export function truncate(str, max) {
  const s = String(str ?? "");
  return s.length > max ? s.slice(0, Math.max(0, max - 1)) + "\u2026" : s;
}

export function padCell(str, width, align = "left") {
  const s = String(str ?? "");
  if (s.length >= width) return s.slice(0, width);
  const pad = " ".repeat(width - s.length);
  return align === "right" ? pad + s : s + pad;
}
