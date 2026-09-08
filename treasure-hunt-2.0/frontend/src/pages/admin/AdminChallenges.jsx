import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { api } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

const TYPES = ['quiz', 'riddle', 'puzzle', 'image_puzzle'];
const EMPTY_FORM = {
  roundNumber: 1,
  code: '',
  type: 'riddle',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  acceptedAnswers: '',
  hint: '',
  imageUrl: '',
  points: '',
  penalty: '',
};

export default function AdminChallenges() {
  const { token, logout } = useAdmin();
  const [challenges, setChallenges] = useState(null);
  const [roundFilter, setRoundFilter] = useState(0);
  const [editing, setEditing] = useState(null); // null | 'new' | challenge row
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await api.adminListChallenges(token, roundFilter || undefined);
      setChallenges(res.challenges);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load challenges.');
      if (/unauthorized|forbidden|jwt|token|401/i.test(err.message)) {
        logout();
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundFilter, token]);

  const openNew = () => {
    setForm({ ...EMPTY_FORM, roundNumber: roundFilter || 1 });
    setEditing('new');
    setError(null);
  };

  const openEdit = (c) => {
    setForm({
      roundNumber: c.rounds?.round_number || 1,
      code: c.code || '',
      type: c.type,
      question: c.question,
      options: c.options && c.options.length ? [...c.options, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
      correctAnswer: c.correct_answer,
      acceptedAnswers: (c.accepted_answers || []).join(', '),
      hint: c.hint,
      imageUrl: c.image_url || '',
      points: c.points ?? '',
      penalty: c.penalty ?? '',
    });
    setEditing(c);
    setError(null);
  };

  const closeModal = () => setEditing(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      roundNumber: Number(form.roundNumber),
      code: form.code || undefined,
      type: form.type,
      question: form.question,
      options: form.type === 'quiz' ? form.options.filter((o) => o.trim()) : undefined,
      correctAnswer: form.correctAnswer,
      acceptedAnswers: form.acceptedAnswers
        ? form.acceptedAnswers.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      hint: form.hint,
      imageUrl: form.imageUrl || undefined,
      points: form.points !== '' ? Number(form.points) : undefined,
      penalty: form.penalty !== '' ? Number(form.penalty) : undefined,
    };

    try {
      if (editing === 'new') {
        await api.adminCreateChallenge(token, payload);
      } else {
        await api.adminUpdateChallenge(token, editing.id, payload);
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this challenge? Any teams currently assigned it will be affected.')) return;
    await api.adminDeleteChallenge(token, id);
    await load();
  };

  const handleToggleActive = async (c) => {
    await api.adminUpdateChallenge(token, c.id, { isActive: !c.is_active });
    await load();
  };

  if (error && !challenges) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>Challenges Error</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error}</div>
          <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!challenges) return <LoadingScreen label="LOADING CHALLENGES…" />;

  return (
    <div className="th-flex-col" style={{ gap: 24 }}>
      <div className="th-flex-between">
        <h2>Challenges</h2>
        <button type="button" className="th-btn th-btn-primary th-btn-sm" onClick={openNew}>
          + New Challenge
        </button>
      </div>

      <div className="th-flex-row" style={{ flexWrap: 'wrap' }}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`th-btn th-btn-sm ${roundFilter === n ? 'th-btn-primary' : 'th-btn-ghost'}`}
            onClick={() => setRoundFilter(n)}
          >
            {n === 0 ? 'All' : `Round ${n}`}
          </button>
        ))}
      </div>

      <table className="th-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Round</th>
            <th>Type</th>
            <th>Question</th>
            <th>Points</th>
            <th>Active</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {challenges.map((c) => (
            <tr key={c.id}>
              <td className="th-mono">{c.code || '—'}</td>
              <td>{c.rounds?.round_number}</td>
              <td>{c.type}</td>
              <td style={{ maxWidth: 280 }}>{c.question}</td>
              <td>{c.points ?? '—'}</td>
              <td>{c.is_active ? '✓' : '—'}</td>
              <td>
                <div className="th-flex-row">
                  <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={() => openEdit(c)}>
                    Edit
                  </button>
                  <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={() => handleToggleActive(c)}>
                    {c.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="th-btn th-btn-danger th-btn-sm" onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="th-modal-backdrop" onClick={closeModal}>
          <div className="th-modal th-panel" onClick={(e) => e.stopPropagation()}>
            <h3>{editing === 'new' ? 'New Challenge' : 'Edit Challenge'}</h3>
            <form onSubmit={handleSave} className="th-flex-col th-mt-16">
              <div className="th-field">
                <label className="th-label">Round</label>
                <select className="th-input" value={form.roundNumber} onChange={(e) => setForm({ ...form, roundNumber: e.target.value })}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      Round {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="th-field">
                <label className="th-label">Code (optional, e.g. R1-004)</label>
                <input className="th-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>

              <div className="th-field">
                <label className="th-label">Type</label>
                <select className="th-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="th-field">
                <label className="th-label">Question</label>
                <textarea className="th-input" rows={3} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
              </div>

              {form.type === 'quiz' && (
                <div className="th-field">
                  <label className="th-label">Options (A–D)</label>
                  {form.options.map((opt, idx) => (
                    <input
                      key={idx}
                      className="th-input th-mt-8"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => {
                        const opts = [...form.options];
                        opts[idx] = e.target.value;
                        setForm({ ...form, options: opts });
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="th-field">
                <label className="th-label">{form.type === 'quiz' ? 'Correct Option (A/B/C/D)' : 'Correct Answer'}</label>
                <input className="th-input" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
              </div>

              {form.type !== 'quiz' && (
                <div className="th-field">
                  <label className="th-label">Other Accepted Answers (comma-separated)</label>
                  <input
                    className="th-input"
                    value={form.acceptedAnswers}
                    onChange={(e) => setForm({ ...form, acceptedAnswers: e.target.value })}
                  />
                </div>
              )}

              <div className="th-field">
                <label className="th-label">Hint (unlocks the next QR)</label>
                <textarea className="th-input" rows={2} value={form.hint} onChange={(e) => setForm({ ...form, hint: e.target.value })} />
              </div>

              <div className="th-field">
                <label className="th-label">Image URL (optional)</label>
                <input className="th-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>

              <div className="th-flex-row">
                <div className="th-field" style={{ flex: 1 }}>
                  <label className="th-label">Points Override</label>
                  <input className="th-input" type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
                </div>
                <div className="th-field" style={{ flex: 1 }}>
                  <label className="th-label">Penalty Override</label>
                  <input className="th-input" type="number" value={form.penalty} onChange={(e) => setForm({ ...form, penalty: e.target.value })} />
                </div>
              </div>

              {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}

              <div className="th-flex-row th-mt-16">
                <button type="button" className="th-btn th-btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="th-btn th-btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
