import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { api } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import QrImage from '../../components/QrImage';

export default function AdminQrManagement() {
  const { token, logout } = useAdmin();
  const [checkpoints, setCheckpoints] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [locationDraft, setLocationDraft] = useState('');
  const [hintDraft, setHintDraft] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const res = await api.adminListCheckpoints(token);
      setCheckpoints(res.checkpoints);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load checkpoints.');
      if (/unauthorized|forbidden|jwt|token|401/i.test(err.message)) {
        logout();
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startEdit = (cp) => {
    setEditingId(cp.id);
    setLocationDraft(cp.internal_location || '');
    setHintDraft(cp.hint_note || '');
  };

  const saveEdit = async (id) => {
    try {
      await api.adminUpdateCheckpoint(token, id, { internalLocation: locationDraft, hintNote: hintDraft });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (cp) => {
    await api.adminUpdateCheckpoint(token, cp.id, { isActive: !cp.is_active });
    await load();
  };

  const regenerate = async (id) => {
    if (!window.confirm('Regenerate this QR code? The previously printed/posted code will stop working immediately.')) return;
    await api.adminRegenerateCheckpoint(token, id);
    await load();
  };

  const download = (url, checkpointNumber) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `treasure-hunt-qr-checkpoint-${checkpointNumber}.png`;
    a.click();
  };

  if (error && !checkpoints) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>QR Checkpoints Error</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error}</div>
          <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!checkpoints) return <LoadingScreen label="LOADING CHECKPOINTS…" />;

  return (
    <div className="th-flex-col" style={{ gap: 24 }}>
      <h2>QR Checkpoints</h2>
      <p className="th-muted" style={{ fontSize: 13 }}>
        Participants never see this list. QR #1 is for the public display screen (open "Projector Display" in the
        sidebar). QR #2–#5 should be printed and hidden physically at the locations you set below.
      </p>
      {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}

      {checkpoints.map((cp) => (
        <div key={cp.id} className="th-panel">
          <div className="th-flex-between">
            <h3>Checkpoint #{cp.checkpoint_number}</h3>
            <span className={`th-badge ${cp.is_active ? 'th-badge-green' : 'th-badge-red'}`}>
              {cp.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <div className="th-flex-row th-mt-16" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ background: '#fff', padding: 10, borderRadius: 12 }}>
              <QrImage
                token={token}
                path={api.adminCheckpointImagePath(cp.id)}
                alt={`QR checkpoint ${cp.checkpoint_number}`}
                size={160}
                onLoaded={(url) => setImageUrls((prev) => ({ ...prev, [cp.id]: url }))}
              />
            </div>

            <div className="th-flex-col" style={{ flex: 1, minWidth: 220, gap: 8 }}>
              <span className="th-mono th-faint" style={{ fontSize: 11 }}>
                SCAN COUNT: {cp.scan_count}
              </span>
              <span className="th-mono th-faint" style={{ fontSize: 11, wordBreak: 'break-all' }}>
                {cp.scan_url}
              </span>

              {editingId === cp.id ? (
                <div className="th-flex-col th-mt-8">
                  <input
                    className="th-input"
                    placeholder="Physical location (admin note)"
                    value={locationDraft}
                    onChange={(e) => setLocationDraft(e.target.value)}
                  />
                  <input
                    className="th-input"
                    placeholder="Internal hint note"
                    value={hintDraft}
                    onChange={(e) => setHintDraft(e.target.value)}
                  />
                  <div className="th-flex-row">
                    <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                    <button type="button" className="th-btn th-btn-primary th-btn-sm" onClick={() => saveEdit(cp.id)}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="th-muted" style={{ fontSize: 13 }}>
                    {cp.internal_location || 'No location set'}
                  </span>
                  <div className="th-flex-row th-mt-8" style={{ flexWrap: 'wrap' }}>
                    <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={() => startEdit(cp)}>
                      Edit
                    </button>
                    <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={() => toggleActive(cp)}>
                      {cp.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={() => regenerate(cp.id)}>
                      Regenerate
                    </button>
                    {imageUrls[cp.id] && (
                      <button
                        type="button"
                        className="th-btn th-btn-ghost th-btn-sm"
                        onClick={() => download(imageUrls[cp.id], cp.checkpoint_number)}
                      >
                        Download PNG
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
