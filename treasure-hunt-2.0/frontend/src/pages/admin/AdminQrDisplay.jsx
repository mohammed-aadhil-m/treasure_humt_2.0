import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

// Full-screen projector/TV route. Displays QR #1 prominently for teams to scan at the start.
export default function AdminQrDisplay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .getStartQr()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load QR code'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingScreen label="LOADING STARTING QR CODE…" />;

  if (error || !data) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>Projector Display</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error || 'QR code not found.'}</div>
          <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="th-screen" style={{ minHeight: '100vh', padding: '32px 16px' }}>
      <div className="th-flex-col th-center-text" style={{ gap: 24, alignItems: 'center' }}>
        <div>
          <span className="th-brand-mark" style={{ letterSpacing: '0.25em' }}>
            ◆ ORGANIZER PROJECTOR DISPLAY ◆
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5.5vw, 60px)', margin: '12px 0 4px' }}>
            {data.eventName || 'TREASURE HUNT 2.0'}
          </h1>
          <div className="th-tagline" style={{ fontSize: 'clamp(14px, 2vw, 18px)' }}>
            {data.tagline || 'SCAN. SOLVE. SEARCH. CONQUER.'}
          </div>
        </div>

        <div
          style={{
            padding: 24,
            background: '#ffffff',
            borderRadius: 24,
            boxShadow: 'var(--shadow-glow-cyan)',
            maxWidth: '100%',
          }}
        >
          <img
            src={data.qrDataUrl}
            alt="Scan Checkpoint #1 to Start"
            style={{
              width: 'clamp(260px, 35vw, 420px)',
              height: 'auto',
              display: 'block',
              borderRadius: 8,
            }}
          />
        </div>

        <div>
          <span
            className="th-badge th-badge-cyan"
            style={{ fontSize: 13, padding: '6px 14px', letterSpacing: '0.15em' }}
          >
            STARTING CHECKPOINT #1
          </span>
          <h2
            className="th-mono th-mt-12"
            style={{ letterSpacing: '0.25em', color: 'var(--cyan)', fontSize: 'clamp(18px, 3vw, 26px)' }}
          >
            SCAN WITH APP CAMERA TO START
          </h2>
          <p className="th-muted th-mt-8" style={{ fontSize: 15 }}>
            Join your team on your phone, then scan this QR code to unlock your Round 1 Riddle.
          </p>
        </div>
      </div>
    </div>
  );
}
