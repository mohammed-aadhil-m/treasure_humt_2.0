const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { advanceViaCheckpoint, buildHuntState, buildProgressArray } = require('../utils/huntFlow');

// POST /api/hunt/start — the team scans the public QR #1 and submits it here
// together with their team session. Re-scanning QR #1 after already having
// started is treated as idempotent (just returns current state) rather than
// an error, since a team member might scan it again by habit.
const startHunt = asyncHandler(async (req, res) => {
  const { qrToken } = req.body;
  if (!qrToken) throw new ApiError(400, 'Missing QR code data. Please scan QR #1 again.');

  if (req.team.current_round > 0) {
    const state = await buildHuntState(req.team);
    return res.json({ success: true, ...state });
  }

  const state = await advanceViaCheckpoint(req.team, qrToken);
  res.json({ success: true, ...state });
});

// GET /api/hunt/current — the single polling endpoint the frontend uses to
// decide what screen to render. Always reflects server-side truth.
const getCurrentState = asyncHandler(async (req, res) => {
  const state = await buildHuntState(req.team);
  res.json({ success: true, ...state });
});

// GET /api/progress — a lightweight round-by-round status array (completed /
// current / locked). Never includes QR locations, tokens, or future
// challenge content — just enough to render the progress rail.
const getProgress = asyncHandler(async (req, res) => {
  const progress = await buildProgressArray(req.team);
  res.json({ success: true, progress });
});

module.exports = { startHunt, getCurrentState, getProgress };
