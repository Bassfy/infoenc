const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/labController');

router.get('/leaderboard', ctrl.getLeaderboard);
router.get('/', ctrl.listLabs);
router.get('/:slug', ctrl.getLab);
router.post('/:slug/submit', authenticate, ctrl.submitFlag);
router.get('/:slug/hint', authenticate, ctrl.getHint);

module.exports = router;
