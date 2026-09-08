export function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  // If explicitly configured to an external production server
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }
  // In development and local network / mobile, use relative URL so Vite proxy handles routing
  return '';
}

export const API_URL = getApiUrl();

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    const baseUrl = getApiUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (networkErr) {
    if (networkErr.name === 'AbortError') {
      throw new Error('Server took too long to respond. Check your connection and try again.');
    }
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. empty response) — leave data as null
  }

  if (res.status === 401) {
    if (path.startsWith('/api/admin') && !path.includes('/login')) {
      try {
        localStorage.removeItem('th_admin_session_v1');
      } catch {}
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.replace('/admin/login');
      }
    } else if (path.startsWith('/api/hunt') || path.startsWith('/api/challenge') || path.startsWith('/api/progress')) {
      try {
        localStorage.removeItem('th_team_session_v1');
      } catch {}
    }
  }

  if (!res.ok || (data && data.success === false)) {
    throw new Error((data && data.message) || `Something went wrong (${res.status}).`);
  }

  return data;
}

export const api = {
  // ---------- participant ----------
  teamLogin: (payload) =>
    request('/api/auth/team', {
      method: 'POST',
      body: typeof payload === 'string' ? { teamCode: payload } : payload,
    }),
  startHunt: (token, qrToken) => request('/api/hunt/start', { method: 'POST', body: { qrToken }, token }),
  getCurrent: (token) => request('/api/hunt/current', { token }),
  getProgress: (token) => request('/api/progress', { token }),
  submitAnswer: (token, answer) => request('/api/challenge/answer', { method: 'POST', body: { answer }, token }),
  scanCheckpoint: (token, qrToken) => request('/api/qr/scan', { method: 'POST', body: { qrToken }, token }),
  getLeaderboard: () => request('/api/leaderboard'),
  getEventStatus: () => request('/api/event/status'),
  getStartQr: () => request('/api/event/start-qr'),

  // ---------- admin ----------
  adminLogin: (email, password) => request('/api/admin/login', { method: 'POST', body: { email, password } }),
  adminDashboard: (token) => request('/api/admin/dashboard', { token }),

  adminListTeams: (token) => request('/api/admin/teams', { token }),
  adminTeamDetail: (token, id) => request(`/api/admin/teams/${id}`, { token }),
  adminCreateTeam: (token, payload) => request('/api/admin/teams', { method: 'POST', body: payload, token }),
  adminImportTeams: (token, teams) => request('/api/admin/teams/import', { method: 'POST', body: { teams }, token }),
  adminDeleteTeam: (token, id) => request(`/api/admin/teams/${id}`, { method: 'DELETE', token }),

  adminListChallenges: (token, round) =>
    request(`/api/admin/challenges${round ? `?round=${round}` : ''}`, { token }),
  adminCreateChallenge: (token, payload) => request('/api/admin/challenges', { method: 'POST', body: payload, token }),
  adminUpdateChallenge: (token, id, payload) =>
    request(`/api/admin/challenges/${id}`, { method: 'PUT', body: payload, token }),
  adminDeleteChallenge: (token, id) => request(`/api/admin/challenges/${id}`, { method: 'DELETE', token }),

  adminListRounds: (token) => request('/api/admin/rounds', { token }),
  adminUpdateRound: (token, id, payload) => request(`/api/admin/rounds/${id}`, { method: 'PUT', body: payload, token }),

  adminListCheckpoints: (token) => request('/api/admin/qr', { token }),
  adminUpdateCheckpoint: (token, id, payload) => request(`/api/admin/qr/${id}`, { method: 'PUT', body: payload, token }),
  adminRegenerateCheckpoint: (token, id) => request(`/api/admin/qr/${id}/regenerate`, { method: 'POST', token }),
  adminCheckpointImagePath: (id) => `/api/admin/qr/${id}/image`,

  adminGetSettings: (token) => request('/api/admin/settings', { token }),
  adminUpdateSettings: (token, payload) => request('/api/admin/settings', { method: 'PUT', body: payload, token }),
  adminSetEventStatus: (token, status) =>
    request('/api/admin/event/status', { method: 'POST', body: { status }, token }),

  adminLeaderboard: (token) => request('/api/admin/leaderboard', { token }),
};
