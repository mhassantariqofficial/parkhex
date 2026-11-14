import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import { PageHeader, Spinner } from '../components/ui';
import { money } from '../utils';

export default function VehicleEntry() {
  const navigate = useNavigate();
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [slotId, setSlotId] = useState('');
  const [slots, setSlots] = useState(null);
  const [rates, setRates] = useState({});
  const [saving, setSaving] = useState(false);

  // Load free slots for the chosen vehicle type
  useEffect(() => {
    setSlots(null);
    setSlotId('');
    api
      .get('/slots', { params: { status: 'available', type: vehicleType } })
      .then((r) => setSlots(r.data))
      .catch((e) => toast.error(getError(e)));
  }, [vehicleType]);

  useEffect(() => {
    api.get('/rates').then((r) => {
      const map = {};
      r.data.forEach((x) => (map[x.vehicleType] = x.pricePerHour));
      setRates(map);
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!slotId) return toast.error('Please select a slot');
    setSaving(true);
    try {
      const { data } = await api.post('/tickets/entry', { plateNumber, vehicleType, slotId });
      toast.success(`Vehicle ${data.plateNumber} parked in slot ${data.slotNumber}`);
      navigate(`/receipt/${data._id}`);
    } catch (err) {
      toast.error(getError(err));
      setSaving(false);
    }
  };

  const types = [
    { value: 'car', label: 'Car', icon: Car },
    { value: 'bike', label: 'Bike', icon: Bike },
  ];

  return (
    <div>
      <PageHeader title="Vehicle Entry" subtitle="Register a vehicle and give it a parking slot" />

      <form onSubmit={submit} className="card max-w-2xl space-y-6">
        <div>
          <label className="label">Number plate</label>
          <input
            className="input text-lg font-semibold uppercase tracking-wider"
            placeholder="e.g. LEA-1234"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="label">Vehicle type</label>
          <div className="grid grid-cols-2 gap-3">
            {types.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => setVehicleType(value)}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                  vehicleType === value ? 'border-accent bg-accent/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={vehicleType === value ? 'text-accent' : 'text-slate-400'} size={28} />
                <div>
                  <p className="font-semibold text-primary">{label}</p>
                  <p className="text-xs text-slate-500">
                    {rates[value] !== undefined ? `${money(rates[value])} / hour` : 'No rate set'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Select a free slot</label>
          {!slots ? (
            <Spinner text="Loading slots..." />
          ) : slots.length === 0 ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              No free {vehicleType} slots right now.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s._id}
                  onClick={() => setSlotId(s._id)}
                  className={`rounded-lg border-2 py-2.5 text-sm font-bold transition ${
                    slotId === s._id
                      ? 'border-accent bg-accent text-white'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400'
                  }`}
                >
                  {s.slotNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn-primary w-full py-3 text-base" disabled={saving || !slots?.length}>
          {saving ? 'Saving...' : 'Park vehicle & print ticket'}
        </button>
      </form>
    </div>
  );
}
