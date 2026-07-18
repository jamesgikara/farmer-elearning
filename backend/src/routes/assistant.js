// backend/src/routes/assistant.js
const router = require('express').Router();
const ctrl   = require('../controllers/assistantController');
const { auth } = require('../middleware/authMiddleware');

router.post('/ask', auth, ctrl.ask);

module.exports = router;