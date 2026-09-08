import { useEffect, useState } from 'react';

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// Ticks smoothly on the client for display, but always resyncs to the
// server-reported `baseSeconds` whenever a fresh poll comes in — the
// server's clock is the only one that counts for scoring/ranking.
export default function Timer({ baseSeconds = 0 }) {
  const [seconds, setSeconds] = useState(baseSeconds);

  useEffect(() => {
    setSeconds(baseSeconds);
  }, [baseSeconds]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="th-timer">{formatDuration(seconds)}</span>;
}

export { formatDuration };
