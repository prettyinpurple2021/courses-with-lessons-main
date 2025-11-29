import React, { forwardRef } from 'react';

interface GlassmorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const GlassmorphicInput = forwardRef<HTMLInputElement, GlassmorphicInputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    const baseClasses = 'glassmorphic w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-hot-pink/50 transition-all duration-300';
    const errorClasses = error ? 'border-red-500/50 focus:ring-red-500/50' : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-white font-semibold mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseClasses} ${errorClasses} ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400 glassmorphic px-2 py-1 inline-block">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-white/70">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

GlassmorphicInput.displayName = 'GlassmorphicInput';

export default GlassmorphicInput;
