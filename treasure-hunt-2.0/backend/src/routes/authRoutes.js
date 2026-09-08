const express = require('express');
const { teamLogin } = require('../controllers/authController');

const router = express.Router();
router.post('/team', teamLogin);

module.exports = router;
