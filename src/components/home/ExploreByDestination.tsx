'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import type { Country } from '@/lib/supabase/types';
import { ArrowRight, Globe2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatLivingCost } from '@/lib/utils';

interface ExploreByDestinationProps {
  countries: Country[];
}

export function ExploreByDestination({ countries }: ExploreByDestinationProps) {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  return (
    <section className="border-b border-border/70 bg-background py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{t.home.exploreDestinationsTitle}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              {t.home.exploreDestinationsSubtitle}
            </h2>
          </div>
          <Link href={`/${locale}/countries`}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
              className="h-11 text-xs font-semibold"
            >
              {t.nav.exploreDestinations}
            </Button>
          </Link>
        </div>

        {countries.length === 0 ? (
          <EmptyState
            icon={Globe2}
            compact
            title={isAr ? 'وجهات الدراسة قيد الإعداد' : 'Study destinations are being prepared'}
            description={isAr ? 'ستظهر هنا الدول التي تتوفر فيها معلومات دراسية موثقة.' : 'Verified country profiles will appear here as destination information is reviewed.'}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {countries.slice(0, 8).map((country) => {
              const name = isAr ? country.name_ar : country.name_en;
              const desc = isAr ? country.description_ar : country.description_en;

              return (
                <Link
                  key={country.id}
                  href={`/${locale}/scholarships?country=${encodeURIComponent(country.name_en)}`}
                  className="card-surface card-interactive group flex flex-col p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-3xl">{country.flag}</span>
                    <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
                      {country.code}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-primary">
                    {name}
                  </h3>

                  {desc && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                      {desc}
                    </p>
                  )}

                  {country.living_cost_from && (
                    <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 shrink-0 text-muted" />
                        <span>
                          {formatLivingCost(country.living_cost_from, country.living_cost_to, country.currency, locale)}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
