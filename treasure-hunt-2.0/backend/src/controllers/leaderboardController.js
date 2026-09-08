const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { getEventSettings } = require('../utils/eventSettings');
const { getRankedTeams, toLeaderboardRow } = require('../utils/leaderboard');

// GET /api/leaderboard — public leaderboard for the live screen. Respects
// the admin's "hide leaderboard during the event" toggle.
const getPublicLeaderboard = asyncHandler(async (req, res) => {
  const settings = await getEventSettings();
  if (!settings.leaderboard_visible) {
    throw new ApiError(403, 'The leaderboard is hidden for now. Check back later.');
  }

  const ranked = await getRankedTeams();
  const rows = ranked.map(toLeaderboardRow);
  res.json({ success: true, leaderboard: rows });
});

module.exports = { getPublicLeaderboard };
