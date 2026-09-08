const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { advanceViaCheckpoint } = require('../utils/huntFlow');

// POST /api/qr/scan — a team scans a physically-hidden QR code (#2 - #5).
// All sequencing/validation happens here on the backend; the frontend never
// decides whether a checkpoint is "allowed".
const scanCheckpoint = asyncHandler(async (req, res) => {
  const { qrToken } = req.body;
  if (!qrToken) throw new ApiError(400, 'Missing QR code data.');

  const state = await advanceViaCheckpoint(req.team, qrToken);
  res.json({ success: true, ...state });
});

module.exports = { scanCheckpoint };
