const express = require('express');
const { requireTeam } = require('../middleware/teamAuth');
const { getProgress } = require('../controllers/huntController');

const router = express.Router();
router.get('/', requireTeam, getProgress);

module.exports = router;
