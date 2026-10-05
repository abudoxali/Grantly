import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { I18nProvider } from '@/i18n/context';
import { AuthProvider } from '@/lib/auth/context';
import { isValidLocale, getDirection } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'جرانتلي — اكتشف المنح الدراسية العالمية الموثقة وبوابات التقديم الرسمية'
      : 'Grantly — Discover Verified Global Scholarships & Official Portals',
    description: isAr
      ? 'منصة جرانتلي تساعد الطلاب في الوصول إلى المنح الدولية الممولة بالكامل، والتحقق من الشروط، والتقديم المباشر عبر البوابات الرسمية.'
      : 'Grantly helps students worldwide discover fully funded scholarships, compare verified living allowances, and apply directly to official government and university portals.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dir = getDirection(locale as Locale);

  return (
    <I18nProvider initialLocale={locale as Locale}>
      <AuthProvider>
        <div dir={dir} lang={locale} className="min-h-screen flex flex-col bg-background text-text-primary">
          <a
            href="#main-content"
            className="fixed start-3 top-3 z-[100] -translate-y-20 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
          >
            {locale === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
          </a>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </I18nProvider>
  );
}
