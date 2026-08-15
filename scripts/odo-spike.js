#!/usr/bin/env node
import fs from "node:fs";

for (const path of ["/lost+found", "/", "/root", "/home"]) {
  try {
    const stat = fs.statSync(path);
    console.log(`${path}:`);
    console.log(`  birthtime: ${stat.birthtime}`);
    console.log(`  mtime:     ${stat.mtime}`);
  } catch (err) {
    console.log(`${path}: ERROR ${err.message}`);
  }
}
