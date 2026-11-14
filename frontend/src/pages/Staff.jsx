import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getError } from '../api/axios';
import { PageHeader, Spinner, Empty, Modal } from '../components/ui';
import { fmtDateTime } from '../utils';

const emptyForm = { name: '', email: '', password: '' };

export default function Staff() {
  const [staff, setStaff] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      api
        .get('/staff')
        .then((r) => setStaff(r.data))
        .catch((e) => toast.error(getError(e))),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/staff', form);
      toast.success('Staff member added');
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.name}?`)) return;
    try {
      await api.delete(`/staff/${s._id}`);
      toast.success('Staff member removed');
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  if (!staff) return <Spinner />;

  return (
    <div>
      <PageHeader title="Staff" subtitle="Guards and operators who can handle vehicle entry and exit">
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} /> Add Staff
        </button>
      </PageHeader>

      <div className="card overflow-hidden p-0">
        {staff.length === 0 ? (
          <Empty text="No staff members yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Name</th>
                  <th className="th">Email</th>
                  <th className="th">Added</th>
                  <th className="th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s._id}>
                    <td className="td font-semibold">{s.name}</td>
                    <td className="td">{s.email}</td>
                    <td className="td text-slate-500">{fmtDateTime(s.createdAt)}</td>
                    <td className="td text-right">
                      <button onClick={() => remove(s)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title="Add Staff Member" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password (min 6 characters)</label>
              <input
                type="password"
                minLength={6}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Add staff'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
