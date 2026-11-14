const router = require('express').Router();
const { getStaff, createStaff, deleteStaff } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/', getStaff);
router.post('/', createStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
