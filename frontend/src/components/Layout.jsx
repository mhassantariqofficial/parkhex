import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ParkingSquare,
  CarFront,
  LogIn,
  LogOut,
  History,
  BarChart3,
  Tag,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/entry', label: 'Vehicle Entry', icon: LogIn },
  { to: '/parked', label: 'Parked Vehicles', icon: CarFront },
  { to: '/slots', label: 'Parking Slots', icon: ParkingSquare },
  { to: '/history', label: 'History', icon: History },
  { to: '/reports', label: 'Reports', icon: BarChart3, admin: true },
  { to: '/rates', label: 'Rates', icon: Tag, admin: true },
  { to: '/staff', label: 'Staff', icon: Users, admin: true },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile top bar */}
      <div className="no-print flex items-center justify-between bg-primary px-4 py-3 lg:hidden">
        <Logo dark size={30} />
        <button onClick={() => setOpen(!open)} className="text-white" aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`no-print ${open ? 'block' : 'hidden'} w-full shrink-0 bg-primary text-slate-200 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64`}
      >
        <div className="hidden px-6 py-6 lg:block">
          <Logo dark />
        </div>

        <nav className="space-y-1 px-3 pb-4 pt-2 lg:pt-0">
          {links
            .filter((l) => !l.admin || isAdmin)
            .map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-accent text-white' : 'hover:bg-primary-light'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 lg:absolute lg:bottom-0 lg:w-64">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="mb-3 text-xs capitalize text-slate-400">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
