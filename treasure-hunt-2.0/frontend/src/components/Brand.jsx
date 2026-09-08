export default function Brand({ eventName = 'TREASURE HUNT 2.0', tagline = 'SCAN. SOLVE. SEARCH. CONQUER.', small = false }) {
  return (
    <div className="th-brand">
      {!small && <span className="th-brand-mark">◆ VVCE CSI CHAPTER PRESENTS ◆</span>}
      <h1 style={small ? { fontSize: 20 } : undefined}>{eventName}</h1>
      <span className="th-tagline">{tagline}</span>
    </div>
  );
}
