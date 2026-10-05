'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'minimal' | 'bordered';
  onSwitch?: () => void;
}

export function LanguageSwitcher({
  className,
  variant = 'bordered',
  onSwitch,
}: LanguageSwitcherProps) {
  const { locale, switchLocale } = useI18n();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    switchLocale(nextLocale);
    onSwitch?.();
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-focus-ring',
        variant === 'bordered'
          ? 'bg-white border border-border text-text-secondary hover:bg-background hover:border-primary-border shadow-2xs'
          : 'text-text-secondary hover:text-text-primary hover:bg-primary-soft',
        className
      )}
      aria-label={locale === 'en' ? 'التبديل إلى اللغة العربية' : 'Switch to English'}
      title={locale === 'en' ? 'التبديل إلى اللغة العربية' : 'Switch to English'}
    >
      <Globe className="w-3.5 h-3.5 text-primary" />
      <span className="font-medium">{locale === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}
