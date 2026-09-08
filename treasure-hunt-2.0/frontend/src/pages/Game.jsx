import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import LoadingScreen from '../components/LoadingScreen';
import ProgressRail from '../components/ProgressRail';
import Timer, { formatDuration } from '../components/Timer';
import ChallengeCard from '../components/ChallengeCard';
import HintReveal from '../components/HintReveal';
import QrScanner from '../components/QrScanner';
import { useTeam } from '../context/TeamContext';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';

// The single screen a participant lives on after logging in. It never
// decides for itself which round or challenge to show — it renders exactly
// whatever `phase` the server's GET /api/hunt/current reports, so refresh,
// backgrounding the tab, or reopening on the same device always resumes
// in the right place.
export default function Game() {
  const { sessionToken, team, memberName, login, logout, updateTeam, ready } = useTeam();
  const navigate = useNavigate();
  const location = useLocation();

  const initialHuntState = location.state?.huntState || null;
  const [state, setState] = useState(initialHuntState);
  const [loading, setLoading] = useState(!initialHuntState);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(null);

  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState(null);

  const refresh = useCallback(async () => {
    if (!sessionToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getCurrent(sessionToken);
      setState(res);
      if (res.team) updateTeam(res.team);
      setError(null);
    } catch (err) {
      setError(err.message);
      if (/session|team not found|auth|unauthorized|401/i.test(err.message)) logout();
    } finally {
      setLoading(false);
    }
  }, [sessionToken, logout, updateTeam]);

  usePolling(refresh, 5000, Boolean(sessionToken) && !successOverlay);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginBusy) return;

    const trimmedName = name.trim();
    const trimmedTeamName = teamName.trim();

    if (!trimmedName) {
      setLoginError('Please enter your name.');
      return;
    }
    if (!trimmedTeamName) {
      setLoginError('Please enter your team name.');
      return;
    }

    setLoginBusy(true);
    setLoginError(null);
    try {
      await login({ name: trimmedName, teamName: trimmedTeamName });
    } catch (err) {
      setLoginError(err.message || 'Failed to enter the hunt.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleScanStart = async (qrToken) => {
    if (scanBusy) return;
    setScanBusy(true);
    setScanError(null);
    try {
      const res = await api.startHunt(sessionToken, qrToken);
      setState(res);
      if (res.team) updateTeam(res.team);
      setSuccessOverlay({
        roundNumber: 1,
        pointsEarned: 0,
        label: '✓ QR #1 VERIFIED! REVEALING ROUND 1 RIDDLE…',
      });
      setTimeout(() => setSuccessOverlay(null), 1800);
    } catch (err) {
      setScanError(err.message || 'Invalid QR code. Please scan QR Checkpoint #1.');
    } finally {
      setScanBusy(false);
    }
  };

  const handleScanCheckpoint = async (qrToken) => {
    if (scanBusy) return;
    setScanBusy(true);
    setScanError(null);
    try {
      const res = await api.scanCheckpoint(sessionToken, qrToken);
      setState(res);
      if (res.team) updateTeam(res.team);
      setSuccessOverlay({
        roundNumber: res.roundNumber,
        pointsEarned: 0,
        label: `✓ CHECKPOINT #${res.roundNumber} VERIFIED! REVEALING RIDDLE…`,
      });
      setTimeout(() => setSuccessOverlay(null), 1800);
    } catch (err) {
      setScanError(err.message || 'Failed to verify checkpoint QR code.');
    } finally {
      setScanBusy(false);
    }
  };

  const handleAnswer = async (answer) => {
    if (busy) return null;
    setBusy(true);
    try {
      const result = await api.submitAnswer(sessionToken, answer);
      if (result.correct) {
        setSuccessOverlay({
          roundNumber: state.roundNumber,
          pointsEarned: result.pointsEarned,
          label: `✓ RIDDLE SOLVED! REVEALING CLUE FOR CHECKPOINT #${state.roundNumber + 1}…`,
        });
        setTimeout(() => setSuccessOverlay(null), 1800);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <LoadingScreen label="LOADING…" />;

  // No session on this device: let a team member join/resume with Name & Team Name
  if (!sessionToken) {
    return (
      <div className="th-screen th-anim-fade-up">
        <div className="th-container th-center-text">
          <Brand small />
          <div className="th-panel th-mt-24">
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Enter the Hunt</h2>
            <p className="th-muted th-mt-8" style={{ fontSize: 14 }}>
              Enter your Name and Team Name to create or join your 2-member team.
            </p>
            <form onSubmit={handleLogin} className="th-flex-col th-mt-20" style={{ gap: 14 }}>
              <div className="th-field" style={{ textAlign: 'left' }}>
                <label className="th-label" htmlFor="game-name">
                  Your Name
                </label>
                <input
                  id="game-name"
                  className="th-input"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="th-field" style={{ textAlign: 'left' }}>
                <label className="th-label" htmlFor="game-teamName">
                  Team Name
                </label>
                <input
                  id="game-teamName"
                  className="th-input"
                  placeholder="e.g. CyberKnights"
                  value={teamName}
                  autoComplete="off"
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <p className="th-faint th-mt-4" style={{ fontSize: 12, textAlign: 'left' }}>
                👥 <strong>2 Members Max:</strong> Member 1 enters team name to start; Member 2 enters the same team name to join.
              </p>

              {loginError && <div className="th-feedback th-feedback-error">❌ {loginError}</div>}
              <button
                type="submit"
                className="th-btn th-btn-primary th-mt-12"
                disabled={loginBusy}
              >
                {loginBusy ? '⏳ ENTERING TEAM…' : 'ENTER / JOIN TEAM'}
              </button>
            </form>
          </div>
          <button
            type="button"
            className="th-btn th-btn-ghost th-mt-16"
            onClick={() => navigate('/')}
          >
            &larr; Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <Brand small />
          <div className="th-panel th-mt-24">
            <div className="th-feedback th-feedback-error">⚠️ {error}</div>
            <button type="button" className="th-btn th-btn-ghost th-mt-16" onClick={refresh}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !state) return <LoadingScreen label="SYNCING PROGRESS…" />;

  if (successOverlay) {
    return (
      <div className="th-screen">
        <div className="th-container th-center-text th-anim-pop">
          <div className="th-panel">
            <span style={{ fontSize: 44 }}>🔓</span>
            <h2 className="th-mt-16">
              {successOverlay.label || `ROUND ${String(successOverlay.roundNumber).padStart(2, '0')} COMPLETE`}
            </h2>
            {successOverlay.pointsEarned > 0 && (
              <p className="th-badge th-badge-green" style={{ margin: '14px auto 0' }}>
                +{successOverlay.pointsEarned} PTS
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'PAUSED') {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <Brand small eventName={state.eventName} tagline={state.tagline} />
          <div className="th-panel th-mt-24">
            <span style={{ fontSize: 36 }}>⏸️</span>
            <h3 className="th-mt-16">TREASURE HUNT IS TEMPORARILY PAUSED</h3>
            <p className="th-muted th-mt-8">Hang tight — the organizer will resume shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  const activeTeamName = team?.teamName || state?.team?.teamName || 'Your Team';
  const activeMembers = team?.members || state?.team?.members || [];

  if (state.phase === 'NOT_STARTED') {
    return (
      <div className="th-screen th-anim-fade-up">
        <div className="th-container th-center-text">
          <Brand small />

          {/* Team Members Status Card */}
          <div
            className="th-panel th-mt-16"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px 18px',
              textAlign: 'left',
            }}
          >
            <div className="th-flex-between">
              <div>
                <span className="th-label" style={{ fontSize: 10 }}>TEAM</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cyan)' }}>
                  {activeTeamName}
                </div>
              </div>
              <span className={`th-badge ${activeMembers.length === 2 ? 'th-badge-cyan' : 'th-badge-amber'}`}>
                👥 {activeMembers.length}/2 MEMBERS {activeMembers.length === 2 ? '(READY)' : '(WAITING)'}
              </span>
            </div>

            <div className="th-mt-8" style={{ color: 'var(--text-primary)', fontSize: 13 }}>
              {activeMembers.join(' & ') || activeTeamName}
            </div>

            {activeMembers.length === 1 && (
              <p className="th-mt-8" style={{ color: 'var(--amber)', fontSize: 12 }}>
                💡 <strong>Waiting for Partner:</strong> Your partner can join right now by entering their name and the exact team name &ldquo;<strong>{activeTeamName}</strong>&rdquo; on the entrance page!
              </p>
            )}
          </div>

          {/* Step 1 Indicator */}
          <div className="th-center-text th-mt-16">
            <span className="th-badge th-badge-cyan" style={{ margin: '0 auto', letterSpacing: '0.1em' }}>
              STEP 1 OF 3: SCAN QR CODE
            </span>
            <p className="th-faint th-mono th-mt-6" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
              SCAN CHECKPOINT #1 TO UNLOCK YOUR ROUND 1 RIDDLE
            </p>
          </div>

          {/* QR Checkpoint #1 Scanner View */}
          <div className="th-panel th-mt-12">
            <QrScanner
              targetCheckpoint={1}
              title="SCAN CHECKPOINT #1 TO START"
              subtitle="Point your camera at the QR code displayed on the screen by the event organizer."
              onScan={handleScanStart}
              busy={scanBusy}
            />

            {scanError && (
              <div className="th-feedback th-feedback-error th-mt-16">
                ❌ {scanError}
              </div>
            )}
          </div>

          <div className="th-flex-row th-mt-16" style={{ justifyContent: 'center', gap: 12 }}>
            <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={logout}>
              Switch Team / Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'COMPLETED') {
    return (
      <div className="th-screen th-center-text th-anim-pop">
        <div className="th-container">
          <span style={{ fontSize: 56 }}>🏆</span>
          <h1 style={{ fontSize: 30 }}>TREASURE UNLOCKED!</h1>
          <div className="th-panel th-mt-16">
            <div className="th-flex-col" style={{ gap: 14 }}>
              <div>
                <p className="th-label">TEAM</p>
                <p style={{ fontSize: 20, fontWeight: 700 }}>{state.team.teamName}</p>
                {activeMembers.length > 0 && (
                  <p className="th-muted th-mt-4" style={{ fontSize: 13 }}>
                    👥 {activeMembers.join(' & ')}
                  </p>
                )}
              </div>
              <div className="th-flex-between">
                <div>
                  <p className="th-label">SCORE</p>
                  <p className="th-mono" style={{ fontSize: 22, color: 'var(--gold)' }}>
                    {state.team.score}
                  </p>
                </div>
                <div>
                  <p className="th-label">TIME</p>
                  <p className="th-mono" style={{ fontSize: 22 }}>
                    {formatDuration(state.completionSeconds)}
                  </p>
                </div>
                <div>
                  <p className="th-label">RANK</p>
                  <p className="th-mono" style={{ fontSize: 22, color: 'var(--gold)' }}>
                    #{state.rank}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button type="button" className="th-btn th-btn-gold th-mt-24" onClick={() => navigate('/leaderboard')}>
            View Live Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="th-screen">
      <div className="th-container">
        <Brand small />

        {/* Team & Members Bar */}
        <div
          className="th-flex-between th-mt-12 th-mb-16"
          style={{
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>
              {activeTeamName}
            </div>
            <div className="th-muted" style={{ fontSize: 11 }}>
              👥 {activeMembers.join(' & ') || 'Team'} ({activeMembers.length}/2)
              {activeMembers.length === 1 && (
                <span style={{ color: 'var(--amber)', marginLeft: 6 }}>
                  (Partner can join using &ldquo;{activeTeamName}&rdquo;)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="th-btn th-btn-ghost"
            style={{ fontSize: 11, padding: '4px 8px' }}
            onClick={logout}
          >
            Exit
          </button>
        </div>

        <ProgressRail progress={state.progress} />
        <div className="th-flex-between">
          <span className="th-faint th-mono" style={{ fontSize: 11 }}>
            ELAPSED
          </span>
          <Timer baseSeconds={state.elapsedSeconds} />
        </div>

        <div className="th-panel">
          {error && <div className="th-feedback th-feedback-error th-mt-8">⚠️ {error}</div>}
          {scanError && <div className="th-feedback th-feedback-error th-mt-8">❌ {scanError}</div>}
          {state.phase === 'IN_CHALLENGE' ? (
            <ChallengeCard
              roundNumber={state.roundNumber}
              challenge={state.challenge}
              onSubmit={handleAnswer}
              busy={busy}
            />
          ) : (
            <HintReveal
              roundNumber={state.roundNumber}
              hint={state.hint}
              onScanCheckpoint={handleScanCheckpoint}
              busy={scanBusy}
            />
          )}
        </div>

        {typeof state.score === 'number' && (
          <p className="th-center-text th-faint th-mono" style={{ fontSize: 12 }}>
            SCORE: {state.score} PTS
          </p>
        )}
      </div>
    </div>
  );
}
