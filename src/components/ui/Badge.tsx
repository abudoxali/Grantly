import * as React from 'react';
import { cn } from '@/lib/utils';
import { FundingType, ScholarshipStatus } from '@/lib/supabase/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'funding'
    | 'status'
    | 'degree'
    | 'outline'
    | 'amber'
    | 'emerald'
    | 'sky';
  size?: 'sm' | 'md' | 'lg';
  fundingType?: FundingType;
  status?: ScholarshipStatus;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  fundingType,
  status,
  children,
  ...props
}: BadgeProps) {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = '';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  if (fundingType) {
    switch (fundingType) {
      case 'Fully Funded':
        styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold';
        break;
      case 'Partial Funding':
        styleClasses = 'bg-amber-50 text-amber-900 border-amber-200/80 font-semibold';
        break;
      case 'Tuition Only':
        styleClasses = 'bg-sky-50 text-sky-800 border-sky-200/80 font-semibold';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'Open':
        styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium';
        dotColor = 'bg-emerald-500 animate-pulse';
        break;
      case 'Opening Soon':
        styleClasses = 'bg-amber-50 text-amber-900 border-amber-200/80 font-medium';
        dotColor = 'bg-amber-500';
        break;
      case 'Closed':
        styleClasses = 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
        dotColor = 'bg-slate-400';
        break;
    }
  } else {
    switch (variant) {
      case 'emerald':
        styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold';
        break;
      case 'sky':
        styleClasses = 'bg-sky-50 text-sky-800 border-sky-200/80 font-semibold';
        break;
      case 'amber':
        styleClasses = 'bg-amber-50 text-amber-900 border-amber-200/80 font-semibold';
        break;
      case 'degree':
        styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/70 font-medium';
        break;
      case 'outline':
        styleClasses = 'bg-white text-slate-700 border-slate-200 hover:border-slate-300';
        break;
      default:
        styleClasses = 'bg-slate-100 text-slate-800 border-slate-200/60 font-medium';
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-tight transition-colors',
        sizeClasses[size],
        styleClasses,
        className
      )}
      {...props}
    >
      {dotColor && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)} />}
      {children}
    </span>
  );
}
