import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut as ExitIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import { PageHeader, Spinner, Empty, Modal, TypeBadge } from '../components/ui';
import { money, fmtDateTime, duration } from '../utils';

export default function ParkedVehicles() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState(null);
  const [q, setQ] = useState('');
  const [preview, setPreview] = useState(null); // bill preview for the exit modal
  const [exiting, setExiting] = useState(false);

  const load = useCallback(
    () =>
      api
        .get('/tickets/active', { params: { q } })
        .then((r) => setTickets(r.data))
        .catch((e) => toast.error(getError(e))),
    [q]
  );

  // Reload as the user types (small delay)
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openExit = async (ticket) => {
    try {
      const { data } = await api.get(`/tickets/${ticket._id}/preview`);
      setPreview(data);
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const confirmExit = async () => {
    setExiting(true);
    try {
      const { data } = await api.post(`/tickets/${preview.ticket._id}/exit`);
      toast.success(`Vehicle ${data.plateNumber} exited. Bill: ${money(data.amount)}`);
      setPreview(null);
      navigate(`/receipt/${data._id}`);
    } catch (err) {
      toast.error(getError(err));
      setExiting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Parked Vehicles" subtitle="Vehicles currently inside the parking lot">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="input w-64 pl-9"
            placeholder="Search plate, ticket or slot"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </PageHeader>

      {!tickets ? (
        <Spinner />
      ) : (
        <div className="card overflow-hidden p-0">
          {tickets.length === 0 ? (
            <Empty text={q ? 'No vehicle matches your search.' : 'No vehicles are parked right now.'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Ticket</th>
                    <th className="th">Plate</th>
                    <th className="th">Type</th>
                    <th className="th">Slot</th>
                    <th className="th">Entry time</th>
                    <th className="th">Parked for</th>
                    <th className="th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t._id}>
                      <td className="td text-xs text-slate-500">{t.ticketId}</td>
                      <td className="td font-semibold">{t.plateNumber}</td>
                      <td className="td"><TypeBadge type={t.vehicleType} /></td>
                      <td className="td font-semibold">{t.slotNumber}</td>
                      <td className="td">{fmtDateTime(t.entryTime)}</td>
                      <td className="td">{duration(t.entryTime)}</td>
                      <td className="td text-right">
                        <button className="btn-dark py-1.5" onClick={() => openExit(t)}>
                          <ExitIcon size={15} /> Exit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {preview && (
        <Modal title="Confirm Vehicle Exit" onClose={() => !exiting && setPreview(null)}>
          <div className="space-y-2 text-sm">
            <Row label="Plate number" value={preview.ticket.plateNumber} bold />
            <Row label="Slot" value={preview.ticket.slotNumber} />
            <Row label="Entry time" value={fmtDateTime(preview.ticket.entryTime)} />
            <Row label="Exit time" value={fmtDateTime(preview.exitTime)} />
            <Row label="Time parked" value={duration(preview.ticket.entryTime, preview.exitTime)} />
            <Row label="Billed hours" value={`${preview.totalHours} h (rounded up)`} />
            <Row label="Rate" value={`${money(preview.ticket.ratePerHour)} / hour`} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-primary p-4 text-white">
            <span>Total amount</span>
            <span className="text-2xl font-bold">{money(preview.amount)}</span>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn-outline" onClick={() => setPreview(null)} disabled={exiting}>
              Cancel
            </button>
            <button className="btn-primary" onClick={confirmExit} disabled={exiting}>
              {exiting ? 'Processing...' : 'Confirm exit & get receipt'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className={bold ? 'font-bold' : 'font-medium'}>{value}</span>
    </div>
  );
}
