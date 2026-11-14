import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Car, Bike } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Spinner, Empty, Modal } from '../components/ui';

export default function Slots() {
  const { isAdmin } = useAuth();
  const [slots, setSlots] = useState(null);
  const [filter, setFilter] = useState('all'); // all | car | bike
  const [modal, setModal] = useState(null); // null | { slot? }
  const [form, setForm] = useState({ slotNumber: '', type: 'car' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      api
        .get('/slots')
        .then((r) => setSlots(r.data))
        .catch((e) => toast.error(getError(e))),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm({ slotNumber: '', type: 'car' });
    setModal({});
  };
  const openEdit = (slot) => {
    setForm({ slotNumber: slot.slotNumber, type: slot.type });
    setModal({ slot });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.slot) {
        await api.put(`/slots/${modal.slot._id}`, form);
        toast.success('Slot updated');
      } else {
        await api.post('/slots', form);
        toast.success('Slot added');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slot) => {
    if (!window.confirm(`Delete slot ${slot.slotNumber}?`)) return;
    try {
      await api.delete(`/slots/${slot._id}`);
      toast.success('Slot deleted');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  if (!slots) return <Spinner />;

  const shown = slots.filter((s) => filter === 'all' || s.type === filter);
  const free = slots.filter((s) => s.status === 'available').length;

  return (
    <div>
      <PageHeader title="Parking Slots" subtitle={`${free} of ${slots.length} slots are free`}>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Slot
          </button>
        )}
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {['all', 'car', 'bike'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === f ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f === 'all' ? 'All' : `${f}s`}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-400" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-400" /> Occupied
          </span>
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="card">
          <Empty text="No slots found." />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {shown.map((s) => {
            const occupied = s.status === 'occupied';
            const Icon = s.type === 'car' ? Car : Bike;
            return (
              <div
                key={s._id}
                className={`rounded-xl border-2 p-4 text-center ${
                  occupied ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'
                }`}
              >
                <Icon className={`mx-auto mb-1 ${occupied ? 'text-red-500' : 'text-emerald-600'}`} size={26} />
                <p className="text-lg font-bold text-primary">{s.slotNumber}</p>
                <p className="text-xs capitalize text-slate-500">
                  {s.type} &middot; {s.status}
                </p>
                {isAdmin && (
                  <div className="mt-3 flex justify-center gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      disabled={occupied}
                      className="rounded p-1.5 text-slate-500 hover:bg-white disabled:opacity-30"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => remove(s)}
                      disabled={occupied}
                      className="rounded p-1.5 text-red-500 hover:bg-white disabled:opacity-30"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal.slot ? 'Edit Slot' : 'Add New Slot'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Slot number</label>
              <input
                className="input"
                placeholder="e.g. A11"
                value={form.slotNumber}
                onChange={(e) => setForm({ ...form, slotNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Slot type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
