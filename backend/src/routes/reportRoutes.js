const router = require('express').Router();
const { incomeReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/income', protect, authorize('admin'), incomeReport);

module.exports = router;
