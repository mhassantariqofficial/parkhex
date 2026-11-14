const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, enum: ['car', 'bike'], required: true, unique: true },
    pricePerHour: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rate', rateSchema);
