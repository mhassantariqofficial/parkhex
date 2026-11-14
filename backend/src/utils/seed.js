// Run with: npm run seed
// Creates the default admin, a staff user, rates and sample parking slots.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Rate = require('../models/Rate');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Users (skipped if they already exist)
  const users = [
    { name: 'Admin', email: 'admin@parkhex.com', password: 'admin123', role: 'admin' },
    { name: 'Guard Ali', email: 'staff@parkhex.com', password: 'staff123', role: 'staff' },
  ];
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Created ${u.role}: ${u.email} / ${u.password}`);
    }
  }

  // Rates
  const rates = [
    { vehicleType: 'car', pricePerHour: 100 },
    { vehicleType: 'bike', pricePerHour: 50 },
  ];
  for (const r of rates) {
    await Rate.updateOne({ vehicleType: r.vehicleType }, { $setOnInsert: r }, { upsert: true });
  }
  console.log('Rates ready (car 100/hr, bike 50/hr)');

  // Slots: A1-A10 for cars, B1-B6 for bikes
  const slots = [];
  for (let i = 1; i <= 10; i++) slots.push({ slotNumber: `A${i}`, type: 'car' });
  for (let i = 1; i <= 6; i++) slots.push({ slotNumber: `B${i}`, type: 'bike' });
  for (const s of slots) {
    await Slot.updateOne({ slotNumber: s.slotNumber }, { $setOnInsert: s }, { upsert: true });
  }
  console.log(`Slots ready (${slots.length} slots)`);

  await mongoose.disconnect();
  console.log('Seeding finished.');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
