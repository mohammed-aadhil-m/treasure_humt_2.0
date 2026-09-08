import { useEffect, useState } from 'react';
import ScanFrame from './ScanFrame';

// Renders the active challenge (quiz options or free-text answer) and
// reports the raw answer up to the parent, which owns the actual API call
// so it can control the success-transition timing.
export default function ChallengeCard({ roundNumber, challenge, onSubmit, busy }) {
  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setSelected(null);
    setTextAnswer('');
    setError(null);
  }, [challenge.id]);

  const isQuiz = challenge.type === 'quiz';
  const canSubmit = (isQuiz ? selected !== null : textAnswer.trim().length > 0) && !busy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const answer = isQuiz ? selected : textAnswer;
    const result = await onSubmit(answer);
    if (!result) return;

    if (!result.correct) {
      setError(result.message || 'Not quite. Think again and try again.');
      setShake(true);
      setTimeout(() => setShake(false), 550);
      setTextAnswer('');
      setSelected(null);
    }
  };

  return (
    <div className={`th-flex-col ${shake ? 'th-anim-shake' : ''}`} style={{ gap: 14 }}>
      <div className="th-flex-between">
        <span className="th-badge th-badge-cyan">ROUND {String(roundNumber).padStart(2, '0')}</span>
        <span className="th-badge th-badge-gold">
          {challenge.type === 'riddle' ? '🧩 RIDDLE' : '🧠 CHALLENGE'}
        </span>
      </div>

      <div className="th-center-text">
        <span className="th-faint th-mono" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
          STEP 2: SOLVE THIS RIDDLE TO UNLOCK NEXT CLUE
        </span>
      </div>

      <ScanFrame>
        <p style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 500 }}>{challenge.question}</p>
        {challenge.imageUrl && (
          <img
            src={challenge.imageUrl}
            alt="Challenge visual"
            style={{ width: '100%', borderRadius: 10, marginTop: 14, display: 'block' }}
          />
        )}
      </ScanFrame>

      {isQuiz ? (
        <div className="th-options">
          {(challenge.options || []).map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={letter}
                type="button"
                className={`th-option ${selected === letter ? 'is-selected' : ''}`}
                onClick={() => setSelected(letter)}
              >
                <span className="th-option-letter">{letter}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <input
          className="th-input"
          placeholder="Type your answer…"
          value={textAnswer}
          autoComplete="off"
          onChange={(e) => setTextAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
      )}

      {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}

      <button type="button" className="th-btn th-btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
        {busy ? 'CHECKING…' : 'SUBMIT'}
      </button>

      {challenge.maxAttempts != null && (
        <span className="th-faint th-mono th-center-text" style={{ fontSize: 11 }}>
          Attempt {challenge.attempts + 1} of {challenge.maxAttempts}
        </span>
      )}
    </div>
  );
}
