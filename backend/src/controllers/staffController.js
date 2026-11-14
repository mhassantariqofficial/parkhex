const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/staff  (admin)
exports.getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: 'staff' }).sort({ createdAt: -1 });
  res.json(staff);
});

// POST /api/staff  (admin)
exports.createStaff = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: 'staff' });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
});

// DELETE /api/staff/:id  (admin)
exports.deleteStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'staff') {
    res.status(404);
    throw new Error('Staff member not found');
  }
  await user.deleteOne();
  res.json({ message: 'Staff member removed' });
});
