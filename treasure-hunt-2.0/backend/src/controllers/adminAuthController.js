const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { signAdminToken } = require('../utils/jwt');

// POST /api/admin/login
// Admin accounts are created via `npm run create-admin` (see backend/scripts/createAdmin.js),
// never through a public signup route.
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required.');

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();

  if (error) throw new ApiError(500, 'Login failed. Please try again.');
  if (!admin) throw new ApiError(401, 'Invalid email or password.');

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid email or password.');

  const token = signAdminToken(admin);
  res.json({ success: true, token, admin: { id: admin.id, email: admin.email } });
});

module.exports = { adminLogin };
