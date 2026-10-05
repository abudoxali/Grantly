import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountries } from '@/lib/db/repository';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import { ArrowRight, Globe2, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatLivingCost } from '@/lib/utils';

interface CountriesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CountriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'وجهات الدراسة العالمية وتكاليف المعيشة | جرانتلي'
      : 'Global Study Destinations & Living Costs | Grantly',
    description: isAr
      ? 'استكشف الدول والوجهات الدراسية العالمية الرائدة، وقارن تكاليف المعيشة والمنح المتاحة في المملكة المتحدة وألمانيا والولايات المتحدة والمزيد.'
      : 'Explore leading global study destinations, compare realistic monthly living costs, and discover verified scholarships across the UK, Germany, USA, Japan, and more.',
  };
}

export default async function LocalizedCountriesPage({
  params,
}: CountriesPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;
  const t = getDictionary(loc);
  const isAr = loc === 'ar';

  const countries = await getCountries();

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{t.home.exploreDestinationsTitle}</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {isAr ? 'وجهات التميز الأكاديمي حول العالم' : 'Study Destinations Worldwide'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {isAr
              ? 'دليل استكشافي شامل يوضح تكاليف المعيشة الواقعية، والعملة المحلية، والمنح الحكومية المتاحة لكل دولة.'
              : 'Comprehensive guides comparing authentic living expenses, local currencies, and national scholarship schemes.'}
          </p>
        </div>

        {countries.length === 0 ? (
          <EmptyState
            icon={Globe2}
            title={isAr ? 'وجهات الدراسة قيد الإعداد' : 'Study destinations are being prepared'}
            description={isAr ? 'ستظهر هنا الدول التي اكتملت مراجعة معلوماتها الدراسية وتكاليف المعيشة فيها.' : 'Country profiles will appear here as their study and living-cost information is verified.'}
            action={
              <Link
                href={`/${locale}/scholarships`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                <span>{t.nav.findScholarships}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => {
              const name = isAr ? country.name_ar : country.name_en;
              const desc = isAr ? country.description_ar : country.description_en;

              return (
                <div key={country.id} className="card-surface card-interactive flex flex-col p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-4xl">{country.flag}</span>
                    <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
                      {country.code}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-text-primary">{name}</h3>

                  {desc && (
                    <p className="flex-1 text-sm leading-relaxed text-text-secondary">
                      {desc}
                    </p>
                  )}

                  {country.living_cost_from && (
                    <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Wallet className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          {formatLivingCost(country.living_cost_from, country.living_cost_to, country.currency, loc)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      href={`/${locale}/scholarships?country=${encodeURIComponent(country.name_en)}`}
                      className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                    >
                      <span>{isAr ? 'عرض منح هذه الدولة' : 'View Scholarships'}</span>
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
