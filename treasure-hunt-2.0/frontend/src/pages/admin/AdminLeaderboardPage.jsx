import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { api } from '../../services/api';
import Leaderboard from '../../components/Leaderboard';
import LoadingScreen from '../../components/LoadingScreen';
import { usePolling } from '../../hooks/usePolling';

export default function AdminLeaderboardPage() {
  const { token, logout } = useAdmin();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  usePolling(
    async () => {
      try {
        const res = await api.adminLeaderboard(token);
        setRows(res.leaderboard);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load leaderboard.');
        if (/unauthorized|forbidden|jwt|token|401/i.test(err.message)) {
          logout();
        }
      }
    },
    6000,
    true
  );

  if (error && !rows) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>Leaderboard Error</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error}</div>
        </div>
      </div>
    );
  }

  if (!rows) return <LoadingScreen label="LOADING LEADERBOARD…" />;

  return (
    <div className="th-flex-col" style={{ gap: 24 }}>
      <h2>Leaderboard</h2>
      <p className="th-muted" style={{ fontSize: 13 }}>
        Always visible to you here, even if the public leaderboard is hidden in Settings.
      </p>
      <div className="th-panel">
        <Leaderboard rows={rows} />
      </div>
    </div>
  );
}
