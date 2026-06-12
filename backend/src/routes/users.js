const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/dashboard', authenticate, ctrl.getDashboard);
router.get('/notifications', authenticate, ctrl.getNotifications);
router.put('/notifications/read', authenticate, ctrl.markNotificationsRead);
router.get('/:userId', ctrl.getProfile);
router.put('/profile', authenticate,
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('bio').optional().isLength({ max: 500 }),
  validate,
  ctrl.updateProfile
);
router.put('/password', authenticate,
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  validate,
  ctrl.changePassword
);

module.exports = router;
