const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/courseController');

router.get('/categories', ctrl.getCategories);
router.get('/', ctrl.listCourses);
router.get('/my', authenticate, ctrl.getMyCourses);
router.get('/:slug', ctrl.getCourse);
router.post('/:courseId/enroll', authenticate, ctrl.enroll);
router.get('/lesson/:lessonId', authenticate, ctrl.getLesson);
router.post('/lesson/:lessonId/complete', authenticate, ctrl.markLessonComplete);

module.exports = router;
