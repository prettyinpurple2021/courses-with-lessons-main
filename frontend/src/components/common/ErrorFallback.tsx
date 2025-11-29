import React from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import GlassmorphicButton from './GlassmorphicButton';
import { AppError } from '../../types/error';
import { getUserFriendlyMessage } from '../../utils/errorHandler';

interface ErrorFallbackProps {
  error?: AppError | Error | unknown;
  onRetry?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  title = 'Unable to load data',
  message,
  showRetry = true,
  className = '',
}) => {
  // Get user-friendly message
  const errorMessage = message || (error && 'type' in (error as AppError)
    ? getUserFriendlyMessage(error as AppError)
    : 'An error occurred while loading this content.');

  return (
    <GlassmorphicCard className={`p-8 text-center ${className}`}>
      <div className="mb-6">
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
      </div>

      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/70 mb-6">{errorMessage}</p>

      {showRetry && onRetry && (
        <GlassmorphicButton onClick={onRetry} variant="primary">
          Try Again
        </GlassmorphicButton>
      )}
    </GlassmorphicCard>
  );
};

export default ErrorFallback;
