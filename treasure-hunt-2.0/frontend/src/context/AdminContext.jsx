import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const STORAGE_KEY = 'th_admin_session_v1';
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setToken(saved.token);
        setAdmin(saved.admin);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.adminLogin(email, password);
    setToken(res.token);
    setAdmin(res.admin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: res.token, admin: res.admin }));
    return res.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminContext.Provider value={{ token, admin, ready, login, logout, isAuthenticated: Boolean(token) }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}
