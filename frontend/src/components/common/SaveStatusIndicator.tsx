

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  className?: string;
}

/**
 * Visual indicator for save status
 * Shows saving/saved/error states with appropriate styling
 */
export function SaveStatusIndicator({ status, lastSaved, className = '' }: SaveStatusIndicatorProps) {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        if (lastSaved) {
          const now = new Date();
          const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
          
          if (diff < 60) {
            return 'Saved just now';
          } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `Saved ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
          } else {
            const hours = Math.floor(diff / 3600);
            return `Saved ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
          }
        }
        return 'Saved';
      case 'error':
        return 'Failed to save';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <svg
            className="animate-spin h-4 w-4 text-hot-pink"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'saved':
        return (
          <svg
            className="h-4 w-4 text-success-teal"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="h-4 w-4 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span
        className={`
          ${status === 'saving' ? 'text-hot-pink' : ''}
          ${status === 'saved' ? 'text-success-teal' : ''}
          ${status === 'error' ? 'text-red-500' : ''}
        `}
      >
        {getStatusText()}
      </span>
    </div>
  );
}
