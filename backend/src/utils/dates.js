// Helpers for working with "local" days using a fixed UTC offset (TZ_OFFSET_MINUTES)

const offsetMinutes = () => parseInt(process.env.TZ_OFFSET_MINUTES || '0', 10);

// Offset string like "+05:00" for MongoDB $dateToString
const offsetString = () => {
  const total = offsetMinutes();
  const sign = total >= 0 ? '+' : '-';
  const abs = Math.abs(total);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
};

// Start of the local day (as a UTC Date) for the given moment
const startOfLocalDay = (date = new Date()) => {
  const ms = offsetMinutes() * 60 * 1000;
  const local = new Date(date.getTime() + ms);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - ms);
};

// Parse "YYYY-MM-DD" as the start of that local day
const parseLocalDate = (str) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str || '')) return null;
  const [y, m, d] = str.split('-').map(Number);
  const ms = offsetMinutes() * 60 * 1000;
  return new Date(Date.UTC(y, m - 1, d) - ms);
};

module.exports = { offsetString, startOfLocalDay, parseLocalDate };
