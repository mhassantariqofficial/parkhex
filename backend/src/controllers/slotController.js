const Slot = require('../models/Slot');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/slots?status=available&type=car
exports.getSlots = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const slots = await Slot.find(filter).collation({ locale: 'en', numericOrdering: true }).sort({ slotNumber: 1 });
  res.json(slots);
});

// POST /api/slots  (admin)
exports.createSlot = asyncHandler(async (req, res) => {
  const { slotNumber, type } = req.body;
  const slot = await Slot.create({ slotNumber, type });
  res.status(201).json(slot);
});

// PUT /api/slots/:id  (admin)
exports.updateSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) {
    res.status(404);
    throw new Error('Slot not found');
  }
  if (slot.status === 'occupied') {
    res.status(400);
    throw new Error('An occupied slot cannot be edited');
  }

  if (req.body.slotNumber !== undefined) slot.slotNumber = req.body.slotNumber;
  if (req.body.type !== undefined) slot.type = req.body.type;
  await slot.save();
  res.json(slot);
});

// DELETE /api/slots/:id  (admin)
exports.deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) {
    res.status(404);
    throw new Error('Slot not found');
  }
  if (slot.status === 'occupied') {
    res.status(400);
    throw new Error('An occupied slot cannot be deleted');
  }
  await slot.deleteOne();
  res.json({ message: 'Slot deleted' });
});
