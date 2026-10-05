import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuides } from '@/lib/db/repository';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import { BookOpen, Clock, User, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatGuideCategory } from '@/lib/utils';

interface GuidesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: GuidesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'أدلة واستراتيجيات التقديم على المنح | جرانتلي'
      : 'Scholarship Application Guides & Playbooks | Grantly',
    description: isAr
      ? 'أدلة إرشادية عملية لكتابة خطابات الدافع القوية، وإعداد السيرة الذاتية الأكاديمية، والحصول على إعفاءات اختبارات اللغة (آيلتس وتوفل).'
      : 'Actionable admissions playbooks for writing high-impact motivation letters, formatting academic CVs, and obtaining English language test waivers.',
  };
}

export default async function LocalizedGuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;
  const t = getDictionary(loc);
  const isAr = loc === 'ar';

  const guides = await getGuides(true);

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.home.guidesTitle}</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {isAr ? 'أدلة واستراتيجيات القبول الأكاديمي' : 'Admissions Strategy Playbooks'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {isAr
              ? 'مناهج عملية وإرشادات تفصيلية تساعدك على تجاوز العقبات وتجهيز ملف تقديم تنافسي للمنح العالمية.'
              : 'Actionable blueprints for crafting winning statements of purpose, securing stellar reference letters, and navigating visa requirements.'}
          </p>
        </div>

        {guides.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={isAr ? 'أدلة التقديم قيد التحرير' : 'Application guides are in editorial review'}
            description={isAr ? 'ستظهر هنا إرشادات عملية بعد مراجعتها من فريق جرانتلي.' : 'Reviewed application guidance will appear here as our editorial team prepares it.'}
            action={
              <Link
                href={`/${locale}/about`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                <span>{t.common.about}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => {
              const title = isAr ? guide.title_ar : guide.title_en;
              const excerpt = isAr ? guide.excerpt_ar : guide.excerpt_en;

              return (
                <div
                  key={guide.id}
                  className="card-surface card-interactive flex flex-col p-6"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-medium">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                      {formatGuideCategory(guide.category, loc)}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {guide.reading_time_minutes} {isAr ? 'دقائق' : 'min'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6 flex-1">
                    {excerpt}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <User className="w-3.5 h-3.5" />
                      <span>{guide.author}</span>
                    </div>
                    <Link
                      href={`/${locale}/guides/${guide.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <span>{isAr ? 'اقرأ الدليل' : 'Read'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
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
