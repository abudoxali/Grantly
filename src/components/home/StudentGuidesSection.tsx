'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import type { Guide } from '@/lib/supabase/types';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatGuideCategory } from '@/lib/utils';

interface StudentGuidesSectionProps {
  guides: Guide[];
}

export function StudentGuidesSection({ guides }: StudentGuidesSectionProps) {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  return (
    <section className="border-b border-border/70 bg-white py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.home.guidesTitle}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              {t.home.guidesSubtitle}
            </h2>
          </div>
          <Link href={`/${locale}/guides`}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
              className="h-11 text-xs font-semibold"
            >
              {t.common.guides}
            </Button>
          </Link>
        </div>

        {guides.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            compact
            title={isAr ? 'أدلة التقديم قيد التحرير' : 'Application guides are in editorial review'}
            description={isAr ? 'ننشر هنا إرشادات عملية بعد مراجعتها لتساعدك على الاستعداد للتقديم.' : 'Practical application guidance will appear here after editorial review.'}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {guides.slice(0, 3).map((guide) => {
              const title = isAr ? guide.title_ar : guide.title_en;
              const excerpt = isAr ? guide.excerpt_ar : guide.excerpt_en;

              return (
                <Link
                  key={guide.id}
                  href={`/${locale}/guides/${guide.slug}`}
                  className="card-surface card-interactive group flex flex-col p-6"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-medium">
                    <span className="rounded-full border border-primary-border bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                      {formatGuideCategory(guide.category, locale)}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {guide.reading_time_minutes} {isAr ? 'دقائق' : 'min'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold leading-snug text-text-primary transition-colors group-hover:text-primary">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                    {excerpt}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3 text-xs font-semibold text-primary">
                    <span>{isAr ? 'اقرأ الدليل كاملاً' : 'Read Guide'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
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
