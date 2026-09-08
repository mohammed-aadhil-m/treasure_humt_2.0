const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'insecure-dev-secret-change-me';

function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email, role: 'admin' }, SECRET, {
    expiresIn: '12h',
  });
}

function verifyAdminToken(token) {
  const payload = jwt.verify(token, SECRET);
  if (payload.role !== 'admin') throw new Error('Not an admin token');
  return payload;
}

module.exports = { signAdminToken, verifyAdminToken };
