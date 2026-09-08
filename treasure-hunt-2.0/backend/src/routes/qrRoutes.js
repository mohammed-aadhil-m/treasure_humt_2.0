const express = require('express');
const { requireTeam } = require('../middleware/teamAuth');
const { answerRateLimiter } = require('../middleware/rateLimiter');
const { scanCheckpoint } = require('../controllers/qrController');

const router = express.Router();
router.post('/scan', requireTeam, answerRateLimiter, scanCheckpoint);

module.exports = router;
