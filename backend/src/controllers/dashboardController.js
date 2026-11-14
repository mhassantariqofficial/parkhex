const Slot = require('../models/Slot');
const Ticket = require('../models/Ticket');
const asyncHandler = require('../utils/asyncHandler');
const { startOfLocalDay } = require('../utils/dates');

// GET /api/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const todayStart = startOfLocalDay();

  const [totalSlots, availableSlots, occupiedSlots, parkedNow, todayAgg, entriesToday, recent] =
    await Promise.all([
      Slot.countDocuments(),
      Slot.countDocuments({ status: 'available' }),
      Slot.countDocuments({ status: 'occupied' }),
      Ticket.countDocuments({ status: 'parked' }),
      Ticket.aggregate([
        { $match: { status: 'exited', exitTime: { $gte: todayStart } } },
        { $group: { _id: null, income: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Ticket.countDocuments({ entryTime: { $gte: todayStart } }),
      Ticket.find().sort({ updatedAt: -1 }).limit(8),
    ]);

  res.json({
    totalSlots,
    availableSlots,
    occupiedSlots,
    parkedNow,
    todayIncome: todayAgg[0]?.income || 0,
    exitsToday: todayAgg[0]?.count || 0,
    entriesToday,
    recent,
  });
});
