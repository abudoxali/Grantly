import * as React from 'react';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'primary';
}

export function BrandMark({ className, size = 32, variant = 'primary' }: BrandMarkProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl transition-transform duration-200 select-none shrink-0',
        variant === 'primary' && 'bg-primary text-white shadow-sm shadow-primary/20',
        variant === 'dark' && 'bg-slate-900 text-white shadow-sm shadow-slate-900/10',
        variant === 'light' && 'bg-white text-primary border border-border shadow-xs',
        className
      )}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform group-hover:scale-105"
      >
        {/* Open arch of opportunity & education */}
        <path
          d="M4 20V11C4 6.58172 7.58172 3 12 3C16.4183 3 20 6.58172 20 11V20"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Central rising pathway toward global discovery */}
        <path
          d="M9 20V13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13V20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Radiant star / opportunity compass node */}
        <circle cx="12" cy="7" r="1.75" fill="var(--brand-accent)" />
      </svg>
    </div>
  );
}
