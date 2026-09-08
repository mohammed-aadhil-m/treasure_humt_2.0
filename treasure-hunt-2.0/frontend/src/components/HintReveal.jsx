import { useState } from 'react';
import ScanFrame from './ScanFrame';
import DecryptText from './DecryptText';
import QrScanner from './QrScanner';

export default function HintReveal({ roundNumber, hint, onScanCheckpoint, busy = false }) {
  const [showScanner, setShowScanner] = useState(false);
  const nextCheckpointNumber = roundNumber + 1;

  return (
    <div className="th-flex-col th-anim-fade-up" style={{ gap: 16 }}>
      <div className="th-center-text">
        <span className="th-badge th-badge-green" style={{ margin: '0 auto' }}>
          ✓ RIDDLE SOLVED! ROUND {String(roundNumber).padStart(2, '0')} COMPLETE
        </span>
        <div className="th-mt-8">
          <span className="th-faint th-mono" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
            STEP 3: FOLLOW THIS CLUE TO FIND & SCAN CHECKPOINT #{nextCheckpointNumber}
          </span>
        </div>
      </div>

      <ScanFrame animate={false}>
        <p className="th-faint th-mono" style={{ fontSize: 11, letterSpacing: '0.15em', marginBottom: 10, color: 'var(--cyan)' }}>
          🔍 YOUR NEXT LOCATION CLUE
        </p>
        <DecryptText text={hint} className="th-decrypt" />
      </ScanFrame>

      <div
        className="th-panel"
        style={{
          background: 'rgba(0, 240, 255, 0.04)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          padding: '12px',
          textAlign: 'center',
        }}
      >
        <p className="th-muted" style={{ fontSize: 14, margin: 0 }}>
          Find Checkpoint #{nextCheckpointNumber} hidden at this location, then scan its QR code to unlock your next riddle.
        </p>
      </div>

      {showScanner ? (
        <div className="th-mt-8 th-anim-fade-up">
          <QrScanner
            targetCheckpoint={nextCheckpointNumber}
            title={`SCAN CHECKPOINT #${nextCheckpointNumber}`}
            subtitle="Point your camera at the physical QR code hidden at this checkpoint location."
            onScan={onScanCheckpoint}
            busy={busy}
          />
          <button
            type="button"
            className="th-btn th-btn-ghost th-mt-12"
            onClick={() => setShowScanner(false)}
          >
            ← Hide Camera Scanner
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="th-btn th-btn-primary th-mt-4"
          onClick={() => setShowScanner(true)}
        >
          📷 SCAN CHECKPOINT #{nextCheckpointNumber}
        </button>
      )}
    </div>
  );
}

