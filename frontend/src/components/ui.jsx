import { X, Loader2 } from 'lucide-react';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Spinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <Loader2 className="animate-spin" size={20} /> {text}
    </div>
  );
}

export function Empty({ text }) {
  return <div className="py-14 text-center text-sm text-slate-500">{text}</div>;
}

export function Modal({ title, onClose, children, width = 'max-w-md' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${width} rounded-xl bg-white p-6 shadow-xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TypeBadge({ type }) {
  const cls = type === 'car' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700';
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>{type}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    available: 'bg-emerald-100 text-emerald-700',
    occupied: 'bg-red-100 text-red-700',
    parked: 'bg-amber-100 text-amber-700',
    exited: 'bg-slate-200 text-slate-700',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>{status}</span>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'bg-accent' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}
