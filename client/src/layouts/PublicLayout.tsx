import { Outlet } from 'react-router-dom';

import { ThemeToggle } from '../components/ThemeToggle';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
        <div>
          <div className="text-lg font-semibold">KolTechat</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Sign in to continue</div>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
