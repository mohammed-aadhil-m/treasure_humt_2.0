const QRCode = require('qrcode');
const { supabase } = require('../config/supabaseClient');
const { asyncHandler } = require('../utils/asyncHandler');
const { getEventSettings } = require('../utils/eventSettings');
const { ApiError } = require('../utils/ApiError');

function scanUrlFor(secureToken, req) {
  let base = process.env.PUBLIC_FRONTEND_URL;
  if (!base && req) {
    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    if (hostHeader) {
      const hostname = hostHeader.split(':')[0];
      base = `http://${hostname}:5173`;
    }
  }
  base = (base || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}/hunt/qr/${secureToken}`;
}

// GET /api/event/status — public, unauthenticated. Powers the landing page
// branding and lets any screen detect a paused/ended event.
const getEventStatus = asyncHandler(async (req, res) => {
  const settings = await getEventSettings();
  res.json({
    success: true,
    eventName: settings.event_name,
    tagline: settings.tagline,
    eventDate: settings.event_date,
    status: settings.status,
  });
});

// GET /api/event/start-qr — public display endpoint for Checkpoint #1
// Allows the admin to project the starting QR code on TVs/projectors without needing credentials.
const getStartQr = asyncHandler(async (req, res) => {
  const settings = await getEventSettings();
  const { data: checkpoint, error } = await supabase
    .from('qr_checkpoints')
    .select('*')
    .eq('checkpoint_number', 1)
    .maybeSingle();

  if (error || !checkpoint) {
    throw new ApiError(404, 'Starting QR checkpoint (#1) is not configured.');
  }

  const scanUrl = scanUrlFor(checkpoint.secure_token, req);
  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 600,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  res.json({
    success: true,
    eventName: settings.event_name,
    tagline: settings.tagline,
    checkpointNumber: 1,
    secureToken: checkpoint.secure_token,
    scanUrl,
    qrDataUrl,
  });
});

module.exports = { getEventStatus, getStartQr };
