// backend/src/routes/reports.js
const router = require('express').Router();
const ctrl   = require('../controllers/reportsController');
const { auth, requireRole } = require('../middleware/authMiddleware');

router.get('/summary',             auth, requireRole('admin'), ctrl.summary);
router.get('/completion',          auth, requireRole('admin', 'officer'), ctrl.completion);
router.get('/category-engagement', auth, requireRole('admin', 'officer'), ctrl.categoryEngagement);

module.exports = router;
