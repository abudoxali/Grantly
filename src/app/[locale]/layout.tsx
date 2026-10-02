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
        <div dir={dir} lang={locale} className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </I18nProvider>
  );
}
