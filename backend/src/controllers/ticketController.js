const Ticket = require('../models/Ticket');
const Slot = require('../models/Slot');
const Rate = require('../models/Rate');
const asyncHandler = require('../utils/asyncHandler');
const { parseLocalDate } = require('../utils/dates');

const HOUR_MS = 60 * 60 * 1000;

// Billing rule: time is rounded UP to the next full hour. Minimum is 1 hour.
const calculateBill = (entryTime, exitTime, ratePerHour) => {
  const diff = exitTime.getTime() - new Date(entryTime).getTime();
  const totalHours = Math.max(1, Math.ceil(diff / HOUR_MS));
  return { totalHours, amount: totalHours * ratePerHour };
};

const generateTicketId = () => {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PH-${Date.now().toString(36).toUpperCase()}${rand}`;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const populateTicket = (query) =>
  query.populate('createdBy', 'name').populate('exitedBy', 'name');

// POST /api/tickets/entry
exports.vehicleEntry = asyncHandler(async (req, res) => {
  const plateNumber = (req.body.plateNumber || '').toString().trim().toUpperCase();
  const { vehicleType, slotId } = req.body;

  if (!plateNumber || !vehicleType || !slotId) {
    res.status(400);
    throw new Error('Plate number, vehicle type and slot are required');
  }
  if (!['car', 'bike'].includes(vehicleType)) {
    res.status(400);
    throw new Error('Vehicle type must be car or bike');
  }

  // Rule: the same vehicle cannot be parked twice
  const alreadyParked = await Ticket.findOne({ plateNumber, status: 'parked' });
  if (alreadyParked) {
    res.status(400);
    throw new Error(`Vehicle ${plateNumber} is already parked in slot ${alreadyParked.slotNumber}`);
  }

  const rate = await Rate.findOne({ vehicleType });
  if (!rate) {
    res.status(400);
    throw new Error(`No rate is set for ${vehicleType}. Please ask the admin to set rates.`);
  }

  const slot = await Slot.findById(slotId);
  if (!slot) {
    res.status(404);
    throw new Error('Slot not found');
  }
  if (slot.type !== vehicleType) {
    res.status(400);
    throw new Error(`Slot ${slot.slotNumber} is for ${slot.type}s only`);
  }

  // Atomic update: only one request can take an available slot
  const taken = await Slot.findOneAndUpdate(
    { _id: slotId, status: 'available' },
    { status: 'occupied' },
    { new: true }
  );
  if (!taken) {
    res.status(400);
    throw new Error(`Slot ${slot.slotNumber} is already occupied`);
  }

  let ticket;
  try {
    ticket = await Ticket.create({
      ticketId: generateTicketId(),
      plateNumber,
      vehicleType,
      slot: taken._id,
      slotNumber: taken.slotNumber,
      entryTime: new Date(),
      ratePerHour: rate.pricePerHour,
      createdBy: req.user._id,
    });
  } catch (err) {
    // Roll back the slot if the ticket could not be saved
    await Slot.findByIdAndUpdate(slotId, { status: 'available' });
    throw err;
  }

  res.status(201).json(await populateTicket(Ticket.findById(ticket._id)));
});

// GET /api/tickets/:id/preview  -> current bill without closing the ticket
exports.previewExit = asyncHandler(async (req, res) => {
  const ticket = await populateTicket(Ticket.findById(req.params.id));
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  if (ticket.status !== 'parked') {
    res.status(400);
    throw new Error('This vehicle has already exited');
  }
  const now = new Date();
  const bill = calculateBill(ticket.entryTime, now, ticket.ratePerHour);
  res.json({ ticket, exitTime: now, ...bill });
});

// POST /api/tickets/:id/exit
exports.vehicleExit = asyncHandler(async (req, res) => {
  const existing = await Ticket.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  const exitTime = new Date();
  const { totalHours, amount } = calculateBill(existing.entryTime, exitTime, existing.ratePerHour);

  // Atomic: only closes the ticket if it is still "parked"
  const ticket = await Ticket.findOneAndUpdate(
    { _id: existing._id, status: 'parked' },
    { status: 'exited', exitTime, totalHours, amount, exitedBy: req.user._id },
    { new: true }
  );
  if (!ticket) {
    res.status(400);
    throw new Error('This vehicle has already exited');
  }

  await Slot.findByIdAndUpdate(ticket.slot, { status: 'available' });
  res.json(await populateTicket(Ticket.findById(ticket._id)));
});

// GET /api/tickets/active?q=
exports.getActive = asyncHandler(async (req, res) => {
  const filter = { status: 'parked' };
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    filter.$or = [{ plateNumber: rx }, { ticketId: rx }, { slotNumber: rx }];
  }
  const tickets = await Ticket.find(filter).sort({ entryTime: -1 });
  res.json(tickets);
});

// GET /api/tickets/history?q=&vehicleType=&from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=10
exports.getHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const filter = { status: 'exited' };
  if (req.query.vehicleType) filter.vehicleType = req.query.vehicleType;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    filter.$or = [{ plateNumber: rx }, { ticketId: rx }];
  }

  const from = parseLocalDate(req.query.from);
  const to = parseLocalDate(req.query.to);
  if (from || to) {
    filter.exitTime = {};
    if (from) filter.exitTime.$gte = from;
    if (to) filter.exitTime.$lt = new Date(to.getTime() + 24 * HOUR_MS); // include the whole "to" day
  }

  const [total, tickets] = await Promise.all([
    Ticket.countDocuments(filter),
    Ticket.find(filter)
      .sort({ exitTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.json({ tickets, page, pages: Math.max(1, Math.ceil(total / limit)), total });
});

// GET /api/tickets/:id
exports.getTicket = asyncHandler(async (req, res) => {
  const ticket = await populateTicket(Ticket.findById(req.params.id));
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  res.json(ticket);
});
