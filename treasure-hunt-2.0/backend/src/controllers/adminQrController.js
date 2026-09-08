const crypto = require('crypto');
const QRCode = require('qrcode');
const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

function scanUrlFor(secureToken) {
  const base = (process.env.PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}/hunt/qr/${secureToken}`;
}

// GET /api/admin/qr — the participant app never sees this list; only the
// organizer's dashboard does.
const listCheckpoints = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('qr_checkpoints')
    .select('*')
    .order('checkpoint_number', { ascending: true });
  if (error) throw new ApiError(500, 'Failed to load QR checkpoints.');

  const withUrls = data.map((cp) => ({ ...cp, scan_url: scanUrlFor(cp.secure_token) }));
  res.json({ success: true, checkpoints: withUrls });
});

// PUT /api/admin/qr/:id — set the physical location note, hint note, or
// active/inactive state for a checkpoint.
const updateCheckpoint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { internalLocation, hintNote, isActive } = req.body;

  const updates = {};
  if (internalLocation !== undefined) updates.internal_location = internalLocation;
  if (hintNote !== undefined) updates.hint_note = hintNote;
  if (isActive !== undefined) updates.is_active = isActive;

  const { data, error } = await supabase.from('qr_checkpoints').update(updates).eq('id', id).select('*').single();
  if (error) throw new ApiError(500, 'Failed to update checkpoint.');

  res.json({ success: true, checkpoint: { ...data, scan_url: scanUrlFor(data.secure_token) } });
});

// POST /api/admin/qr/:id/regenerate — invalidates the old printed/posted QR
// code (e.g. if a photo of it leaked) by issuing a fresh secure token.
const regenerateCheckpoint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const newToken = crypto.randomBytes(16).toString('hex');

  const { data, error } = await supabase
    .from('qr_checkpoints')
    .update({ secure_token: newToken })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new ApiError(500, 'Failed to regenerate QR token.');

  res.json({ success: true, checkpoint: { ...data, scan_url: scanUrlFor(data.secure_token) } });
});

// GET /api/admin/qr/:id/image — a scannable PNG for printing or projecting.
const getCheckpointImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: checkpoint, error } = await supabase.from('qr_checkpoints').select('*').eq('id', id).maybeSingle();
  if (error || !checkpoint) throw new ApiError(404, 'Checkpoint not found.');

  const png = await QRCode.toBuffer(scanUrlFor(checkpoint.secure_token), {
    type: 'png',
    width: 640,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store');
  res.send(png);
});

module.exports = { listCheckpoints, updateCheckpoint, regenerateCheckpoint, getCheckpointImage };
