import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const STORAGE_KEY = 'th_team_session_v1';
const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [sessionToken, setSessionToken] = useState(null);
  const [team, setTeam] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [ready, setReady] = useState(false);

  // Restore an existing session on load so a refresh, a lost connection, or
  // reopening the browser never resets progress (spec section 4).
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setSessionToken(saved.sessionToken);
        setTeam(saved.team);
        setMemberName(saved.memberName || '');
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const persist = useCallback((token, teamData, member = '') => {
    setSessionToken(token);
    setTeam(teamData);
    if (member) setMemberName(member);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sessionToken: token, team: teamData, memberName: member || memberName })
    );
  }, [memberName]);

  const login = useCallback(
    async (credentials) => {
      const res = await api.teamLogin(credentials);
      const name = res.memberName || (typeof credentials === 'object' ? credentials.name : '');
      persist(res.sessionToken, res.team, name);
      return res;
    },
    [persist]
  );

  const updateTeam = useCallback(
    (partial) => {
      setTeam((prev) => {
        const next = { ...prev, ...partial };
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sessionToken, team: next, memberName })
        );
        return next;
      });
    },
    [sessionToken, memberName]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionToken(null);
    setTeam(null);
    setMemberName('');
  }, []);

  return (
    <TeamContext.Provider
      value={{ sessionToken, team, memberName, ready, login, logout, updateTeam }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within a TeamProvider');
  return ctx;
}
