import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../stores/authStore';
import { Spinner } from '../ui/Spinner';

export function AuthGate() {
  const location = useLocation();
  const hasStarted = useRef(false);

  const status = useAuthStore((s) => s.status);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isRefreshing = useAuthStore((s) => s.isRefreshing);
  const refreshSession = useAuthStore((s) => s.refreshSession);

  useEffect(() => {
    if (!hasHydrated || hasStarted.current) return;
    hasStarted.current = true;
    void refreshSession();
  }, [hasHydrated, refreshSession]);

  if (!hasHydrated || status === 'unknown' || isRefreshing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Spinner />
          Loading…
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
