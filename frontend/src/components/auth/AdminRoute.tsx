import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Protected route component for admin-only pages
 * Verifies that the user is authenticated and has admin role
 */
const AdminRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
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
      if (import.meta.env.DEV) {
        console.error('Admin verification failed:', error);
      }
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
    // Use push instead of replace to allow back button navigation
    return <Navigate to="/admin/login" state={{ from: location }} />;
  }

  if (!isAdmin) {
    // Use push instead of replace to allow back button navigation
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminRoute;
