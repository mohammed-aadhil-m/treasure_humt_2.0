const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { getEventSettings } = require('../utils/eventSettings');
const { getRankedTeams, toLeaderboardRow } = require('../utils/leaderboard');

const VALID_STATUSES = ['NOT_STARTED', 'RUNNING', 'PAUSED', 'ENDED'];

// GET /api/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getEventSettings();
  res.json({ success: true, settings });
});

// PUT /api/admin/settings — event name/tagline/date/leaderboard visibility
// and event-wide scoring defaults. Does not change the running status —
// use POST /api/admin/event/status for that (clearer audit trail).
const updateSettings = asyncHandler(async (req, res) => {
  const { eventName, tagline, eventDate, leaderboardVisible, defaultMaxAttempts, wrongAnswerPenalty, hintPenalty } =
    req.body;

  const updates = { updated_at: new Date().toISOString() };
  if (eventName !== undefined) updates.event_name = eventName;
  if (tagline !== undefined) updates.tagline = tagline;
  if (eventDate !== undefined) updates.event_date = eventDate;
  if (leaderboardVisible !== undefined) updates.leaderboard_visible = leaderboardVisible;
  if (defaultMaxAttempts !== undefined) updates.default_max_attempts = defaultMaxAttempts;
  if (wrongAnswerPenalty !== undefined) updates.wrong_answer_penalty = wrongAnswerPenalty;
  if (hintPenalty !== undefined) updates.hint_penalty = hintPenalty;

  const { data, error } = await supabase.from('event_settings').update(updates).eq('id', 1).select('*').single();
  if (error) throw new ApiError(500, 'Failed to update settings.');

  res.json({ success: true, settings: data });
});

// POST /api/admin/event/status — { status: 'RUNNING' | 'PAUSED' | 'ENDED' }
// This is the Start / Pause / Resume / End control from section 34.
// "Resume" is just setting status back to RUNNING from PAUSED.
const setEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('event_settings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select('*')
    .single();
  if (error) throw new ApiError(500, 'Failed to update event status.');

  res.json({ success: true, settings: data });
});

// GET /api/admin/leaderboard — same ranking as the public one, but always
// visible to the organizer regardless of the public visibility toggle.
const getAdminLeaderboard = asyncHandler(async (req, res) => {
  const ranked = await getRankedTeams();
  res.json({ success: true, leaderboard: ranked.map(toLeaderboardRow) });
});

module.exports = { getSettings, updateSettings, setEventStatus, getAdminLeaderboard };
