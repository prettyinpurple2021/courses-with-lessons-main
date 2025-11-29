import React from 'react';

interface ProgressTrackerProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  holographicEffect?: boolean;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  holographicEffect = true,
  className = '',
}) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const holographicClass = holographicEffect ? 'holographic-glow' : '';

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-white font-semibold text-sm">{label}</span>}
          {showPercentage && (
            <span className="text-success-teal font-bold text-sm">{percentage}%</span>
          )}
        </div>
      )}
      <div className="glassmorphic h-3 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r from-hot-pink to-success-teal transition-all duration-500 ease-out ${holographicClass}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full holographic opacity-50"></div>
        </div>
      </div>
      {current !== undefined && total !== undefined && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-white/70 text-xs">
            {current} of {total} completed
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
