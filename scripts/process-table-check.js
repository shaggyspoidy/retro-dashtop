#!/usr/bin/env node
import { COLUMNS, sortProcesses, truncate, padCell } from "../src/utils/processTable.js";

const fakeProcesses = [
  { pid: 1024, user: "root", pmem: 2, pcpu: 4, command: "Xwayland" },
  { pid: 2048, user: "sunsetz", pmem: 12, pcpu: 20, command: "node" },
  { pid: 3192, user: "sunsetz", pmem: 25, pcpu: 45, command: "ollama" },
  { pid: 4012, user: "root", pmem: 8, pcpu: 12, command: "openvpn" },
  { pid: 5300, user: "sunsetz", pmem: 1, pcpu: 0, command: "a-very-long-process-name-that-should-truncate" },
];

for (const [key, label] of [["pcpu", "CPU% desc"], ["pmem", "MEM% desc"], ["user", "USER asc"]]) {
  const dir = label.includes("asc") ? 1 : -1;
  console.log(`\n--- sorted by ${label} ---`);
  const sorted = sortProcesses(fakeProcesses, key, dir);
  console.log(COLUMNS.map((c) => padCell(c.label, c.width || 20, c.align)).join(" "));
  for (const p of sorted) {
    console.log(
      COLUMNS.map((c) => padCell(c.key === "command" ? truncate(p[c.key], 20) : p[c.key], c.width || 20, c.align)).join(" ")
    );
  }
}
