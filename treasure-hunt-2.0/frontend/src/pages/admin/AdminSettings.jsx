import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { api } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminSettings() {
  const { token, logout } = useAdmin();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api
      .adminGetSettings(token)
      .then((res) => setForm(res.settings))
      .catch((err) => {
        setError(err.message || 'Failed to load settings.');
        if (/unauthorized|forbidden|jwt|token|401/i.test(err.message)) {
          logout();
        }
      });
  };

  useEffect(() => {
    load();
  }, [token]);

  if (error && !form) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>Settings Error</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error}</div>
          <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!form) return <LoadingScreen label="LOADING SETTINGS…" />;

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await api.adminUpdateSettings(token, {
        eventName: form.event_name,
        tagline: form.tagline,
        eventDate: form.event_date,
        leaderboardVisible: form.leaderboard_visible,
        wrongAnswerPenalty: Number(form.wrong_answer_penalty),
        hintPenalty: Number(form.hint_penalty),
      });
      setForm(res.settings);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="th-flex-col" style={{ gap: 24, maxWidth: 480 }}>
      <h2>Event Settings</h2>
      <form onSubmit={handleSave} className="th-panel th-flex-col">
        <div className="th-field">
          <label className="th-label">Event Name</label>
          <input className="th-input" value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} />
        </div>
        <div className="th-field">
          <label className="th-label">Tagline</label>
          <input className="th-input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>
        <div className="th-field">
          <label className="th-label">Event Date</label>
          <input
            className="th-input"
            type="date"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
          />
        </div>
        <div className="th-field">
          <label className="th-label">Default Wrong-Answer Penalty (points)</label>
          <input
            className="th-input"
            type="number"
            value={form.wrong_answer_penalty}
            onChange={(e) => setForm({ ...form, wrong_answer_penalty: e.target.value })}
          />
        </div>
        <label className="th-flex-row" style={{ fontSize: 14 }}>
          <input
            type="checkbox"
            checked={form.leaderboard_visible}
            onChange={(e) => setForm({ ...form, leaderboard_visible: e.target.checked })}
          />
          Show public leaderboard
        </label>

        {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}
        {saved && <div className="th-feedback th-feedback-success">✓ Settings saved</div>}

        <button type="submit" className="th-btn th-btn-primary th-mt-16" disabled={busy}>
          {busy ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
