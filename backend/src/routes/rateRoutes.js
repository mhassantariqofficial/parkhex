const router = require('express').Router();
const { getRates, updateRate } = require('../controllers/rateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getRates);
router.put('/:vehicleType', authorize('admin'), updateRate);

module.exports = router;
