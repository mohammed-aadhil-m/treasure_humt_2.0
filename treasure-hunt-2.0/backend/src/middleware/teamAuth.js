const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');

// Protects participant routes. Expects "Authorization: Bearer <session_token>"
// issued by POST /api/auth/team. Loads the fresh team row onto req.team so
// every downstream handler works off the server's view of state, never the
// client's claims about its own round/score.
async function requireTeam(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Team session required. Please start the hunt again.');

    const { data: session, error: sessionError } = await supabase
      .from('team_sessions')
      .select('team_id, expires_at')
      .eq('session_token', token)
      .maybeSingle();

    if (sessionError) throw new ApiError(500, 'Session lookup failed.');
    if (!session) throw new ApiError(401, 'Session not found. Please start the hunt again.');
    if (new Date(session.expires_at) < new Date()) {
      throw new ApiError(401, 'Session expired. Please start the hunt again.');
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', session.team_id)
      .maybeSingle();

    if (teamError || !team) throw new ApiError(401, 'Team not found.');

    req.team = team;
    next();
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(500, 'Authentication failed.'));
  }
}

module.exports = { requireTeam };
