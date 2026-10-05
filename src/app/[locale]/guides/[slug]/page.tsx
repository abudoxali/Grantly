import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuideBySlug, getGuides } from '@/lib/db/repository';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import { Clock, User, ChevronRight, ArrowRight } from 'lucide-react';
import { formatGuideCategory } from '@/lib/utils';

interface GuideDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: GuideDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: 'Guide Not Found | Grantly' };

  const isAr = locale === 'ar';
  const title = isAr ? guide.title_ar : guide.title_en;
  const excerpt = isAr ? guide.excerpt_ar : guide.excerpt_en;

  return {
    title: `${title} | Grantly Playbooks`,
    description: excerpt,
    alternates: {
      canonical: `/${locale}/guides/${slug}`,
      languages: {
        en: `/en/guides/${slug}`,
        ar: `/ar/guides/${slug}`,
      },
    },
  };
}

export default async function LocalizedGuideDetailPage({
  params,
}: GuideDetailPageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;
  const t = getDictionary(loc);
  const isAr = loc === 'ar';

  const guide = await getGuideBySlug(slug);
  if (!guide) {
    notFound();
  }

  const title = isAr ? guide.title_ar : guide.title_en;
  const content = isAr ? guide.content_ar : guide.content_en;

  // Other guides
  const allGuides = await getGuides(true);
  const otherGuides = allGuides.filter((g) => g.id !== guide.id).slice(0, 2);

  return (
    <article className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-emerald-700">
            {t.common.home}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
          <Link href={`/${locale}/guides`} className="hover:text-emerald-700">
            {t.common.guides}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
            {title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="mb-10 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
              {formatGuideCategory(guide.category, loc)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {guide.reading_time_minutes} {isAr ? 'دقائق قراءة' : 'min read'}
              </span>
            </div>
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl sm:leading-[1.25]">
            {title}
          </h1>

          <div className="mt-6 flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">{guide.author}</span>
              <span className="text-slate-400 text-xs">
                {isAr ? 'فريق التحرير والقبول الجامعي' : 'Admissions Strategy & Editorial Lab'}
              </span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base sm:text-lg whitespace-pre-line">
          {content}
        </div>

        {/* Other Guides Section */}
        {otherGuides.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-950 mb-6">
              {isAr ? 'أدلة إضافية مقترحة' : 'More Application Playbooks'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherGuides.map((g) => (
                <Link
                  key={g.id}
                  href={`/${locale}/guides/${g.slug}`}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/20 hover:border-emerald-500 transition-all flex flex-col"
                >
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    {formatGuideCategory(g.category, loc)}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 line-clamp-2">
                    {isAr ? g.title_ar : g.title_en}
                  </h4>
                  <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center text-xs font-bold text-emerald-700">
                    <span>{isAr ? 'اقرأ الدليل' : 'Read'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
