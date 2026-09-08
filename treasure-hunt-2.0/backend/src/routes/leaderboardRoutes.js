const express = require('express');
const { getPublicLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();
router.get('/', getPublicLeaderboard);

module.exports = router;
