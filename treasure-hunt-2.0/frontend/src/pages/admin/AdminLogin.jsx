import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const { login, isAuthenticated, ready } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (ready && isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="th-screen">
      <div className="th-container th-center-text">
        <Brand small />
        <div className="th-panel th-mt-24">
          <h3>ORGANIZER LOGIN</h3>
          <form onSubmit={handleSubmit} className="th-flex-col th-mt-16">
            <div className="th-field">
              <label className="th-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="th-input"
                type="email"
                value={email}
                autoComplete="username"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="th-field">
              <label className="th-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="th-input"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="th-feedback th-feedback-error">❌ {error}</div>}
            <button type="submit" className="th-btn th-btn-primary" disabled={busy || !email || !password}>
              {busy ? 'SIGNING IN…' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
