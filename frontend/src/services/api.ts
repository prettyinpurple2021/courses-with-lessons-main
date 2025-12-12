import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { parseError, logError, isRetryableError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

// Configuration for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
  timeout: 30000, // 30 second timeout
});

// Store access token in memory only (not localStorage for security and cross-device compatibility)
// Access tokens are short-lived (15min-1hr) and will be refreshed automatically via httpOnly cookie
// This ensures:
// 1. Security: Tokens not accessible to JavaScript/XSS attacks
// 2. Cross-device: User data is in database, refresh token cookie handles persistence per device
// 3. Production-ready: Follows OAuth 2.0 best practices
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  // Do NOT store in localStorage - access tokens should be in memory only
  // Refresh tokens are stored securely in httpOnly cookies by the backend
  // User data is stored in the database, ensuring cross-device access
};

export const getAccessToken = () => accessToken;

// Request interceptor to add access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Track if we're doing an initial auth check (expected to fail if no session)
let isInitialAuthCheck = false;

export const setInitialAuthCheck = (value: boolean) => {
  isInitialAuthCheck = value;
};

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Retry helper function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
      _isRefreshRequest?: boolean;
    };

    // Check if this is a refresh token request
    const isRefreshRequest = originalRequest?.url === '/auth/refresh' || originalRequest?._isRefreshRequest;
    
    // Suppress expected 401 errors from refresh token attempts when there's no session
    // This is normal behavior on initial page load when user is not logged in
    const isExpectedAuthError = 
      error.response?.status === 401 && 
      isRefreshRequest && 
      (isInitialAuthCheck || !accessToken);

    // Parse error for potential use in retry logic (always parse, but only log if unexpected)
    const appError = parseError(error);
    
    // Only log unexpected errors
    if (!isExpectedAuthError) {
      logError(appError, `API Request: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if this IS the refresh request itself
      if (isRefreshRequest) {
        // If it's an expected error (no session), silently fail
        if (isExpectedAuthError) {
          setAccessToken(null);
          return Promise.reject(error);
        }
        // Otherwise, it's an unexpected refresh failure
        setAccessToken(null);
        // Only redirect if we're not on the login page already
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Mark the refresh request to prevent infinite loops
        const refreshRequest = { ...originalRequest };
        refreshRequest._isRefreshRequest = true;
        const response = await api.post('/auth/refresh');
        const { accessToken: newAccessToken } = response.data.data;

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        setAccessToken(null);
        // Only redirect if we're not on the login page already and it's not an expected error
        if (!isExpectedAuthError && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Implement retry logic for retryable errors
    if (isRetryableError(appError) && originalRequest) {
      const retryCount = originalRequest._retryCount || 0;

      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;

        // Exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        await sleep(delay);

        logger.debug(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`, {
          url: originalRequest.url,
          method: originalRequest.method,
        });
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
