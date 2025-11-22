import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    // Redirect non-admin users to home
    return <Navigate to="/" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};