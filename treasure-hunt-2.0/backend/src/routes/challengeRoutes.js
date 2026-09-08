const express = require('express');
const { requireTeam } = require('../middleware/teamAuth');
const { answerRateLimiter } = require('../middleware/rateLimiter');
const { getCurrentChallenge, submitAnswer } = require('../controllers/challengeController');

const router = express.Router();
router.get('/current', requireTeam, getCurrentChallenge);
router.post('/answer', requireTeam, answerRateLimiter, submitAnswer);

module.exports = router;
