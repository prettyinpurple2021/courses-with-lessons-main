import { AxiosError } from 'axios';
import { ErrorType, AppError, ApiErrorResponse } from '../types/error';

/**
 * Parse an error from various sources into a standardized AppError format
 */
export const parseError = (error: unknown): AppError => {
  const timestamp = new Date();

  // Handle Axios errors
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const statusCode = axiosError.response?.status;
    const message = axiosError.response?.data?.error?.message || axiosError.message;

    // Categorize by status code
    if (!axiosError.response) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your internet connection.',
        timestamp,
        details: error,
      };
    }

    switch (statusCode) {
      case 400:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: message || 'Invalid request data',
          timestamp,
          statusCode,
          details: axiosError.response.data,
        };
      case 401:
        return {
          type: ErrorType.AUTHENTICATION_ERROR,
          message: message || 'Authentication required',
          timestamp,
          statusCode,
          details: axiosError.response.data,
        };
      case 403:
        return {
          type: ErrorType.PERMISSION_DENIED,
          message: message || 'You do not have permission to perform this action',
          timestamp,
          statusCode,
          details: axiosError.response.data,
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: message || 'Resource not found',
          timestamp,
          statusCode,
          details: axiosError.response.data,
        };
      case 429:
        return {
          type: ErrorType.UNKNOWN_ERROR,
          message: message || 'Too many requests. Please wait a moment and try again.',
          timestamp,
          statusCode,
          details: axiosError.response.data,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER_ERROR,
          message: message || 'Server error. Please try again later.',
          timestamp,
          statusCode,
          details: axiosError.response.data,
        };
      default:
        return {
          type: ErrorType.UNKNOWN_ERROR,
          message: message || 'An unexpected error occurred',
          timestamp,
          statusCode,
          details: axiosError.response.data,
        };
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message,
      timestamp,
      details: error,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error,
      timestamp,
    };
  }

  // Handle unknown error types
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    timestamp,
    details: error,
  };
};

/**
 * Get a user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection and try again.';
    case ErrorType.AUTHENTICATION_ERROR:
      return 'Your session has expired. Please log in again.';
    case ErrorType.VALIDATION_ERROR:
      return error.message || 'Please check your input and try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource could not be found.';
    case ErrorType.PERMISSION_DENIED:
      return 'You do not have permission to perform this action.';
    case ErrorType.SERVER_ERROR:
      return 'Server error. Our team has been notified. Please try again later.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
};

/**
 * Determine if an error is retryable
 */
export const isRetryableError = (error: AppError): boolean => {
  return (
    error.type === ErrorType.NETWORK_ERROR ||
    error.type === ErrorType.SERVER_ERROR ||
    (error.statusCode !== undefined && error.statusCode >= 500)
  );
};

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export const logError = (error: AppError, context?: string): void => {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      details: error.details,
    });
  }

  // In production, you would send this to an error tracking service like Sentry
  // Example: Sentry.captureException(error.details || error.message, { extra: { context } });
};
