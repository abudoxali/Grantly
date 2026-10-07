'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/context';
import type { Country } from '@/lib/supabase/types';
import { ArrowRight, Globe2, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatLivingCost, getCountryCoverImage } from '@/lib/utils';

interface ExploreByDestinationProps {
  countries: Country[];
}

export function ExploreByDestination({ countries }: ExploreByDestinationProps) {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  return (
    <section className="border-b border-rose-100/60 bg-white py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {t.home.exploreDestinationsTitle}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t.home.exploreDestinationsSubtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/countries`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover shrink-0"
          >
            <span>{t.home.viewAllCountries}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
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
              const coverImg = getCountryCoverImage(country);

              return (
                <Link
                  key={country.id}
                  href={`/${locale}/scholarships?country=${encodeURIComponent(country.name_en)}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-rose-100/70 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-border"
                >
                  {/* Photo Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                    <Image
                      src={coverImg}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-2.5 end-2.5 z-10">
                      <span className="rounded-full bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-neutral-700 shadow-xs">
                        {country.code}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 start-3 z-10 flex items-center gap-2">
                      <span className="text-xl leading-none drop-shadow-sm">{country.flag}</span>
                      <span className="font-bold text-white text-sm sm:text-base drop-shadow-sm truncate max-w-[170px]">
                        {name}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-4">
                    {desc && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
                        {desc}
                      </p>
                    )}

                    {country.living_cost_from && (
                      <div className="mt-auto pt-3 border-t border-border/70 flex items-center justify-between text-xs text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5 shrink-0 text-muted" />
                          <span className="truncate">
                            {formatLivingCost(country.living_cost_from, country.living_cost_to, country.currency, locale)}
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
