// backend/src/routes/modules.js
const router = require('express').Router();
const ctrl   = require('../controllers/modulesController');
const { auth, requireRole } = require('../middleware/authMiddleware');

router.get('/',     auth, ctrl.getAll);
router.get('/:id',  auth, ctrl.getOne);
router.post('/',    auth, requireRole('officer', 'admin'), ctrl.create);
router.put('/:id',  auth, requireRole('officer', 'admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
