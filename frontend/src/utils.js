// Change the currency label here if needed
export const CURRENCY = 'Rs.';

export const money = (n) => `${CURRENCY} ${Number(n || 0).toLocaleString('en-US')}`;

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '-';

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-';

// "2h 15m" style duration between two dates (end defaults to now)
export const duration = (start, end = new Date()) => {
  const mins = Math.max(0, Math.floor((new Date(end) - new Date(start)) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
