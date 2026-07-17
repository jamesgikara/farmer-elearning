// backend/src/routes/users.js
const router = require('express').Router();
const ctrl   = require('../controllers/usersController');
const { auth, requireRole } = require('../middleware/authMiddleware');

router.get('/',      auth, requireRole('admin'), ctrl.getAll);
router.get('/:id',   auth, requireRole('admin'), ctrl.getOne);
router.put('/:id',   auth, requireRole('admin'), ctrl.update);
router.delete('/:id',auth, requireRole('admin'), ctrl.remove);

module.exports = router;
