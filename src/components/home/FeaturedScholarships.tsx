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
    <section className="border-b border-rose-100/60 bg-white py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {t.home.featuredTitle}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t.home.featuredSubtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/scholarships`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover shrink-0"
          >
            <span>{t.home.viewAllScholarships}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
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
