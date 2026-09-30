import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          color: 'var(--text-secondary)',
        }}
      >
        <Loader2 size={36} className="spin" style={{ color: 'var(--primary)' }} />
        <p style={{ fontSize: '0.95rem' }}>Authenticating your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login and preserve destination in state for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
