import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import { PageHeader, Spinner, Empty } from '../components/ui';
import { money } from '../utils';

export default function Reports() {
  const [group, setGroup] = useState('daily');
  const [range, setRange] = useState({ from: '', to: '' });
  const [report, setReport] = useState(null);

  useEffect(() => {
    setReport(null);
    api
      .get('/reports/income', { params: { group, ...range } })
      .then((r) => setReport(r.data))
      .catch((e) => toast.error(getError(e)));
  }, [group, range]);

  const max = report ? Math.max(1, ...report.data.map((r) => r.income)) : 1;

  return (
    <div>
      <PageHeader title="Income Reports" subtitle="Income and vehicle count by day or month">
        <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white">
          {['daily', 'monthly'].map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`px-4 py-2 text-sm font-semibold capitalize ${
                group === g ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="card mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">From date</label>
          <input
            type="date"
            className="input"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
          />
        </div>
        <div>
          <label className="label">To date</label>
          <input
            type="date"
            className="input"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
          />
        </div>
        <p className="text-xs text-slate-500 sm:col-span-2">
          Leave the dates empty to see the last {group === 'daily' ? '30 days' : '12 months'}.
        </p>
      </div>

      {!report ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="card">
              <p className="text-sm text-slate-500">Total income</p>
              <p className="text-3xl font-bold text-accent">{money(report.totalIncome)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Total vehicles</p>
              <p className="text-3xl font-bold text-primary">{report.totalVehicles}</p>
            </div>
          </div>

          {report.data.length === 0 ? (
            <div className="card">
              <Empty text="No income recorded in this period." />
            </div>
          ) : (
            <>
              {/* Simple bar chart (no extra library needed) */}
              <div className="card mb-4">
                <h2 className="mb-4 font-bold text-primary">Income chart</h2>
                <div className="flex h-56 items-end gap-1.5 overflow-x-auto">
                  {report.data.map((r) => (
                    <div key={r.period} className="group flex h-full min-w-[26px] flex-1 flex-col justify-end">
                      <div
                        className="w-full rounded-t bg-accent transition group-hover:bg-accent-dark"
                        style={{ height: `${Math.max(3, (r.income / max) * 100)}%` }}
                        title={`${r.period}: ${money(r.income)}`}
                      />
                      <span className="mt-1 truncate text-center text-[10px] text-slate-500">
                        {r.period.slice(group === 'daily' ? 5 : 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="th">{group === 'daily' ? 'Date' : 'Month'}</th>
                        <th className="th">Vehicles</th>
                        <th className="th">Cars</th>
                        <th className="th">Bikes</th>
                        <th className="th text-right">Income</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...report.data].reverse().map((r) => (
                        <tr key={r.period}>
                          <td className="td font-semibold">{r.period}</td>
                          <td className="td">{r.vehicles}</td>
                          <td className="td">{r.cars}</td>
                          <td className="td">{r.bikes}</td>
                          <td className="td text-right font-semibold">{money(r.income)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
