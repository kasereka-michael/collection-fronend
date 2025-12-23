import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { isAdminLike } from '../utils/roles';

// Protected route with optional role-based access control
// Usage: <ProtectedRoute roles={["ADMIN"]}>...</ProtectedRoute>
// Accountant should have the same read-only access as Admin for views
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && roles.length > 0) {
    // Expand ADMIN role to include ACCOUNTANT for viewing routes
    const effectiveRoles = roles.includes('ADMIN')
      ? Array.from(new Set([...roles, 'ACCOUNTANT']))
      : roles;

    if (!effectiveRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;