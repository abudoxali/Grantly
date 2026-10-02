'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale, Direction, Dictionary } from './types';
import { en } from './dictionaries/en';
import { ar } from './dictionaries/ar';

interface I18nContextValue {
  locale: Locale;
  dir: Direction;
  t: Dictionary;
  switchLocale: (newLocale: Locale) => void;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  ar,
};

export function I18nProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = React.useState<Locale>(initialLocale);
  const [prevInitialLocale, setPrevInitialLocale] = React.useState<Locale>(initialLocale);
  const router = useRouter();
  const pathname = usePathname() || '';

  if (initialLocale !== prevInitialLocale) {
    setPrevInitialLocale(initialLocale);
    setLocale(initialLocale);
  }

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';
  const t = DICTIONARIES[locale] || DICTIONARIES.en;

  const switchLocale = React.useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return;

      // Set cookie and localStorage
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem('grantly_locale', newLocale);
      } catch {
        // Ignore localStorage issues
      }

      // Compute new path by replacing current locale prefix
      let newPath = pathname;
      if (pathname.startsWith('/en')) {
        newPath = pathname.replace(/^\/en/, `/${newLocale}`);
      } else if (pathname.startsWith('/ar')) {
        newPath = pathname.replace(/^\/ar/, `/${newLocale}`);
      } else {
        newPath = `/${newLocale}${pathname}`;
      }

      setLocale(newLocale);
      router.push(newPath);
    },
    [locale, pathname, router]
  );

  return (
    <I18nContext.Provider value={{ locale, dir, t, switchLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    // Return fallback English context if used outside provider
    return {
      locale: 'en' as Locale,
      dir: 'ltr' as Direction,
      t: en,
      switchLocale: () => {},
    };
  }
  return context;
}

export function useTranslation() {
  return useI18n().t;
}

export function useLocale() {
  return useI18n().locale;
}

export function useDirection() {
  return useI18n().dir;
}
