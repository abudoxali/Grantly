import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full flex items-center">
        {leftIcon && (
          <div className="absolute start-3.5 text-muted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-text-primary placeholder:text-muted transition-colors focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs',
            leftIcon && 'ps-11',
            rightIcon && 'pe-11',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute end-3.5 text-muted flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
