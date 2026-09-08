import { useEffect, useState } from 'react';
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

export default function AdminOverview() {
  const { token, logout } = useAdmin();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [dash, s] = await Promise.all([api.adminDashboard(token), api.adminGetSettings(token)]);
      setData(dash);
      setSettings(s.settings);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
      if (/unauthorized|forbidden|jwt|token|401/i.test(err.message)) {
        logout();
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const setStatus = async (status) => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.adminSetEventStatus(token, status);
      setSettings(res.settings);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && (!data || !settings)) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>Overview Error</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error}</div>
          <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || !settings) return <LoadingScreen label="LOADING DASHBOARD…" />;

  return (
    <div className="th-flex-col" style={{ gap: 24 }}>
      <div className="th-flex-between">
        <h2>Overview</h2>
        <span
          className={`th-badge ${
            settings.status === 'RUNNING' ? 'th-badge-green' : settings.status === 'PAUSED' ? 'th-badge-gold' : ''
          }`}
        >
          {settings.status}
        </span>
      </div>

      <div className="th-stat-grid">
        <Stat label="Total Teams" value={data.totals.totalTeams} />
        <Stat label="Not Started" value={data.totals.teamsNotStarted} />
        <Stat label="Playing" value={data.totals.teamsPlaying} />
        <Stat label="Completed" value={data.totals.teamsCompleted} />
        <Stat label="Challenges" value={data.totals.totalChallenges} />
      </div>

      <div className="th-panel">
        <h3>Teams per Round</h3>
        <div className="th-stat-grid th-mt-16">
          {Object.entries(data.teamsPerRound).map(([round, count]) => (
            <Stat key={round} label={`Round ${round}`} value={count} />
          ))}
        </div>
      </div>

      <div className="th-panel">
        <h3>Event Controls</h3>
        <p className="th-muted th-mt-8" style={{ fontSize: 13 }}>
          Starts and resumes both set the event to RUNNING. Pausing freezes every team's screen instantly.
        </p>
        {error && <div className="th-feedback th-feedback-error th-mt-16">❌ {error}</div>}
        <div className="th-flex-row th-mt-16" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="th-btn th-btn-primary th-btn-sm" disabled={busy} onClick={() => setStatus('RUNNING')}>
            {settings.status === 'PAUSED' ? 'Resume Event' : 'Start Event'}
          </button>
          <button type="button" className="th-btn th-btn-ghost th-btn-sm" disabled={busy} onClick={() => setStatus('PAUSED')}>
            Pause Event
          </button>
          <button type="button" className="th-btn th-btn-danger th-btn-sm" disabled={busy} onClick={() => setStatus('ENDED')}>
            End Event
          </button>
        </div>
      </div>
    </div>
  );
}
