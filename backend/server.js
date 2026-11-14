require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'ParkHex API' }));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/slots', require('./src/routes/slotRoutes'));
app.use('/api/rates', require('./src/routes/rateRoutes'));
app.use('/api/staff', require('./src/routes/staffRoutes'));
app.use('/api/tickets', require('./src/routes/ticketRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`ParkHex API running on port ${PORT}`));
  });
}

module.exports = app;
