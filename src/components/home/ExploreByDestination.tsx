'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import type { Country } from '@/lib/supabase/types';
import { ArrowRight, Globe2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatLivingCost } from '@/lib/utils';

interface ExploreByDestinationProps {
  countries: Country[];
}

export function ExploreByDestination({ countries }: ExploreByDestinationProps) {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{t.home.exploreDestinationsTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
              {t.home.exploreDestinationsSubtitle}
            </h2>
          </div>
          <Link href={`/${locale}/countries`}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
              className="font-semibold text-xs h-9"
            >
              {t.nav.exploreDestinations}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {countries.slice(0, 8).map((country) => {
            const name = isAr ? country.name_ar : country.name_en;
            const desc = isAr ? country.description_ar : country.description_en;

            return (
              <Link
                key={country.id}
                href={`/${locale}/scholarships?country=${encodeURIComponent(country.name_en)}`}
                className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{country.flag}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {country.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {name}
                </h3>

                {desc && (
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {desc}
                  </p>
                )}

                {country.living_cost_from && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {formatLivingCost(country.living_cost_from, country.living_cost_to, country.currency, locale)}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
