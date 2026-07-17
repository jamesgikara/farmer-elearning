// backend/src/routes/downloads.js
const router = require('express').Router();
const ctrl   = require('../controllers/downloadsController');
const { auth } = require('../middleware/authMiddleware');

router.get('/',                 auth, ctrl.getDownloads);
router.post('/',                auth, ctrl.recordDownload);
router.delete('/:module_id',    auth, ctrl.removeDownload);

module.exports = router;
