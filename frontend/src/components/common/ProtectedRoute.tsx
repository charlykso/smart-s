import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants';
import type { UserRole } from '../../types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = ROUTES.LOGIN,
}) => {
  const location = useLocation();
  const { isAuthenticated, hasAnyRole } = useAuthStore();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required roles (if specified)
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    // User doesn't have required roles, redirect to dashboard or unauthorized page
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

export default ProtectedRoute;
