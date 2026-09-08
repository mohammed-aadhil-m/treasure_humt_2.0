import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import Leaderboard from '../components/Leaderboard';
import LoadingScreen from '../components/LoadingScreen';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';

// Public, unauthenticated — suitable for projecting live during the event
// (spec section 35). Respects the admin's "hide leaderboard" toggle.
export default function LeaderboardPage() {
  const [rows, setRows] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getLeaderboard();
      setRows(res.leaderboard);
      setHidden(false);
    } catch (err) {
      setHidden(true);
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(refresh, 8000, true);

  return (
    <div className="th-screen">
      <div className="th-container th-container-wide">
        <div className="th-center-text">
          <span style={{ fontSize: 40 }}>🏆</span>
          <Brand small />
        </div>

        <div className="th-panel">
          {loading ? (
            <LoadingScreen label="LOADING LEADERBOARD…" />
          ) : hidden ? (
            <p className="th-muted th-center-text">The leaderboard is hidden for now. Check back soon.</p>
          ) : (
            <Leaderboard rows={rows} />
          )}
        </div>

        <Link to="/" className="th-btn th-btn-ghost th-center-text" style={{ textDecoration: 'none' }}>
          Back Home
        </Link>
      </div>
    </div>
  );
}
