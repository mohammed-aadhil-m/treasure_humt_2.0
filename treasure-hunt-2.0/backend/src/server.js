require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const huntRoutes = require('./routes/huntRoutes');
const progressRoutes = require('./routes/progressRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const qrRoutes = require('./routes/qrRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const configuredOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl/Postman)
      if (!origin) return callback(null, true);

      // Check configured origins
      if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      // Automatically allow local network IPs for mobile device testing (e.g. scanning QR on LAN)
      if (
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
          origin
        )
      ) {
        return callback(null, true);
      }

      return callback(null, true); // Permissive in dev to ensure mobile QR scanning never fails
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ success: true, service: 'treasure-hunt-2.0-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/hunt', huntRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found.' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TREASURE HUNT 2.0 API listening on port ${PORT}`);
});
