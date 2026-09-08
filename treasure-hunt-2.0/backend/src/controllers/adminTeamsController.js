const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { getRankedTeams, toLeaderboardRow } = require('../utils/leaderboard');

// GET /api/admin/teams — list every team with a quick-glance summary,
// ordered the same way the leaderboard is (so admins see who's leading).
const listTeams = asyncHandler(async (req, res) => {
  const ranked = await getRankedTeams();
  res.json({ success: true, teams: ranked.map(toLeaderboardRow) });
});

// GET /api/admin/teams/:id — full detail for the Team Monitor panel.
const getTeamDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: team, error: teamError } = await supabase.from('teams').select('*').eq('id', id).maybeSingle();
  if (teamError) throw new ApiError(500, 'Failed to load team.');
  if (!team) throw new ApiError(404, 'Team not found.');

  const { data: assignments } = await supabase
    .from('team_challenges')
    .select('*, challenges(code, type, question, round_id), rounds(round_number, name)')
    .eq('team_id', id)
    .order('assigned_at', { ascending: true });

  const { data: progress } = await supabase
    .from('team_progress')
    .select('*, rounds(round_number, name), qr_checkpoints(checkpoint_number)')
    .eq('team_id', id)
    .order('started_at', { ascending: true });

  const { data: attempts } = await supabase
    .from('answer_attempts')
    .select('*')
    .eq('team_id', id)
    .order('created_at', { ascending: true });

  res.json({
    success: true,
    team,
    assignments: assignments ?? [],
    checkpointsReached: progress ?? [],
    attempts: attempts ?? [],
  });
});

// POST /api/admin/teams — create a single team.
const createTeam = asyncHandler(async (req, res) => {
  const { teamCode, teamName, members } = req.body;
  if (!teamCode || !teamName) throw new ApiError(400, 'teamCode and teamName are required.');

  const memberList = Array.isArray(members)
    ? members.map((m) => String(m).trim()).filter(Boolean)
    : [];

  if (memberList.length > 2) {
    throw new ApiError(400, 'A team can have a maximum of 2 members.');
  }

  const { data, error } = await supabase
    .from('teams')
    .insert({ team_code: teamCode.trim(), team_name: teamName.trim(), members: memberList })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new ApiError(409, 'That Team ID or Team Name is already in use.');
    throw new ApiError(500, 'Failed to create team.');
  }

  res.status(201).json({ success: true, team: data });
});

// POST /api/admin/teams/import — bulk create teams at once, e.g. from a
// spreadsheet of registrations. Skips (rather than fails) rows whose team
// code already exists so one bad row doesn't block the rest of the import.
const importTeams = asyncHandler(async (req, res) => {
  const { teams } = req.body;
  if (!Array.isArray(teams) || teams.length === 0) {
    throw new ApiError(400, 'Provide a non-empty "teams" array.');
  }

  const rows = teams
    .filter((t) => t.teamCode && t.teamName)
    .map((t) => ({
      team_code: String(t.teamCode).trim(),
      team_name: String(t.teamName).trim(),
      members: (Array.isArray(t.members) ? t.members : [])
        .map((m) => String(m).trim())
        .filter(Boolean)
        .slice(0, 2),
    }));

  const { data, error } = await supabase.from('teams').upsert(rows, { onConflict: 'team_code', ignoreDuplicates: true }).select('*');

  if (error) throw new ApiError(500, 'Import failed.');

  res.status(201).json({ success: true, imported: data.length, teams: data });
});

// DELETE /api/admin/teams/:id — removes a team and (via ON DELETE CASCADE)
// all of its assignments, progress, sessions, and answer history.
const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('teams').delete().eq('id', id);
  if (error) throw new ApiError(500, 'Failed to delete team.');
  res.json({ success: true });
});

module.exports = { listTeams, getTeamDetail, createTeam, importTeams, deleteTeam };
