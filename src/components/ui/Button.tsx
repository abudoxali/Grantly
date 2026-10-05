import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'amber';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.99] cursor-pointer';

    const variants = {
      primary:
        'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-sm shadow-primary/20',
      secondary:
        'bg-primary-soft text-text-primary hover:bg-primary-100 active:bg-primary-200',
      outline:
        'border border-border bg-white text-text-primary hover:bg-background hover:border-primary-border active:bg-primary-soft shadow-xs',
      ghost:
        'text-text-secondary hover:bg-primary-soft hover:text-primary active:bg-primary-100',
      success:
        'bg-success-ink text-white hover:brightness-95 active:brightness-90 shadow-sm',
      amber:
        'bg-warning-ink text-white shadow-sm transition-all hover:brightness-95 active:brightness-90',
    };

    const sizes = {
      sm: 'text-xs px-3 py-2 gap-1.5 h-11 min-h-11',
      md: 'text-sm px-4 py-2.5 gap-2 h-11 min-h-11',
      lg: 'text-base px-6 py-3 gap-2.5 h-12 min-h-12',
      icon: 'h-11 min-h-11 w-11 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 transition-transform group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
