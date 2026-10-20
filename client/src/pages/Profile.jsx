import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCircle2, KeyRound, Activity } from 'lucide-react';

const permissionMap = {
  Doctor: ['View patient records', 'Run AI assessment', 'Review alerts', 'Check medication safety'],
  Nurse: ['Record vitals', 'Review patient context', 'View relevant alerts'],
  Admin: ['Manage users', 'Review analytics', 'Audit system activity'],
};

export default function Profile() {
  const { user, logout } = useAuth();
  const permissions = permissionMap[user?.role] || [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.22em] text-violet-300">
          <UserCircle2 size={15} />
          Account
        </div>
        <h1 className="mt-2 text-3xl font-bold">Profile & access</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-500/20 text-xl font-bold text-blue-300">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <div className="text-2xl font-bold">{user?.name}</div>
              <div className="text-sm text-slate-400">{user?.email}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Role</span>
              <span className="font-semibold text-teal-300">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Authentication</span>
              <span className="flex items-center gap-2 text-emerald-300"><ShieldCheck size={16} /> Verified</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Session</span>
              <span className="flex items-center gap-2 text-blue-300"><KeyRound size={16} /> JWT</span>
            </div>
          </div>

          <button type="button" onClick={logout} className="mt-6 w-full rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 font-semibold text-rose-200">
            Sign out
          </button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 text-lg font-semibold"><Activity size={18} /> Permissions</div>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            {permissions.map((permission) => (
              <li key={permission} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-teal-400" />
                {permission}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
