import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../stores/authStore';

export function PublicOnly() {
  const status = useAuthStore((s) => s.status);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated || status === 'unknown') return <Outlet />;

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
