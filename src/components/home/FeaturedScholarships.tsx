'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import type { Scholarship } from '@/lib/supabase/types';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface FeaturedScholarshipsProps {
  scholarships: Scholarship[];
}

export function FeaturedScholarships({ scholarships }: FeaturedScholarshipsProps) {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  return (
    <section className="border-b border-border/70 bg-background py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{t.home.featuredTitle}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              {t.home.featuredSubtitle}
            </h2>
          </div>
          <Link
            href={`/${locale}/scholarships`}
            className="inline-flex h-11 min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-text-primary shadow-xs transition-all hover:border-primary-border hover:bg-background active:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            {t.nav.findScholarships}
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        {scholarships.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            compact
            title={isAr ? 'نجهّز الفرص الموثقة لتظهر هنا' : 'Verified opportunities are being prepared'}
            description={isAr ? 'ستظهر المنح المنشورة بعد اكتمال مراجعة مصادرها الرسمية.' : 'Published scholarships will appear here once their official sources have been reviewed.'}
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.slice(0, 6).map((sch) => (
              <ScholarshipCard key={sch.id} scholarship={sch} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
