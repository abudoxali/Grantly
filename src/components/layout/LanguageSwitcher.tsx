'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'minimal' | 'bordered';
}

export function LanguageSwitcher({
  className,
  variant = 'bordered',
}: LanguageSwitcherProps) {
  const { locale, switchLocale } = useI18n();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    switchLocale(nextLocale);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-emerald-500',
        variant === 'bordered'
          ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
        className
      )}
      aria-label={locale === 'en' ? 'التبديل إلى اللغة العربية' : 'Switch to English'}
      title={locale === 'en' ? 'التبديل إلى اللغة العربية' : 'Switch to English'}
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600" />
      <span className="font-medium">{locale === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}
