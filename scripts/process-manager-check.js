#!/usr/bin/env node
import { render } from "ink";
import { h } from "../src/utils/h.js";
import { ProcessManager } from "../src/components/ProcessManager.js";

const users = ["root", "sunsetz"];
const commands = ["node", "ollama", "Xwayland", "openvpn", "kitty", "systemd", "kworker", "bash"];
const fakeProcesses = Array.from({ length: 30 }, (_, i) => ({
  pid: 99000 + i, // safely fake — won't collide with anything real
  user: users[i % users.length],
  pmem: Math.round(Math.random() * 30),
  pcpu: Math.round(Math.random() * 60),
  command: commands[i % commands.length],
}));

render(h(ProcessManager, { processes: fakeProcesses, width: 70, height: 20 }));
