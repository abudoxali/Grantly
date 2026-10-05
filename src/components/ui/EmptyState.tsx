import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-3xl border border-primary-border/70 bg-white text-center shadow-xs',
        compact ? 'px-5 py-6 sm:px-7' : 'px-6 py-10 sm:px-10 sm:py-12',
        className
      )}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-border/70 bg-primary-soft text-primary">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-text-primary sm:text-lg">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
