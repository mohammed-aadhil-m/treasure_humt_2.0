import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { api } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

function Stat({ label, value }) {
  return (
    <div className="th-stat-card">
      <div className="th-stat-value">{value}</div>
      <div className="th-stat-label">{label}</div>
    </div>
  );
}

export default function AdminTeamDetail() {
  const { id } = useParams();
  const { token, logout } = useAdmin();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api
      .adminTeamDetail(token, id)
      .then(setData)
      .catch((err) => {
        setError(err.message || 'Failed to load team details.');
        if (/unauthorized|forbidden|jwt|token|401/i.test(err.message)) {
          logout();
        }
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  if (error && !data) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>Team Details Error</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error}</div>
          <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <LoadingScreen label="LOADING TEAM…" />;

  const { team, assignments, checkpointsReached, attempts } = data;

  return (
    <div className="th-flex-col" style={{ gap: 24 }}>
      <Link to="/admin/teams" className="th-muted" style={{ fontSize: 13 }}>
        &larr; Back to Teams
      </Link>
      <h2>
        {team.team_name} <span className="th-mono th-faint" style={{ fontSize: 14 }}>({team.team_code})</span>
      </h2>

      <div className="th-stat-grid">
        <Stat label="Current Round" value={team.current_round} />
        <Stat label="Score" value={team.score} />
        <Stat label="Status" value={team.status} />
      </div>

      <div className="th-panel">
        <div className="th-flex-between" style={{ alignItems: 'center' }}>
          <h3>Team Members</h3>
          <span className="th-badge th-badge-cyan">
            {team.members?.length || 0} / 2 Members
          </span>
        </div>
        <div className="th-mt-12" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {team.members && team.members.length > 0 ? (
            team.members.map((m, idx) => (
              <div
                key={idx}
                className="th-panel"
                style={{
                  flex: '1 1 200px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="th-label">Member {idx + 1}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--cyan)' }}>{m}</div>
              </div>
            ))
          ) : (
            <p className="th-muted" style={{ margin: 0 }}>
              No members have joined yet.
            </p>
          )}
        </div>
      </div>

      <div className="th-panel">
        <h3>Challenge Assignments</h3>
        <table className="th-table th-mt-16">
          <thead>
            <tr>
              <th>Round</th>
              <th>Challenge</th>
              <th>Status</th>
              <th>Attempts</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <td>{a.rounds?.round_number}</td>
                <td>{a.challenges?.code || a.challenges?.question?.slice(0, 40)}</td>
                <td>{a.status}</td>
                <td>{a.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="th-panel">
        <h3>Checkpoints Reached</h3>
        <table className="th-table th-mt-16">
          <thead>
            <tr>
              <th>Round</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Time Taken</th>
            </tr>
          </thead>
          <tbody>
            {checkpointsReached.map((p) => (
              <tr key={p.id}>
                <td>{p.rounds?.round_number}</td>
                <td>{new Date(p.started_at).toLocaleTimeString()}</td>
                <td>{p.completed_at ? new Date(p.completed_at).toLocaleTimeString() : '—'}</td>
                <td>{p.time_taken_seconds != null ? `${p.time_taken_seconds}s` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="th-panel">
        <h3>Answer Attempts</h3>
        <table className="th-table th-mt-16">
          <thead>
            <tr>
              <th>#</th>
              <th>Answer</th>
              <th>Correct</th>
              <th>Points</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>{a.attempt_number}</td>
                <td className="th-mono">{a.answer}</td>
                <td>{a.is_correct ? '✓' : '✗'}</td>
                <td>{a.points_change}</td>
                <td>{new Date(a.created_at).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
