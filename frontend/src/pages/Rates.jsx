import { useEffect, useState } from 'react';
import { Car, Bike } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import { PageHeader, Spinner } from '../components/ui';
import { CURRENCY } from '../utils';

export default function Rates() {
  const [prices, setPrices] = useState(null);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    api
      .get('/rates')
      .then((r) => {
        const map = { car: '', bike: '' };
        r.data.forEach((x) => (map[x.vehicleType] = x.pricePerHour));
        setPrices(map);
      })
      .catch((e) => toast.error(getError(e)));
  }, []);

  const save = async (type) => {
    setSaving(type);
    try {
      await api.put(`/rates/${type}`, { pricePerHour: prices[type] });
      toast.success(`${type === 'car' ? 'Car' : 'Bike'} rate updated`);
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving('');
    }
  };

  if (!prices) return <Spinner />;

  const items = [
    { type: 'car', label: 'Car', icon: Car },
    { type: 'bike', label: 'Bike', icon: Bike },
  ];

  return (
    <div>
      <PageHeader
        title="Parking Rates"
        subtitle="Price per hour. Time is rounded up to the next full hour (minimum 1 hour)."
      />

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {items.map(({ type, label, icon: Icon }) => (
          <div key={type} className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                <Icon size={22} />
              </div>
              <h2 className="text-lg font-bold text-primary">{label}</h2>
            </div>
            <label className="label">Price per hour ({CURRENCY})</label>
            <input
              type="number"
              min="0"
              className="input mb-4"
              value={prices[type]}
              onChange={(e) => setPrices({ ...prices, [type]: e.target.value })}
            />
            <button className="btn-primary w-full" onClick={() => save(type)} disabled={saving === type}>
              {saving === type ? 'Saving...' : 'Save rate'}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 max-w-3xl text-xs text-slate-500">
        Note: a new rate applies to vehicles that enter after the change. Vehicles already parked keep the rate they
        entered with.
      </p>
    </div>
  );
}
