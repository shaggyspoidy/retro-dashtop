import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import { h } from "../utils/h.js";
import { theme } from "../utils/theme.js";
import { ProcessTable } from "./ProcessTable.js";
import { COLUMNS, sortProcesses } from "../utils/processTable.js";
import { TitledBox } from "./TitledBox.js";

export function ProcessManager({ processes, width, height }) {
  const [sortKey, setSortKey] = useState("pcpu");
  const [sortDir, setSortDir] = useState(-1);
  const [selectedPid, setSelectedPid] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [pendingKillPid, setPendingKillPid] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const statusTimer = useRef(null);

  // Used for our own selection/scroll bookkeeping only — ProcessTable
  // independently sorts the raw `processes` it's given, so both stay
  // in sync without either one trusting the other's internal state.
  const sorted = useMemo(() => sortProcesses(processes, sortKey, sortDir), [processes, sortKey, sortDir]);

  const selectedIndex = useMemo(() => {
    if (sorted.length === 0) return -1;
    const idx = sorted.findIndex((p) => p.pid === selectedPid);
    return idx === -1 ? 0 : idx;
  }, [sorted, selectedPid]);

  // Follow selection by PID across data refreshes — falls back to
  // the first row on first load, or if the selected process exited.
  useEffect(() => {
    if (sorted.length === 0) return;
    if (selectedPid === null || !sorted.some((p) => p.pid === selectedPid)) {
      setSelectedPid(sorted[0].pid);
    }
  }, [sorted, selectedPid]);

  // column header(1) + footer(1) + TitledBox chrome(2: title/border-top
  // line + bottom border) — no separate title row to account for anymore
  const visibleRows = Math.max(1, height - 4);

  useEffect(() => {
    if (selectedIndex < 0) return;
    if (selectedIndex < scrollTop) {
      setScrollTop(Math.max(0, selectedIndex));
    } else if (selectedIndex >= scrollTop + visibleRows) {
      setScrollTop(Math.max(0, selectedIndex - visibleRows + 1));
    }
  }, [selectedIndex, visibleRows, scrollTop]);

  function flash(msg) {
    setStatusMsg(msg);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatusMsg(null), 2500);
  }
  useEffect(() => () => statusTimer.current && clearTimeout(statusTimer.current), []);

  useInput((input, key) => {
    if (pendingKillPid !== null) {
      if (input === "y" || input === "Y") {
        const pid = pendingKillPid;
        try {
          process.kill(pid, "SIGTERM");
          flash(`Sent SIGTERM to PID ${pid}`);
        } catch (err) {
          flash(`Failed to signal PID ${pid}: ${err.code || err.message}`);
        }
      } else {
        flash("Kill cancelled");
      }
      setPendingKillPid(null);
      return;
    }

    if (key.downArrow || input === "j") {
      if (sorted.length) setSelectedPid(sorted[Math.min(sorted.length - 1, selectedIndex + 1)].pid);
      return;
    }
    if (key.upArrow || input === "k") {
      if (sorted.length) setSelectedPid(sorted[Math.max(0, selectedIndex - 1)].pid);
      return;
    }
    if (input === "g") {
      if (sorted.length) setSelectedPid(sorted[0].pid);
      return;
    }
    if (input === "G") {
      if (sorted.length) setSelectedPid(sorted[sorted.length - 1].pid);
      return;
    }
    if (key.pageDown) {
      if (sorted.length) setSelectedPid(sorted[Math.min(sorted.length - 1, selectedIndex + visibleRows)].pid);
      return;
    }
    if (key.pageUp) {
      if (sorted.length) setSelectedPid(sorted[Math.max(0, selectedIndex - visibleRows)].pid);
      return;
    }

    const col = COLUMNS.find((c) => c.hotkey === input);
    if (col) {
      setSortDir((prevDir) => (sortKey === col.key ? -prevDir : -1));
      setSortKey(col.key);
      return;
    }
    if (key.tab) {
      const idx = COLUMNS.findIndex((c) => c.key === sortKey);
      setSortKey(COLUMNS[(idx + 1) % COLUMNS.length].key);
      setSortDir(-1);
      return;
    }

    if ((input === "x" || key.delete || key.return) && sorted.length) {
      setPendingKillPid(sorted[selectedIndex].pid);
    }
  });

  const maxScrollTop = Math.max(0, sorted.length - visibleRows);
  const safeScrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));
  const hotkeys = COLUMNS.filter((c) => c.hotkey).map((c) => c.hotkey).join("/");

  return h(
    TitledBox,
    { title: "PROCESSES", width, height },
    h(ProcessTable, {
      processes,
      sortKey,
      sortDir,
      selectedPid: sorted[selectedIndex]?.pid ?? null,
      scrollTop: safeScrollTop,
      visibleRows,
      width: width - 4, // border(2) + paddingX(2)
    }),
    h(
      Box,
      { justifyContent: "space-between" },
      h(
        Text,
        { color: pendingKillPid !== null ? theme.red : theme.textDim },
        pendingKillPid !== null
          ? `Send SIGTERM to PID ${pendingKillPid}? (y/n)`
          : statusMsg || `\u2191\u2193/jk nav  g/G top/bot  ${hotkeys} sort  x/Enter kill  q quit`
      ),
      h(Text, { color: theme.textDim }, `${sorted.length} procs`)
    )
  );
}
