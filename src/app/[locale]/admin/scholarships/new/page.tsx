import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCountries, getProviders } from '@/lib/db/repository';
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

  const [countries, providers] = await Promise.all([
    getCountries(),
    getProviders(),
  ]);

  return (
    <ScholarshipEditor
      countries={countries}
      providers={providers}
    />
  );
}
