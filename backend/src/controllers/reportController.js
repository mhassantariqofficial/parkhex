const Ticket = require('../models/Ticket');
const asyncHandler = require('../utils/asyncHandler');
const { offsetString, parseLocalDate, startOfLocalDay } = require('../utils/dates');

const DAY_MS = 24 * 60 * 60 * 1000;

// GET /api/reports/income?group=daily|monthly&from=YYYY-MM-DD&to=YYYY-MM-DD  (admin)
exports.incomeReport = asyncHandler(async (req, res) => {
  const group = req.query.group === 'monthly' ? 'monthly' : 'daily';

  // Default range: last 30 days (daily) or last 12 months (monthly)
  const today = startOfLocalDay();
  const to = parseLocalDate(req.query.to) || today;
  const from =
    parseLocalDate(req.query.from) ||
    new Date(to.getTime() - (group === 'monthly' ? 365 : 29) * DAY_MS);

  const format = group === 'monthly' ? '%Y-%m' : '%Y-%m-%d';

  const rows = await Ticket.aggregate([
    {
      $match: {
        status: 'exited',
        exitTime: { $gte: from, $lt: new Date(to.getTime() + DAY_MS) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format, date: '$exitTime', timezone: offsetString() } },
        income: { $sum: '$amount' },
        vehicles: { $sum: 1 },
        cars: { $sum: { $cond: [{ $eq: ['$vehicleType', 'car'] }, 1, 0] } },
        bikes: { $sum: { $cond: [{ $eq: ['$vehicleType', 'bike'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const data = rows.map((r) => ({
    period: r._id,
    income: r.income,
    vehicles: r.vehicles,
    cars: r.cars,
    bikes: r.bikes,
  }));

  res.json({
    group,
    from,
    to,
    totalIncome: data.reduce((s, r) => s + r.income, 0),
    totalVehicles: data.reduce((s, r) => s + r.vehicles, 0),
    data,
  });
});
