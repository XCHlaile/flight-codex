import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../../shared/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const ready = useAuthStore((state) => state.ready);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111F] px-6 text-slate-200">
        正在校验登录状态...
      </div>
    );
  }

  if (!token || !user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
