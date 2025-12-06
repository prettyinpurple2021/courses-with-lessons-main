import { useState, useCallback } from 'react';
import { AppError } from '../types/error';
import { isRetryableError, parseError } from '../utils/errorHandler';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: AppError) => void;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: AppError | null;
}

/**
 * Hook for retrying failed operations with exponential backoff
 * Production-ready retry mechanism with proper error handling
 */
export function useRetry<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  });

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      let attempt = 0;
      let lastError: AppError | null = null;

      while (attempt <= maxRetries) {
        try {
          const result = await operation(...args);
          
          // Reset state on success
          setState({
            isRetrying: false,
            retryCount: 0,
            lastError: null,
          });

          if (attempt > 0 && onSuccess) {
            onSuccess();
          }

          return result;
        } catch (error) {
          lastError = parseError(error);
          
          // Don't retry if error is not retryable
          if (!isRetryableError(lastError)) {
            setState({
              isRetrying: false,
              retryCount: attempt,
              lastError,
            });
            
            if (onFailure) {
              onFailure(lastError);
            }
            
            throw lastError;
          }

          // If we've exhausted retries, throw the error
          if (attempt >= maxRetries) {
            setState({
              isRetrying: false,
              retryCount: attempt,
              lastError,
            });
            
            if (onFailure) {
              onFailure(lastError);
            }
            
            throw lastError;
          }

          // Calculate delay with exponential backoff
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt)
            : retryDelay;

          setState({
            isRetrying: true,
            retryCount: attempt + 1,
            lastError,
          });

          if (onRetry) {
            onRetry(attempt + 1);
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
        }
      }

      // This should never be reached, but TypeScript needs it
      throw lastError || parseError(new Error('Unknown error'));
    },
    [operation, maxRetries, retryDelay, exponentialBackoff, onRetry, onSuccess, onFailure]
  );

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
    });
  }, []);

  return {
    execute,
    reset,
    ...state,
  };
}

