import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountries } from '@/lib/db/repository';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import { ArrowRight, Globe2, Wallet } from 'lucide-react';
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
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{t.home.exploreDestinationsTitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-sans tracking-tight">
            {isAr ? 'وجهات التميز الأكاديمي حول العالم' : 'Study Destinations Worldwide'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {isAr
              ? 'دليل استكشافي شامل يوضح تكاليف المعيشة الواقعية، والعملة المحلية، والمنح الحكومية المتاحة لكل دولة.'
              : 'Comprehensive guides comparing authentic living expenses, local currencies, and national scholarship schemes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country) => {
            const name = isAr ? country.name_ar : country.name_en;
            const desc = isAr ? country.description_ar : country.description_en;

            return (
              <div
                key={country.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{country.flag}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {country.code}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{name}</h3>

                {desc && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                    {desc}
                  </p>
                )}

                {country.living_cost_from && (
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {formatLivingCost(country.living_cost_from, country.living_cost_to, country.currency, loc)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    href={`/${locale}/scholarships?country=${encodeURIComponent(country.name_en)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>{isAr ? 'عرض منح هذه الدولة' : 'View Scholarships'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
