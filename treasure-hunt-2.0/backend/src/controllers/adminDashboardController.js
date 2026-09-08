const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { TOTAL_ROUNDS } = require('../utils/huntFlow');

// GET /api/admin/dashboard — the Overview section of the admin panel.
const getDashboard = asyncHandler(async (req, res) => {
  const { data: teams, error: teamsError } = await supabase.from('teams').select('status, current_round');
  if (teamsError) throw new ApiError(500, 'Failed to load teams.');

  const { count: challengeCount, error: challengeError } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true });
  if (challengeError) throw new ApiError(500, 'Failed to load challenges.');

  const perRound = {};
  for (let n = 1; n <= TOTAL_ROUNDS; n += 1) perRound[n] = 0;

  let completed = 0;
  let playing = 0;
  let notStarted = 0;

  for (const team of teams) {
    if (team.status === 'COMPLETED') {
      completed += 1;
    } else if (team.current_round === 0) {
      notStarted += 1;
    } else {
      playing += 1;
      if (perRound[team.current_round] !== undefined) perRound[team.current_round] += 1;
    }
  }

  res.json({
    success: true,
    totals: {
      totalTeams: teams.length,
      teamsPlaying: playing,
      teamsNotStarted: notStarted,
      teamsCompleted: completed,
      totalChallenges: challengeCount ?? 0,
    },
    teamsPerRound: perRound,
  });
});

module.exports = { getDashboard };
