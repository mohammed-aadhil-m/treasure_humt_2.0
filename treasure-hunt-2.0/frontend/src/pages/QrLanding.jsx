import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Brand from '../components/Brand';
import LoadingScreen from '../components/LoadingScreen';
import { useTeam } from '../context/TeamContext';
import { api } from '../services/api';

// This is the page every physical QR code (#1 through #5) points to. It
// never knows or reveals which checkpoint number it is — it just hands the
// scanned token to the backend and lets the server decide what happens.
export default function QrLanding() {
  const { token: qrToken } = useParams();
  const navigate = useNavigate();
  const { sessionToken, team, login, ready, updateTeam } = useTeam();

  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [autoProcessing, setAutoProcessing] = useState(false);

  const advance = async (token, currentTeam) => {
    const roundNum = currentTeam?.currentRound ?? currentTeam?.current_round ?? 0;
    const fn = roundNum === 0 ? api.startHunt : api.scanCheckpoint;
    const res = await fn(token, qrToken);
    if (res?.team && updateTeam) updateTeam(res.team);
    navigate('/hunt', { replace: true, state: { huntState: res } });
  };

  // Already logged in on this device (e.g. scanning QR #2-#5 after QR #1) —
  // process immediately without asking for credentials again.
  useEffect(() => {
    if (!ready) return;
    if (sessionToken && team) {
      setAutoProcessing(true);
      advance(sessionToken, team).catch((err) => {
        setError(err.message);
        setAutoProcessing(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sessionToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

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

    setBusy(true);
    setError(null);
    try {
      const res = await login({ name: trimmedName, teamName: trimmedTeamName });
      await advance(res.sessionToken, res.team);
    } catch (err) {
      setError(err.message || 'Failed to enter the hunt.');
    } finally {
      setBusy(false);
    }
  };

  if (!ready || autoProcessing) return <LoadingScreen label="VERIFYING QR CODE…" />;

  if (sessionToken && error) {
    return (
      <div className="th-screen">
        <div className="th-container th-center-text">
          <Brand small />
          <div className="th-panel th-mt-24">
            <div className="th-feedback th-feedback-error">❌ {error}</div>
            <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={() => navigate('/hunt')}>
              Go to My Hunt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="th-screen th-anim-fade-up">
      <div className="th-container th-center-text">
        <Brand small />
        <div className="th-panel th-mt-24">
          <span className="th-badge th-badge-cyan" style={{ margin: '0 auto 14px' }}>
            QR CHECKPOINT DETECTED
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Enter Your Team</h2>
          <p className="th-muted th-mt-8" style={{ fontSize: 13 }}>
            Enter your Name and Team Name to continue. (Teams have a maximum of 2 members).
          </p>

          <form onSubmit={handleSubmit} className="th-flex-col th-mt-20" style={{ gap: 14 }}>
            <div className="th-field" style={{ textAlign: 'left' }}>
              <label className="th-label" htmlFor="qr-name">
                Your Name
              </label>
              <input
                id="qr-name"
                className="th-input"
                placeholder="e.g. Alex Rivera"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="th-field" style={{ textAlign: 'left' }}>
              <label className="th-label" htmlFor="qr-teamName">
                Team Name
              </label>
              <input
                id="qr-teamName"
                className="th-input"
                placeholder="e.g. CyberKnights"
                value={teamName}
                autoComplete="off"
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <p className="th-faint" style={{ fontSize: 12, textAlign: 'left' }}>
              👥 Member 1 creates the team; Member 2 enters the exact same team name to join.
            </p>

            {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}

            <button
              type="submit"
              className="th-btn th-btn-primary th-mt-12"
              disabled={busy}
            >
              {busy ? '⏳ CHECKING & STARTING…' : 'START / CONTINUE HUNT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
