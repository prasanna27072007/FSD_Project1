import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, HeartPulse, BrainCircuit, Bell, BarChart3, Stethoscope, LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/patients', 'Patients', Users],
  ['/vitals', 'Vital Signs', HeartPulse],
  ['/ai', 'AI Diagnostic Assistant', BrainCircuit],
  ['/alerts', 'Alerts Center', Bell],
  ['/analytics', 'Analytics', BarChart3],
  ['/profile', 'Profile', UserCircle2],
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#081827]/90 p-5 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="rounded-xl bg-teal-400/15 p-2 text-teal-300"><Stethoscope /></div>
        <div>
          <div className="font-bold">HDSS</div>
          <div className="text-xs text-slate-500">Clinical Intelligence</div>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive ? 'bg-teal-400/10 text-teal-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="mb-4 px-2 text-xs text-slate-500">SIGNED IN AS</div>
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-500/20 text-blue-300">{user?.name?.[0]}</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-white/5">
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

