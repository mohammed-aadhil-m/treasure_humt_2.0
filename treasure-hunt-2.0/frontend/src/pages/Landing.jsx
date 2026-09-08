import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import LoadingScreen from '../components/LoadingScreen';
import { useTeam } from '../context/TeamContext';
import { api } from '../services/api';

export default function Landing() {
  const navigate = useNavigate();
  const { sessionToken, team, memberName, login, logout, ready } = useTeam();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Entrance form state
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .getEventStatus()
      .then((res) => mounted && setStatus(res))
      .catch(() => mounted && setStatus(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleEntrance = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedTeamName = teamName.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!trimmedTeamName) {
      setError('Please enter your team name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await login({ name: trimmedName, teamName: trimmedTeamName });
      setSuccessMsg(res.message || 'Joined successfully! Heading to hunt...');
      setTimeout(() => {
        navigate('/hunt');
      }, 400);
    } catch (err) {
      setError(err.message || 'Failed to enter the hunt.');
      setSubmitting(false);
    }
  };

  if (loading || !ready) return <LoadingScreen label="INITIALIZING…" />;

  const isPaused = status?.status === 'PAUSED';
  const isEnded = status?.status === 'ENDED';

  return (
    <div className="th-screen th-anim-fade-up">
      <div className="th-container th-center-text">
        <Brand eventName={status?.eventName} tagline={status?.tagline} />

        {isEnded && (
          <div className="th-panel th-mt-24">
            <p className="th-muted">This event has ended. Thanks for playing!</p>
            <button
              type="button"
              className="th-btn th-btn-primary th-mt-16"
              onClick={() => navigate('/leaderboard')}
            >
              View Final Leaderboard
            </button>
          </div>
        )}

        {isPaused && (
          <div className="th-panel th-mt-24">
            <span style={{ fontSize: 32 }}>⏸️</span>
            <p className="th-mt-12" style={{ color: 'var(--amber)' }}>
              The hunt is temporarily paused by the organizer. Progress is safely saved.
            </p>
          </div>
        )}

        {/* If participant already has an active team session */}
        {sessionToken && team && (
          <div className="th-panel th-mt-24" style={{ borderColor: 'var(--cyan)' }}>
            <span className="th-badge th-badge-cyan" style={{ margin: '0 auto 12px' }}>
              LOGGED IN
            </span>
            <h3 style={{ fontSize: 20 }}>
              Team: <span style={{ color: 'var(--cyan)' }}>{team.teamName}</span>
            </h3>
            {team.members && team.members.length > 0 && (
              <p className="th-muted th-mt-8" style={{ fontSize: 14 }}>
                👥 <strong>Members ({team.members.length}/2):</strong> {team.members.join(' & ')}
              </p>
            )}
            {memberName && (
              <p className="th-faint th-mt-4" style={{ fontSize: 13 }}>
                Logged in as: <strong>{memberName}</strong>
              </p>
            )}

            <div className="th-flex-row th-mt-20" style={{ justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                className="th-btn th-btn-primary"
                onClick={() => navigate('/hunt')}
              >
                Continue Hunt &rarr;
              </button>
              <button
                type="button"
                className="th-btn th-btn-ghost th-btn-sm"
                onClick={logout}
              >
                Switch / New Team
              </button>
            </div>
          </div>
        )}

        {/* Entrance Form: Enter Name and Team Name */}
        {(!sessionToken || !team) && !isEnded && (
          <div className="th-panel th-mt-24">
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Enter the Hunt</h2>
            <p className="th-muted th-mt-8" style={{ fontSize: 14 }}>
              Teams have a <strong>maximum of 2 members</strong>. Enter your name and your team name below.
            </p>

            <form onSubmit={handleEntrance} className="th-flex-col th-mt-20" style={{ gap: 14 }}>
              <div className="th-field" style={{ textAlign: 'left' }}>
                <label className="th-label" htmlFor="participant-name">
                  Your Name
                </label>
                <input
                  id="participant-name"
                  className="th-input"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  autoComplete="name"
                  maxLength={50}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="th-field" style={{ textAlign: 'left' }}>
                <label className="th-label" htmlFor="team-name">
                  Team Name
                </label>
                <input
                  id="team-name"
                  className="th-input"
                  placeholder="e.g. CyberKnights"
                  value={teamName}
                  autoComplete="off"
                  maxLength={50}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div
                className="th-panel th-mt-4"
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  fontSize: 12,
                  textAlign: 'left',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ color: 'var(--cyan)', fontWeight: 600, marginBottom: 2 }}>
                  💡 How 2-Member Teams Work:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)' }}>
                  <li>
                    <strong>Member 1:</strong> Enter your name & desired team name to create your team.
                  </li>
                  <li>
                    <strong>Member 2:</strong> Enter your own name & the <em>exact same team name</em> from your phone to join!
                  </li>
                  <li>
                    <strong>Limit:</strong> Maximum 2 members allowed per team.
                  </li>
                </ul>
              </div>

              {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}
              {successMsg && <div className="th-feedback th-feedback-success">✅ {successMsg}</div>}

              <button
                type="submit"
                className="th-btn th-btn-primary th-mt-12"
                disabled={submitting}
              >
                {submitting ? '⏳ ENTERING TEAM…' : 'ENTER / JOIN TEAM'}
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          className="th-btn th-btn-ghost th-mt-16"
          onClick={() => navigate('/leaderboard')}
        >
          View Live Leaderboard
        </button>
      </div>
    </div>
  );
}

