import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { AuthContextType, LoginCredentials, RegisterCredentials } from '../types/auth';
import { setAccessToken, setInitialAuthCheck } from '../services/api';
import { logger } from '../utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, clearAuth } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        // Mark this as an initial auth check to suppress expected 401 errors
        setInitialAuthCheck(true);
        // Try to refresh token and get user data
        await authService.refreshToken();
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error) {
        // No valid session, clear auth state
        // This is expected if user is not logged in, so we silently handle it
        clearAuth();
        setAccessToken(null);
      } finally {
        setLoading(false);
        // Reset the flag after initial check
        setInitialAuthCheck(false);
      }
    };

    initAuth();
  }, [setUser, setLoading, clearAuth]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const { user: userData } = await authService.login(credentials);
        setUser(userData);
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [setUser, clearAuth]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        const { user: userData } = await authService.register(credentials);
        setUser(userData);
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [setUser, clearAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      logger.error('Logout error', error);
    } finally {
      clearAuth();
      setAccessToken(null);
    }
  }, [clearAuth]);

  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      clearAuth();
      setAccessToken(null);
      throw error;
    }
  }, [setUser, clearAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
