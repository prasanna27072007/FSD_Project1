import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('doctor@hdss.local');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        (requestError.response
          ? 'Unable to sign in. Please check your email and password.'
          : 'Cannot reach the API. Check that the server is running and connected to MongoDB.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#061321] p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-3xl p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-teal-400/15 p-3 text-teal-300">
            <Stethoscope size={26} />
          </div>
          <div>
            <div className="text-xl font-bold">HDSS</div>
            <div className="text-xs text-slate-500">Healthcare Decision Support</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Secure clinician access to the command center.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-teal-400"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-teal-400"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
          {error && <div className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</div>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-teal-400 py-3 font-semibold text-slate-950 transition hover:bg-teal-300 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={15} />
          Demo accounts are seeded locally.
        </div>
      </motion.div>
    </div>
  );
}
