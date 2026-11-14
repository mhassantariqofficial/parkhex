import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import Logo from '../components/Logo';
import { Spinner } from '../components/ui';
import { money, fmtDateTime, duration } from '../utils';

// Shows an ENTRY TICKET while the vehicle is parked, and a PAYMENT RECEIPT after exit
export default function Receipt() {
  const { id } = useParams();
  const [t, setT] = useState(null);

  useEffect(() => {
    api
      .get(`/tickets/${id}`)
      .then((r) => setT(r.data))
      .catch((e) => toast.error(getError(e)));
  }, [id]);

  if (!t) return <Spinner />;

  const exited = t.status === 'exited';

  return (
    <div className="mx-auto max-w-md">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link to={exited ? '/history' : '/parked'} className="btn-outline">
          <ArrowLeft size={16} /> Back
        </Link>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="print-area card p-6">
        <div className="mb-4 flex flex-col items-center border-b border-dashed border-slate-300 pb-4">
          <Logo size={36} />
          <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
            {exited ? 'Payment Receipt' : 'Parking Entry Ticket'}
          </p>
        </div>

        <div className="space-y-2.5 text-sm">
          <Line label="Ticket ID" value={t.ticketId} />
          <Line label="Plate number" value={t.plateNumber} bold />
          <Line label="Vehicle type" value={t.vehicleType === 'car' ? 'Car' : 'Bike'} />
          <Line label="Slot" value={t.slotNumber} bold />
          <Line label="Entry time" value={fmtDateTime(t.entryTime)} />
          {exited && (
            <>
              <Line label="Exit time" value={fmtDateTime(t.exitTime)} />
              <Line label="Time parked" value={duration(t.entryTime, t.exitTime)} />
              <Line label="Billed hours" value={`${t.totalHours} h`} />
            </>
          )}
          <Line label="Rate" value={`${money(t.ratePerHour)} / hour`} />
          <Line label={exited ? 'Handled by' : 'Issued by'} value={(exited ? t.exitedBy : t.createdBy)?.name || '-'} />
        </div>

        {exited ? (
          <div className="mt-5 flex items-center justify-between rounded-lg bg-primary p-4 text-white">
            <span>Total paid</span>
            <span className="text-2xl font-bold">{money(t.amount)}</span>
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-amber-50 p-3 text-center text-xs text-amber-700">
            Please keep this ticket. The bill is calculated when the vehicle leaves. Time is rounded up to the next
            full hour.
          </p>
        )}

        <p className="mt-5 text-center text-xs text-slate-400">Thank you for parking with ParkHex</p>
      </div>
    </div>
  );
}

function Line({ label, value, bold }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right ${bold ? 'font-bold text-primary' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
