const express = require('express');
const { getEventStatus, getStartQr } = require('../controllers/eventController');

const router = express.Router();
router.get('/status', getEventStatus);
router.get('/start-qr', getStartQr);

module.exports = router;
