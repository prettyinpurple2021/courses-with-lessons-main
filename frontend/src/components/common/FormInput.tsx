import React, { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, containerClassName = '', className = '', ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-white/10 backdrop-blur-md
            border-2 ${hasError ? 'border-red-500/50' : 'border-white/20'}
            text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-hot-pink/50
            transition-all duration-200
            ${hasError ? 'shake' : ''}
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${props.name}-error`
              : helperText
              ? `${props.name}-helper`
              : undefined
          }
          {...props}
        />

        {hasError && (
          <div
            id={`${props.name}-error`}
            className="glassmorphic border-2 border-red-500/50 bg-red-500/10 p-3 rounded-lg mt-2 flex items-start gap-2"
            role="alert"
          >
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
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
            <p className="text-sm text-red-300">{error.message}</p>
          </div>
        )}

        {!hasError && helperText && (
          <p
            id={`${props.name}-helper`}
            className="mt-2 text-sm text-white/60"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
