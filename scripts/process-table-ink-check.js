#!/usr/bin/env node
import { render } from "ink";
import { h } from "../src/utils/h.js";
import { ProcessTable } from "../src/components/ProcessTable.js";

const fakeProcesses = [
  { pid: 1024, user: "root", pmem: 2, pcpu: 4, command: "Xwayland" },
  { pid: 2048, user: "sunsetz", pmem: 12, pcpu: 20, command: "node" },
  { pid: 3192, user: "sunsetz", pmem: 25, pcpu: 45, command: "ollama" },
  { pid: 4012, user: "root", pmem: 8, pcpu: 12, command: "openvpn" },
  { pid: 5300, user: "sunsetz", pmem: 1, pcpu: 0, command: "a-very-long-process-name-that-should-truncate" },
];

render(
  h(ProcessTable, {
    processes: fakeProcesses,
    sortKey: "pcpu",
    sortDir: -1,
    selectedPid: 3192, // ollama should render highlighted
    scrollTop: 0,
    visibleRows: 10,
    width: 60,
  })
);

