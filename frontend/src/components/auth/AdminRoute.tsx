import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Protected route component for admin-only pages
 * Verifies that the user is authenticated and has admin role
 */
const AdminRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    verifyAdminAccess();
  }, [isAuthenticated]);

  const verifyAdminAccess = async () => {
    if (!isAuthenticated) {
      setIsVerifying(false);
      return;
    }

    try {
      const result = await adminService.verifyAdmin();
      setIsAdmin(result.isAdmin);
    } catch (error) {
      console.error('Admin verification failed:', error);
      setIsAdmin(false);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
