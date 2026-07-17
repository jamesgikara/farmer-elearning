// backend/src/routes/auth.js
const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        auth, ctrl.me);

module.exports = router;
