import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  holographic?: boolean;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  holographic = true,
  text,
  className = '',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const holographicClass = holographic ? 'holographic-border' : '';
  const containerClass = fullScreen 
    ? 'fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-girly-pink/10 via-steel-grey/10 to-glossy-black/10 backdrop-blur-sm z-50' 
    : `flex flex-col items-center justify-center gap-4 ${className}`;

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring with holographic effect */}
        <div
          className={`absolute inset-0 rounded-full border-4 border-transparent ${holographicClass} animate-spin`}
          style={{ animationDuration: '1.5s' }}
          aria-hidden="true"
        />
        
        {/* Inner ring */}
        <div
          className="absolute inset-2 rounded-full border-4 border-hot-pink/30 border-t-hot-pink animate-spin"
          style={{ animationDuration: '1s' }}
          aria-hidden="true"
        />
        
        {/* Center dot with pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`w-2 h-2 rounded-full bg-success-teal ${holographic ? 'holographic-pulse' : ''}`}
            aria-hidden="true"
          />
        </div>
      </div>
      
      {text && (
        <p className="text-white font-semibold animate-pulse">
          {text}
        </p>
      )}
      
      {/* Screen reader text */}
      <span className="sr-only">
        {text || 'Loading...'}
      </span>
    </div>
  );
};

export default LoadingSpinner;
