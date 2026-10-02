import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScholarshipsDirectory } from '@/components/scholarships/ScholarshipsDirectory';
import { getScholarships, getCountries, getFields } from '@/lib/db/repository';
import { isValidLocale } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';

interface ScholarshipsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ScholarshipsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'دليل المنح الدراسية العالمية الموثقة | جرانتلي'
      : 'Global Scholarships Directory — Verified Grants | Grantly',
    description: isAr
      ? 'تصفح وفلتر المنح الدراسية العالمية الممولة بالكامل بحسب الدولة والمرحلة الأكاديمية والتخصص ومواعيد التقديم الرسمية.'
      : 'Explore and filter verified fully funded international scholarships by country, degree level, academic field, and official application deadlines.',
  };
}

export default async function LocalizedScholarshipsPage({
  params,
}: ScholarshipsPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;

  const [{ scholarships }, countries, fields] = await Promise.all([
    getScholarships({ publishedOnly: true }, loc),
    getCountries(),
    getFields(),
  ]);

  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-sm text-slate-500">
          Loading scholarships directory...
        </div>
      }
    >
      <ScholarshipsDirectory
        initialScholarships={scholarships}
        countries={countries}
        fields={fields}
      />
    </React.Suspense>
  );
}
