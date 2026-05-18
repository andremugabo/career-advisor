import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-gray-300 ml-1 font-outfit">
          {label}
        </label>
        <input
          ref={ref}
          className={`glass-input ${error ? 'border-rose-500' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-rose-500 ml-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
