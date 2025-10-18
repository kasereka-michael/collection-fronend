import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

// Protected route with optional role-based access control
// Usage: <ProtectedRoute roles={["ADMIN"]}>...</ProtectedRoute>
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

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // If user is authenticated but not authorized, redirect to dashboard
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;