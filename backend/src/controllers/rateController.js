const Rate = require('../models/Rate');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/rates
exports.getRates = asyncHandler(async (req, res) => {
  const rates = await Rate.find().sort({ vehicleType: 1 });
  res.json(rates);
});

// PUT /api/rates/:vehicleType  (admin)
exports.updateRate = asyncHandler(async (req, res) => {
  const { vehicleType } = req.params;
  const price = Number(req.body.pricePerHour);

  if (!['car', 'bike'].includes(vehicleType)) {
    res.status(400);
    throw new Error('Vehicle type must be car or bike');
  }
  if (Number.isNaN(price) || price < 0) {
    res.status(400);
    throw new Error('Price per hour must be a valid positive number');
  }

  const rate = await Rate.findOneAndUpdate(
    { vehicleType },
    { vehicleType, pricePerHour: price },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json(rate);
});
