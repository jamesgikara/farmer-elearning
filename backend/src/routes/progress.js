// backend/src/routes/progress.js
const router = require('express').Router();
const ctrl   = require('../controllers/progressController');
const { auth } = require('../middleware/authMiddleware');

router.get('/',  auth, ctrl.getProgress);
router.post('/', auth, ctrl.markComplete);

module.exports = router;
