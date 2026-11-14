import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ParkingSquare, CheckCircle2, CarFront, Wallet, LogIn, LogOut } from 'lucide-react';
import api, { getError } from '../api/axios';
import toast from 'react-hot-toast';
import { PageHeader, Spinner, StatCard, Empty, TypeBadge, StatusBadge } from '../components/ui';
import { money, fmtDateTime } from '../utils';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = () =>
      api
        .get('/dashboard')
        .then((r) => setData(r.data))
        .catch((e) => toast.error(getError(e)));
    load();
    const t = setInterval(load, 30000); // refresh every 30 seconds
    return () => clearInterval(t);
  }, []);

  if (!data) return <Spinner />;

  const usage = data.totalSlots ? Math.round((data.occupiedSlots / data.totalSlots) * 100) : 0;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live overview of your parking lot">
        <Link to="/entry" className="btn-primary">
          <LogIn size={16} /> New Entry
        </Link>
        <Link to="/parked" className="btn-dark">
          <LogOut size={16} /> Vehicle Exit
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Slots" value={data.totalSlots} icon={ParkingSquare} color="bg-primary" />
        <StatCard label="Available Slots" value={data.availableSlots} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard label="Vehicles Parked Now" value={data.parkedNow} icon={CarFront} color="bg-amber-500" />
        <StatCard label="Today's Income" value={money(data.todayIncome)} icon={Wallet} color="bg-accent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-bold text-primary">Lot Usage</h2>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-500">
              {data.occupiedSlots} of {data.totalSlots} slots occupied
            </span>
            <span className="font-semibold">{usage}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${usage}%` }} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-2xl font-bold text-primary">{data.entriesToday}</p>
              <p className="text-xs text-slate-500">Entries today</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-2xl font-bold text-primary">{data.exitsToday}</p>
              <p className="text-xs text-slate-500">Exits today</p>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden p-0 lg:col-span-2">
          <h2 className="px-5 pt-5 font-bold text-primary">Recent Activity</h2>
          {data.recent.length === 0 ? (
            <Empty text="No activity yet. Add your first vehicle entry." />
          ) : (
            <div className="overflow-x-auto">
              <table className="mt-3 w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Plate</th>
                    <th className="th">Type</th>
                    <th className="th">Slot</th>
                    <th className="th">Status</th>
                    <th className="th">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent.map((t) => (
                    <tr key={t._id}>
                      <td className="td font-semibold">{t.plateNumber}</td>
                      <td className="td"><TypeBadge type={t.vehicleType} /></td>
                      <td className="td">{t.slotNumber}</td>
                      <td className="td"><StatusBadge status={t.status} /></td>
                      <td className="td text-slate-500">
                        {fmtDateTime(t.status === 'exited' ? t.exitTime : t.entryTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
