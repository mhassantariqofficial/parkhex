import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Receipt as ReceiptIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import { PageHeader, Spinner, Empty, TypeBadge } from '../components/ui';
import { money, fmtDateTime } from '../utils';

export default function History() {
  const [filters, setFilters] = useState({ q: '', vehicleType: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get('/tickets/history', { params: { ...filters, page, limit: 10 } })
        .then((r) => setResult(r.data))
        .catch((e) => toast.error(getError(e)));
    }, 250);
    return () => clearTimeout(t);
  }, [filters, page]);

  return (
    <div>
      <PageHeader title="Parking History" subtitle="All completed parking records" />

      <div className="card mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search plate or ticket"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
          />
        </div>
        <select
          className="input"
          value={filters.vehicleType}
          onChange={(e) => setFilter('vehicleType', e.target.value)}
        >
          <option value="">All vehicle types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>
        <input
          type="date"
          className="input"
          value={filters.from}
          onChange={(e) => setFilter('from', e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className="input"
          value={filters.to}
          onChange={(e) => setFilter('to', e.target.value)}
          title="To date"
        />
      </div>

      {!result ? (
        <Spinner />
      ) : (
        <div className="card overflow-hidden p-0">
          {result.tickets.length === 0 ? (
            <Empty text="No records found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Plate</th>
                    <th className="th">Type</th>
                    <th className="th">Slot</th>
                    <th className="th">Entry</th>
                    <th className="th">Exit</th>
                    <th className="th">Hours</th>
                    <th className="th">Amount</th>
                    <th className="th text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.tickets.map((t) => (
                    <tr key={t._id}>
                      <td className="td font-semibold">{t.plateNumber}</td>
                      <td className="td"><TypeBadge type={t.vehicleType} /></td>
                      <td className="td">{t.slotNumber}</td>
                      <td className="td">{fmtDateTime(t.entryTime)}</td>
                      <td className="td">{fmtDateTime(t.exitTime)}</td>
                      <td className="td">{t.totalHours}</td>
                      <td className="td font-semibold">{money(t.amount)}</td>
                      <td className="td text-right">
                        <Link to={`/receipt/${t._id}`} className="inline-block rounded p-1.5 text-accent hover:bg-slate-100">
                          <ReceiptIcon size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span>{result.total} records</span>
            <div className="flex items-center gap-2">
              <button className="btn-outline px-2 py-1" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {result.page} of {result.pages}
              </span>
              <button
                className="btn-outline px-2 py-1"
                disabled={page >= result.pages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
