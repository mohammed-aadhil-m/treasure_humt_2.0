const express = require('express');
const { requireTeam } = require('../middleware/teamAuth');
const { startHunt, getCurrentState } = require('../controllers/huntController');

const router = express.Router();
router.post('/start', requireTeam, startHunt);
router.get('/current', requireTeam, getCurrentState);

module.exports = router;
