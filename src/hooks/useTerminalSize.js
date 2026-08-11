import { useStdout } from "ink";
import { useEffect, useState } from "react";

// Reads the real terminal dimensions and stays in sync with resizes.
// This is the Node-level equivalent of what htop/btop do with
// TIOCGWINSZ + SIGWINCH — we listen on stdout's 'resize' event
// (Node emits this automatically when the terminal is resized).
export function useTerminalSize() {
  const { stdout } = useStdout();
  const [size, setSize] = useState(() => ({
    width: stdout?.columns || 80,
    height: stdout?.rows || 24,
  }));

  useEffect(() => {
    if (!stdout) return;

    function updateSize() {
      setSize({ width: stdout.columns, height: stdout.rows });
    }

    updateSize(); // capture current size immediately on mount
    stdout.on("resize", updateSize);
    return () => stdout.off("resize", updateSize);
  }, [stdout]);

  return size;
}
