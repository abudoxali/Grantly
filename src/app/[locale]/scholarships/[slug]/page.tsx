import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScholarshipBySlug, getScholarships } from '@/lib/db/repository';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import { formatDate, formatStipend, formatDegreeLevel, getDaysRemaining } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { ScholarshipDetailClient } from './ScholarshipDetailClient';
import {
  Building,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Coins,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface ScholarshipPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ScholarshipPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) {
    return { title: 'Scholarship Not Found | Grantly' };
  }

  const isAr = locale === 'ar';
  const title = isAr ? scholarship.title_ar : scholarship.title_en;
  const summary = isAr
    ? scholarship.funding_summary_ar || scholarship.short_description_ar
    : scholarship.funding_summary_en || scholarship.short_description_en;

  return {
    title: `${title} — ${isAr ? 'شروط التقديم والرابط الرسمي' : 'Requirements & Official Portal'} | Grantly`,
    description: `${summary}. ${isAr ? 'الموعد النهائي:' : 'Deadline:'} ${scholarship.deadline ? formatDate(scholarship.deadline) : 'Open'}.`,
    alternates: {
      canonical: `/${locale}/scholarships/${slug}`,
      languages: {
        en: `/en/scholarships/${slug}`,
        ar: `/ar/scholarships/${slug}`,
      },
    },
  };
}

export default async function LocalizedScholarshipDetailPage({
  params,
}: ScholarshipPageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;
  const t = getDictionary(loc);
  const isAr = loc === 'ar';

  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) {
    notFound();
  }

  const title = isAr ? scholarship.title_ar : scholarship.title_en;
  const description = isAr
    ? scholarship.description_ar || scholarship.short_description_ar
    : scholarship.description_en || scholarship.short_description_en;
  const countryName = scholarship.country
    ? isAr
      ? scholarship.country.name_ar
      : scholarship.country.name_en
    : '';
  const providerName = scholarship.provider
    ? isAr
      ? scholarship.provider.name_ar
      : scholarship.provider.name_en
    : '';

  const eligibilityList = isAr ? scholarship.eligibility_ar : scholarship.eligibility_en;
  const documentsList = isAr
    ? scholarship.required_documents_ar
    : scholarship.required_documents_en;

  // Fetch related scholarships
  const { scholarships: allScholarships } = await getScholarships({ publishedOnly: true }, loc);
  const relatedScholarships = allScholarships
    .filter((s) => s.id !== scholarship.id)
    .slice(0, 3);

  const deadlineInfo = scholarship.deadline
    ? getDaysRemaining(scholarship.deadline)
    : null;

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-primary">
            {t.common.home}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
          <Link href={`/${locale}/scholarships`} className="hover:text-primary">
            {t.common.scholarships}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
            {title}
          </span>
        </nav>

        {/* Hero Header Card */}
        <div className="card-surface mb-8 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {scholarship.country && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-800">
                    <span className="text-base">{scholarship.country.flag}</span>
                    <span>{countryName}</span>
                  </span>
                )}
                <Badge
                  variant={
                    scholarship.funding_type === 'Fully Funded'
                      ? 'success'
                      : scholarship.funding_type === 'Partial Funding'
                        ? 'amber'
                        : 'sky'
                  }
                  size="md"
                >
                  {scholarship.funding_type === 'Fully Funded'
                    ? t.common.fullyFunded
                    : scholarship.funding_type === 'Partial Funding'
                      ? t.common.partialFunding
                      : t.common.tuitionOnly}
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-success-border bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-ink">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  <span>{t.common.officialSource}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-balance text-2xl font-semibold leading-snug tracking-tight text-text-primary sm:text-4xl">
                {title}
              </h1>

              {/* Provider */}
              {providerName && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-2 font-medium">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{providerName}</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons (Save + Apply) handled client-side */}
            <ScholarshipDetailClient scholarship={scholarship} />
          </div>

          {/* Key Facts Ribbon */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t.details.stipendLabel}
              </span>
              <span className="mt-1 block text-sm font-semibold text-primary sm:text-base">
                {formatStipend(scholarship.stipend_amount, loc)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t.common.deadline}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                {scholarship.deadline ? formatDate(scholarship.deadline, loc) : scholarship.status}
              </span>
              {deadlineInfo && deadlineInfo.days > 0 && deadlineInfo.days <= 60 && (
                <span className="text-[11px] text-amber-700 font-bold">
                  {deadlineInfo.days} {t.common.daysLeft}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t.details.academicLevel}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block">
                {scholarship.degree_levels.map((deg) => formatDegreeLevel(deg, loc)).join(', ')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t.details.lastVerifiedOn}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-700 mt-1 block">
                {scholarship.last_verified_at ? formatDate(scholarship.last_verified_at, loc) : (isAr ? 'نشط' : 'Active')}
              </span>
            </div>
          </div>
        </div>

        {/* Content Layout: Main Info Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-column Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Overview */}
            <section className="card-surface p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-sans mb-4">
                {t.details.overview}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </section>

            {/* 2. Benefits Breakdown */}
            {scholarship.benefits && scholarship.benefits.length > 0 && (
              <section className="card-surface p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-sans">
                    {t.details.financialBenefits}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scholarship.benefits.map((b, i) => {
                    const bTitle = isAr ? b.title_ar : b.title_en;
                    const bDesc = isAr ? b.description_ar : b.description_en;
                    return (
                      <div
                        key={i}
                        className="flex flex-col rounded-xl border border-success-border bg-success-soft/60 p-4"
                      >
                        <h4 className="mb-1 text-sm font-semibold text-success-ink">
                          {bTitle}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {bDesc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Eligibility Criteria */}
            {eligibilityList && eligibilityList.length > 0 && (
              <section className="card-surface p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-sans">
                    {t.details.eligibilityCriteria}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {eligibilityList.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 4. Required Documents */}
            {documentsList && documentsList.length > 0 && (
              <section className="card-surface p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-sans">
                    {t.details.requiredDocuments}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {documentsList.map((doc, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sticky Sidebar Action Card */}
          <aside className="space-y-6">
            <div className="sticky top-24 card-surface space-y-6 p-6">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {t.details.applicationProcess}
                </span>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {t.details.officialPortalWarning}
                </p>
              </div>

              {/* Apply Button */}
              <a
                href={scholarship.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
              >
                {t.details.proceedToOfficialPortal}
                <ExternalLink className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              </a>

              {/* Disclaimer Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{t.details.externalDisclaimer}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Scholarships */}
        {relatedScholarships.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans mb-6">
              {t.details.relatedScholarships}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedScholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
