const rateLimit = require('express-rate-limit');

// Slows down answer-spamming / brute-force guessing without punishing normal
// play. Applied to the answer-submission and QR-scan routes.
const answerRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please slow down and try again shortly.' },
});

const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

module.exports = { answerRateLimiter, adminLoginRateLimiter };
