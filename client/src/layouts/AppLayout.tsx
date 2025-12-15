import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../ui/Button';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getErrorMessage } from '../utils/errors';

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">KolTechat</div>
            {user?.avatarUrl ? (
              <img
                src={resolveAssetUrl(user.avatarUrl)}
                alt="Your avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            )}
            <div className="min-w-0 hidden sm:block">
              <div className="truncate text-sm font-medium">{user?.name || 'Your account'}</div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                }`
              }
            >
              Profile
            </NavLink>
            <ThemeToggle />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await logout();
                  toast.success('Logged out');
                } catch (err) {
                  toast.error(getErrorMessage(err));
                } finally {
                  navigate('/login', { replace: true });
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex">
        <Outlet />
      </main>
    </div>
  );
}
