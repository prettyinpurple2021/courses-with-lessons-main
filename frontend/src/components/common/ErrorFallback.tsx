import React from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import GlassmorphicButton from './GlassmorphicButton';
import { AppError } from '../../types/error';
import { getUserFriendlyMessage, isOfflineError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface ErrorFallbackProps {
  error?: AppError | Error | unknown;
  onRetry?: () => void | Promise<void>;
  title?: string;
  message?: string;
  showRetry?: boolean;
  className?: string;
  retryCount?: number;
  isRetrying?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  title = 'Unable to load data',
  message,
  showRetry = true,
  className = '',
  retryCount = 0,
  isRetrying = false,
}) => {
  // Get user-friendly message
  const errorMessage = message || (error && 'type' in (error as AppError)
    ? getUserFriendlyMessage(error as AppError)
    : 'An error occurred while loading this content.');

  const appError = error && 'type' in (error as AppError) ? (error as AppError) : null;
  const isOffline = appError ? isOfflineError(appError) : false;

  return (
    <GlassmorphicCard className={`p-6 md:p-8 text-center ${className}`}>
      <div className="mb-6">
        {isOffline ? (
          <svg
            className="w-16 h-16 mx-auto text-yellow-500/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        ) : (
          <svg
            className="w-16 h-16 mx-auto text-red-500/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/70 mb-4 text-sm md:text-base">{errorMessage}</p>

      {isOffline && (
        <p className="text-yellow-400/80 text-sm mb-6">
          You appear to be offline. Please check your internet connection.
        </p>
      )}

      {retryCount > 0 && !isRetrying && (
        <p className="text-gray-400 text-sm mb-4">
          Previous attempts: {retryCount}
        </p>
      )}

      {showRetry && onRetry && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <GlassmorphicButton 
            onClick={async () => {
              try {
                await onRetry();
              } catch (error) {
                // Error is already handled by the retry mechanism or parent component
                // This prevents unhandled promise rejections
                logger.error('Error in retry callback', error);
              }
            }}
            variant="primary"
            disabled={isRetrying}
            loading={isRetrying}
            className="min-w-[120px]"
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </GlassmorphicButton>
          {isOffline && (
            <button
              onClick={() => window.location.reload()}
              className="text-hot-pink hover:text-white transition-colors text-sm underline"
            >
              Reload Page
            </button>
          )}
        </div>
      )}
    </GlassmorphicCard>
  );
};

export default ErrorFallback;
