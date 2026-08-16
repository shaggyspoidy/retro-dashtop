#!/usr/bin/env node
import si from "systeminformation";

const procs = await si.processes();
console.log("Sample process object (real fields):\n");
console.log(JSON.stringify(procs.list[0], null, 2));
