const router = require('express').Router();
const { getSlots, createSlot, updateSlot, deleteSlot } = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getSlots);
router.post('/', authorize('admin'), createSlot);
router.put('/:id', authorize('admin'), updateSlot);
router.delete('/:id', authorize('admin'), deleteSlot);

module.exports = router;
