const express = require('express');
const { requireAdmin } = require('../middleware/adminAuth');
const { adminLoginRateLimiter } = require('../middleware/rateLimiter');

const { adminLogin } = require('../controllers/adminAuthController');
const { getDashboard } = require('../controllers/adminDashboardController');
const {
  listTeams,
  getTeamDetail,
  createTeam,
  importTeams,
  deleteTeam,
} = require('../controllers/adminTeamsController');
const {
  listChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  listRounds,
  updateRound,
} = require('../controllers/adminChallengesController');
const {
  listCheckpoints,
  updateCheckpoint,
  regenerateCheckpoint,
  getCheckpointImage,
} = require('../controllers/adminQrController');
const {
  getSettings,
  updateSettings,
  setEventStatus,
  getAdminLeaderboard,
} = require('../controllers/adminSettingsController');

const router = express.Router();

// Public within /admin: login only. Everything else below requires a valid
// admin JWT issued by this route.
router.post('/login', adminLoginRateLimiter, adminLogin);

router.use(requireAdmin);

router.get('/dashboard', getDashboard);

router.get('/teams', listTeams);
router.post('/teams', createTeam);
router.post('/teams/import', importTeams);
router.get('/teams/:id', getTeamDetail);
router.delete('/teams/:id', deleteTeam);

router.get('/challenges', listChallenges);
router.post('/challenges', createChallenge);
router.put('/challenges/:id', updateChallenge);
router.delete('/challenges/:id', deleteChallenge);

router.get('/rounds', listRounds);
router.put('/rounds/:id', updateRound);

router.get('/qr', listCheckpoints);
router.put('/qr/:id', updateCheckpoint);
router.post('/qr/:id/regenerate', regenerateCheckpoint);
router.get('/qr/:id/image', getCheckpointImage);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/event/status', setEventStatus);

router.get('/leaderboard', getAdminLeaderboard);

module.exports = router;
