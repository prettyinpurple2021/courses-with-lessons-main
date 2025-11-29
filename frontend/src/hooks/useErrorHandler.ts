import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { parseError, getUserFriendlyMessage, logError } from '../utils/errorHandler';
import { AppError } from '../types/error';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { showToast: showToastDefault = true, logToConsole = true, context } = options;
  const toast = useToast();

  const handleError = useCallback(
    (error: unknown, customMessage?: string, showToast = showToastDefault) => {
      // Parse the error
      const appError: AppError = parseError(error);

      // Log the error
      if (logToConsole) {
        logError(appError, context);
      }

      // Show toast notification
      if (showToast) {
        const message = customMessage || getUserFriendlyMessage(appError);
        toast.error(message);
      }

      return appError;
    },
    [toast, showToastDefault, logToConsole, context]
  );

  return { handleError };
};
