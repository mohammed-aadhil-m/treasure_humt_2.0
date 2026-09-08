import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const LINKS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/teams', label: 'Teams' },
  { to: '/admin/challenges', label: 'Challenges' },
  { to: '/admin/qr', label: 'QR Checkpoints' },
  { to: '/admin/leaderboard', label: 'Leaderboard' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { isAuthenticated, ready, admin, logout } = useAdmin();

  if (!ready) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="th-admin-shell">
      <aside className="th-admin-sidebar">
        <div className="th-mono th-faint" style={{ fontSize: 11, marginBottom: 18, letterSpacing: '0.1em' }}>
          TREASURE HUNT 2.0
          <br />
          ADMIN
        </div>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `th-admin-nav-link ${isActive ? 'is-active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
        <a href="/admin/display" target="_blank" rel="noreferrer" className="th-admin-nav-link">
          Projector Display ↗
        </a>
        <div style={{ flex: 1 }} />
        <div className="th-muted" style={{ fontSize: 12, marginBottom: 8, wordBreak: 'break-all' }}>
          {admin?.email}
        </div>
        <button type="button" className="th-btn th-btn-ghost th-btn-sm" onClick={logout}>
          Log Out
        </button>
      </aside>
      <main className="th-admin-main">
        <Outlet />
      </main>
    </div>
  );
}
