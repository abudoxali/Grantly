import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCountries } from '@/lib/db/repository';
import { SEED_PROVIDERS } from '@/lib/data/seed-data';
import { ScholarshipEditor } from '@/components/admin/ScholarshipEditor';
import { isValidLocale } from '@/i18n/get-dictionary';

interface NewScholarshipPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewScholarshipPage({
  params,
}: NewScholarshipPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const countries = await getCountries();

  return (
    <ScholarshipEditor
      countries={countries}
      providers={SEED_PROVIDERS}
    />
  );
}
