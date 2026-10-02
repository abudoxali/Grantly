'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import type { Guide } from '@/lib/supabase/types';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatGuideCategory } from '@/lib/utils';

interface StudentGuidesSectionProps {
  guides: Guide[];
}

export function StudentGuidesSection({ guides }: StudentGuidesSectionProps) {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.home.guidesTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
              {t.home.guidesSubtitle}
            </h2>
          </div>
          <Link href={`/${locale}/guides`}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
              className="font-semibold text-xs h-9"
            >
              {t.common.guides}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.slice(0, 3).map((guide) => {
            const title = isAr ? guide.title_ar : guide.title_en;
            const excerpt = isAr ? guide.excerpt_ar : guide.excerpt_en;

            return (
              <Link
                key={guide.id}
                href={`/${locale}/guides/${guide.slug}`}
                className="group flex flex-col p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-medium">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                    {formatGuideCategory(guide.category, locale)}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {guide.reading_time_minutes} {isAr ? 'دقائق' : 'min'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                  {excerpt}
                </p>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>{isAr ? 'اقرأ الدليل كاملاً' : 'Read Guide'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
