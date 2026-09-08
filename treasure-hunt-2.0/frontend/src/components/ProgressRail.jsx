const ICON = { completed: '\u2713', current: '\u25CF', locked: '\uD83D\uDD12' };

export default function ProgressRail({ progress }) {
  if (!progress || progress.length === 0) return null;

  return (
    <div className="th-flex-col" style={{ gap: 8 }}>
      <div className="th-progress-rail">
        {progress.map((p) => (
          <div
            key={p.round}
            className={`th-progress-node ${p.status === 'completed' ? 'is-completed' : p.status === 'current' ? 'is-current' : ''}`}
          />
        ))}
      </div>
      <div className="th-progress-labels">
        {progress.map((p) => (
          <span key={p.round}>
            R{p.round} {ICON[p.status]}
          </span>
        ))}
      </div>
    </div>
  );
}
