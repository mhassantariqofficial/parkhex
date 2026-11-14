const router = require('express').Router();
const {
  vehicleEntry,
  vehicleExit,
  previewExit,
  getActive,
  getHistory,
  getTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/entry', vehicleEntry);
router.get('/active', getActive);
router.get('/history', getHistory);
router.get('/:id/preview', previewExit);
router.post('/:id/exit', vehicleExit);
router.get('/:id', getTicket);

module.exports = router;
