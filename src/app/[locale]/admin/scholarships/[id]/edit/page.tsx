import * as React from 'react';
import { notFound } from 'next/navigation';
import { getScholarships, getCountries, getProviders } from '@/lib/db/repository';
import { ScholarshipEditor } from '@/components/admin/ScholarshipEditor';
import { isValidLocale } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';

interface EditScholarshipPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditScholarshipPage({
  params,
}: EditScholarshipPageProps) {
  const { locale, id } = await params;
  if (!isValidLocale(locale)) notFound();

  const [{ scholarships }, countries, providers] = await Promise.all([
    getScholarships({ publishedOnly: false }, locale as Locale),
    getCountries(),
    getProviders(),
  ]);

  const scholarship = scholarships.find((s) => s.id === id);
  if (!scholarship) notFound();

  return (
    <ScholarshipEditor
      initialData={scholarship}
      countries={countries}
      providers={providers}
    />
  );
}
