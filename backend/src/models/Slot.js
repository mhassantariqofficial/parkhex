const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: ['car', 'bike'], required: [true, 'Slot type is required'] },
    status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', slotSchema);
