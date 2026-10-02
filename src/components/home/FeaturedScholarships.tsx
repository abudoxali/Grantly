'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import type { Scholarship } from '@/lib/supabase/types';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FeaturedScholarshipsProps {
  scholarships: Scholarship[];
}

export function FeaturedScholarships({ scholarships }: FeaturedScholarshipsProps) {
  const { locale, t } = useI18n();

  return (
    <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.home.featuredTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
              {t.home.featuredSubtitle}
            </h2>
          </div>
          <Link href={`/${locale}/scholarships`}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
              className="font-semibold text-xs h-9"
            >
              {t.scholarships.clearAll ? t.nav.findScholarships : 'View all'}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.slice(0, 6).map((sch) => (
            <ScholarshipCard key={sch.id} scholarship={sch} />
          ))}
        </div>
      </div>
    </section>
  );
}
