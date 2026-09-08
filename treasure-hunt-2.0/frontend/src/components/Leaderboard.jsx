import { formatDuration } from './Timer';

export default function Leaderboard({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="th-muted th-center-text">No teams have started yet.</p>;
  }

  return (
    <div className="th-flex-col" style={{ gap: 10 }}>
      {rows.map((row) => (
        <div key={row.teamId} className={`th-leaderboard-row ${row.rank === 1 ? 'is-leader' : ''}`}>
          <span className="th-rank">#{row.rank}</span>
          <div>
            <div className="th-team-name">
              {row.teamName}
              {row.members && row.members.length > 0 && (
                <span className="th-muted" style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                  ({row.members.join(', ')})
                </span>
              )}
            </div>
            <div className="th-team-meta">
              {row.status === 'COMPLETED'
                ? `Finished in ${formatDuration(row.completionSeconds)}`
                : row.currentRound === 0
                ? 'Not started'
                : `Round ${row.currentRound} of 5`}
            </div>
          </div>
          <span className="th-badge" style={{ justifySelf: 'end' }}>
            {row.status === 'COMPLETED' ? '🏆 DONE' : row.currentRound === 0 ? '—' : 'PLAYING'}
          </span>
          <span className="th-score">{row.score} pts</span>
        </div>
      ))}
    </div>
  );
}
