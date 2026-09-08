import { useEffect, useRef } from 'react';

// Repeatedly calls `callback` every `intervalMs` while `enabled` is true.
// Always fires once immediately on mount/enable, then on the interval.
export function usePolling(callback, intervalMs, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    const tick = () => {
      if (!cancelled) savedCallback.current();
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}
