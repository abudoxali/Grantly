'use client';

import * as React from 'react';
import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { useLocale } from '@/i18n/context';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  markVariant?: 'light' | 'dark' | 'emerald';
  showSubtitle?: boolean;
  theme?: 'light' | 'dark';
  href?: string;
  asLink?: boolean;
}

export function Logo({
  className,
  size = 'md',
  markVariant = 'emerald',
  showSubtitle = true,
  theme = 'light',
  href,
  asLink = true,
}: LogoProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const markSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={cn('group inline-flex items-center gap-2.5 select-none', className)}>
      <BrandMark size={markSizes[size]} variant={markVariant} />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'font-extrabold tracking-tight font-sans leading-none',
              textClasses[size],
              theme === 'light' ? 'text-slate-900' : 'text-white'
            )}
          >
            {isArabic ? 'جرانتلي' : 'Grantly'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 inline-block mb-0.5" />
        </div>
        {showSubtitle && (
          <span
            className={cn(
              'text-[10px] uppercase font-semibold tracking-wider leading-none mt-1',
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            )}
          >
            {isArabic ? 'المنح العالمية الموثقة' : 'Global Scholarships'}
          </span>
        )}
      </div>
    </div>
  );

  if (!asLink) {
    return content;
  }

  if (href) {
    return (
      <Link href={href} className="focus:outline-hidden" aria-label="Grantly Home">
        {content}
      </Link>
    );
  }

  return (
    <Link href={`/${locale}`} className="focus:outline-hidden" aria-label="Grantly Home">
      {content}
    </Link>
  );
}
