import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { api } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminTeams() {
  const { token, logout } = useAdmin();
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState(null);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await api.adminListTeams(token);
      setTeams(res.teams);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load teams.');
      if (/unauthorized|forbidden|jwt|token|401/i.test(err.message)) {
        logout();
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const members = [member1.trim(), member2.trim()].filter(Boolean);
      await api.adminCreateTeam(token, {
        teamCode: newCode.trim(),
        teamName: newName.trim(),
        members,
      });
      setNewCode('');
      setNewName('');
      setMember1('');
      setMember2('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const payload = lines
      .map((line) => {
        const [teamCode, teamName, ...restMembers] = line.split(',');
        const members = restMembers.map((m) => m.trim()).filter(Boolean).slice(0, 2);
        return {
          teamCode: teamCode?.trim(),
          teamName: teamName?.trim() || teamCode?.trim(),
          members,
        };
      })
      .filter((t) => t.teamCode);

    if (payload.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await api.adminImportTeams(token, payload);
      setBulkText('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team and all of its progress? This cannot be undone.')) return;
    await api.adminDeleteTeam(token, id);
    await load();
  };

  if (error && !teams) {
    return (
      <div className="th-screen th-center-text">
        <div className="th-container">
          <h2>Teams Error</h2>
          <div className="th-feedback th-feedback-error th-mt-16">{error}</div>
          <button type="button" className="th-btn th-btn-primary th-mt-16" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!teams) return <LoadingScreen label="LOADING TEAMS…" />;

  return (
    <div className="th-flex-col" style={{ gap: 24 }}>
      <h2>Teams ({teams.length})</h2>

      {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}

      <div className="th-panel">
        <h3>Add a Team (Max 2 Members)</h3>
        <form onSubmit={handleCreate} className="th-flex-col th-mt-16" style={{ gap: 12 }}>
          <div className="th-flex-row" style={{ flexWrap: 'wrap', gap: 10 }}>
            <input
              className="th-input"
              placeholder="Team ID (e.g. ALPHA01)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              style={{ flex: '1 1 160px' }}
            />
            <input
              className="th-input"
              placeholder="Team Name (e.g. CyberKnights)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ flex: '1 1 160px' }}
            />
          </div>
          <div className="th-flex-row" style={{ flexWrap: 'wrap', gap: 10 }}>
            <input
              className="th-input"
              placeholder="Member 1 (optional)"
              value={member1}
              onChange={(e) => setMember1(e.target.value)}
              style={{ flex: '1 1 160px' }}
            />
            <input
              className="th-input"
              placeholder="Member 2 (optional)"
              value={member2}
              onChange={(e) => setMember2(e.target.value)}
              style={{ flex: '1 1 160px' }}
            />
            <button
              type="submit"
              className="th-btn th-btn-primary th-btn-sm"
              disabled={busy || !newCode.trim() || !newName.trim()}
              style={{ flex: '0 0 auto' }}
            >
              Add Team
            </button>
          </div>
        </form>
      </div>

      <div className="th-panel">
        <h3>Bulk Import</h3>
        <p className="th-muted th-mt-8" style={{ fontSize: 13 }}>
          One team per line: <code>TEAMCODE, Team Name, Member1, Member2</code> (Max 2 members)
        </p>
        <textarea
          className="th-input th-mt-16"
          rows={5}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={'ALPHA01, Team Alpha, Alice, Bob\nOMEGA02, Team Omega, Charlie'}
        />
        <button type="button" className="th-btn th-btn-ghost th-btn-sm th-mt-16" disabled={busy || !bulkText.trim()} onClick={handleImport}>
          Import Teams
        </button>
      </div>

      <table className="th-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Members (Max 2)</th>
            <th>Round</th>
            <th>Score</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.teamId}>
              <td>#{t.rank}</td>
              <td>
                <Link to={`/admin/teams/${t.teamId}`}>{t.teamName}</Link>
                <div className="th-muted th-mono" style={{ fontSize: 11 }}>
                  {t.teamCode}
                </div>
              </td>
              <td>
                {t.members && t.members.length > 0 ? (
                  <span>
                    {t.members.join(', ')}{' '}
                    <span className="th-badge th-badge-cyan" style={{ fontSize: 10, padding: '2px 5px' }}>
                      {t.members.length}/2
                    </span>
                  </span>
                ) : (
                  <span className="th-muted">0/2</span>
                )}
              </td>
              <td>{t.currentRound}</td>
              <td>{t.score}</td>
              <td>{t.status}</td>
              <td>
                <button type="button" className="th-btn th-btn-danger th-btn-sm" onClick={() => handleDelete(t.teamId)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
