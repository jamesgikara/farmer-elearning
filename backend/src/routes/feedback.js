// backend/src/routes/feedback.js
const router = require('express').Router();
const ctrl   = require('../controllers/feedbackController');
const { auth, requireRole } = require('../middleware/authMiddleware');

router.get('/:module_id', auth, requireRole('officer', 'admin'), ctrl.getForModule);
router.post('/',          auth, ctrl.submit);
router.delete('/:id',     auth, requireRole('admin'), ctrl.remove);

module.exports = router;
