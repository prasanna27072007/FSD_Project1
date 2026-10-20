import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import { api } from '../lib/api';

export default function Layout() {
  const queryClient = useQueryClient();
  const wasOffline = useRef(false);
  const [dark, setDark] = useState(() => localStorage.getItem('hdss_theme') !== 'light');
  const health = useQuery({
    queryKey: ['api-health'],
    queryFn: () => api.get('/health'),
    retry: false,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (health.isError) {
      wasOffline.current = true;
      return;
    }

    if (health.isSuccess && wasOffline.current) {
      wasOffline.current = false;
      queryClient.invalidateQueries();
    }
  }, [health.isError, health.isSuccess, queryClient]);

  const toggle = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('light', !nextDark);
    localStorage.setItem('hdss_theme', nextDark ? 'dark' : 'light');
  };

  const retryConnection = async () => {
    const result = await health.refetch();
    if (result.isSuccess) {
      await queryClient.invalidateQueries();
    }
  };

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-[#071525]/80 px-5 backdrop-blur-xl lg:px-8">
          <div>
            <div className="text-lg font-bold">Clinical Command Center</div>
            <div className="text-xs text-slate-500">AI-assisted patient intelligence</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden rounded-xl border border-white/10 p-2 text-slate-400 sm:block" aria-label="Search">
              <Search size={18} />
            </button>
            <button className="rounded-xl border border-white/10 p-2 text-slate-400" aria-label="Toggle theme" onClick={toggle}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="relative rounded-xl border border-white/10 p-2 text-slate-400" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-400" />
            </button>
            <button className="rounded-xl border border-white/10 p-2 text-slate-400 lg:hidden" aria-label="Menu">
              <Menu size={18} />
            </button>
          </div>
        </header>

        {health.isError && (
          <div role="alert" className="mx-5 mt-5 flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between lg:mx-8">
            <div>
              <p className="font-semibold">The HDSS API is unavailable. Dashboard data may be empty.</p>
              <p className="mt-1 text-amber-100/80">
                Start the frontend and backend together from the project folder with <code>npm run dev</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={retryConnection}
              className="shrink-0 rounded-lg border border-amber-200/20 px-3 py-2 font-medium hover:bg-amber-100/10"
            >
              Retry connection
            </button>
          </div>
        )}

        <div className="p-5 lg:p-8">
          <Outlet />
        </div>
        <div className="fixed bottom-4 right-4 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[11px] text-amber-200 shadow-lg">
          Decision support only — not a substitute for clinical judgment
        </div>
      </main>
    </div>
  );
}
