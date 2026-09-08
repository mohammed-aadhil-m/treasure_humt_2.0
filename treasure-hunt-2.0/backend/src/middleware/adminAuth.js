const { verifyAdminToken } = require('../utils/jwt');
const { ApiError } = require('../utils/ApiError');

// Protects /api/admin/* routes. Expects "Authorization: Bearer <token>".
function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Admin authentication required.');

    req.admin = verifyAdminToken(token);
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired admin session.'));
  }
}

module.exports = { requireAdmin };
