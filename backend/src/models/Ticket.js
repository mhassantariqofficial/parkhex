const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    plateNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleType: { type: String, enum: ['car', 'bike'], required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    slotNumber: { type: String, required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    ratePerHour: { type: Number, required: true },
    totalHours: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['parked', 'exited'], default: 'parked' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    exitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ticketSchema.index({ plateNumber: 1, status: 1 });
ticketSchema.index({ exitTime: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
