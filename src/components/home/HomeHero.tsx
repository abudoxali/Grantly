'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import type { Locale } from '@/i18n/types';
import type { Scholarship } from '@/lib/supabase/types';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Compass,
  GraduationCap,
  Globe2,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeroGeometricBackground } from './HeroGeometricBackground';
import { formatDate, formatStipend } from '@/lib/utils';

interface HomeHeroProps {
  stats: {
    scholarshipCount: number;
    countryCount: number;
  };
  spotlightScholarships: Scholarship[];
}

interface ScholarshipSpotlightProps {
  scholarship: Scholarship;
  locale: Locale;
  verifiedLabel: string;
  officialLabel: string;
  detailLabel: string;
  fullyFundedLabel: string;
  partialFundingLabel: string;
  tuitionOnlyLabel: string;
  openLabel: string;
  openingSoonLabel: string;
  closedLabel: string;
}

function ScholarshipSpotlight({
  scholarship,
  locale,
  verifiedLabel,
  officialLabel,
  detailLabel,
  fullyFundedLabel,
  partialFundingLabel,
  tuitionOnlyLabel,
  openLabel,
  openingSoonLabel,
  closedLabel,
}: ScholarshipSpotlightProps) {
  const isAr = locale === 'ar';
  const title = isAr ? scholarship.title_ar : scholarship.title_en;
  const provider = scholarship.provider
    ? isAr
      ? scholarship.provider.name_ar
      : scholarship.provider.name_en
    : '';
  const country = scholarship.country
    ? isAr
      ? scholarship.country.name_ar
      : scholarship.country.name_en
    : '';
  const fundingLabel =
    scholarship.funding_type === 'Fully Funded'
      ? fullyFundedLabel
      : scholarship.funding_type === 'Partial Funding'
        ? partialFundingLabel
        : tuitionOnlyLabel;
  const fundingClasses =
    scholarship.funding_type === 'Fully Funded'
      ? 'bg-success-soft text-success-ink border-success-border'
      : scholarship.funding_type === 'Partial Funding'
        ? 'bg-warning-soft text-warning-ink border-warning-border'
        : 'bg-info-soft text-info-ink border-info-border';
  const statusLabel =
    scholarship.status === 'Open'
      ? openLabel
      : scholarship.status === 'Opening Soon'
        ? openingSoonLabel
        : closedLabel;

  return (
    <Link
      href={`/${locale}/scholarships/${scholarship.slug}`}
      className="card-surface card-interactive group block rounded-2xl p-4 backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="mt-1.5 truncate text-xs text-text-secondary">
            {scholarship.country && <span className="me-1.5">{scholarship.country.flag}</span>}
            {country}
            {provider && country ? <span className="mx-1.5 text-muted">·</span> : null}
            {provider}
          </p>
        </div>
        {scholarship.last_verified_at && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-border bg-success-soft px-2 py-1 text-[10px] font-semibold text-success-ink">
            <CheckCircle2 className="h-3 w-3" />
            {verifiedLabel}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${fundingClasses}`}>
          {fundingLabel}
        </span>
        {scholarship.stipend_amount && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Wallet className="h-3.5 w-3.5" />
            {formatStipend(scholarship.stipend_amount, locale)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-[11px]">
        <span className="truncate text-text-secondary">
          {scholarship.deadline ? formatDate(scholarship.deadline, locale) : statusLabel}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary transition-colors group-hover:text-primary-hover">
          <span>{detailLabel || officialLabel}</span>
          <ExternalLink className="h-3 w-3 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}

export function HomeHero({ stats, spotlightScholarships = [] }: HomeHeroProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const isAr = locale === 'ar';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/scholarships?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/${locale}/scholarships`);
    }
  };

  const trendingTags = [
    { label: isAr ? 'ماجستير' : "Master's", query: 'Master', type: 'degree' },
    { label: isAr ? 'دكتوراه' : 'PhD', query: 'PhD', type: 'degree' },
    { label: isAr ? 'تمويل كامل' : 'Fully Funded', query: 'Fully Funded', type: 'funding' },
    { label: isAr ? 'المملكة المتحدة' : 'United Kingdom', query: 'United Kingdom', type: 'country' },
    { label: isAr ? 'ألمانيا' : 'Germany', query: 'Germany', type: 'country' },
  ];

  const spotlightProps = {
    locale,
    verifiedLabel: t.common.verified,
    officialLabel: t.common.officialSource,
    detailLabel: t.common.viewDetails,
    fullyFundedLabel: t.common.fullyFunded,
    partialFundingLabel: t.common.partialFunding,
    tuitionOnlyLabel: t.common.tuitionOnly,
    openLabel: t.common.open,
    openingSoonLabel: t.common.openingSoon,
    closedLabel: t.common.closed,
  };

  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-background via-white to-white py-10 sm:py-14 lg:py-16">
      {/* High-Tech Animated Geometric & Orbital Blueprint Canvas */}
      <HeroGeometricBackground />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Floating Interactive 3D/Motion Cards (Outer Flanks on Desktop) */}
        {spotlightScholarships.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-6 z-10 hidden xl:block">
            {/* Flank 1: First published scholarship */}
            <div className="pointer-events-auto absolute start-0 top-4 w-[min(14rem,22vw)] animate-float-slow">
              <ScholarshipSpotlight scholarship={spotlightScholarships[0]} {...spotlightProps} />
            </div>
            {/* Flank 2: Next published scholarship */}
            {spotlightScholarships[1] && (
              <div className="pointer-events-auto absolute end-0 top-16 w-[min(14rem,22vw)] animate-float-reverse">
                <ScholarshipSpotlight scholarship={spotlightScholarships[1]} {...spotlightProps} />
              </div>
            )}
          </div>
        )}

        {/* Center Stage: Hero Content */}
        <div className="relative z-20 mx-auto max-w-2xl text-center">
          {/* Top Live Verification Radar Beacon */}
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-border/70 bg-white/90 px-3.5 py-2 text-xs font-semibold text-text-secondary shadow-xs backdrop-blur-sm sm:px-4">
            <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-success" />
            <span className="text-balance">{t.home.badge}</span>
            <span className="hidden h-1 w-1 shrink-0 rounded-full bg-border sm:inline-block" />
            <span className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold text-success-ink sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isAr ? 'مصادر موثوقة' : 'VERIFIED SOURCES'}</span>
            </span>
          </div>

          {/* Main Headline with High-End Precision Typography */}
          <h1 className="mt-5 text-balance text-3xl font-semibold leading-[1.24] tracking-tight text-text-primary sm:text-5xl sm:leading-[1.18] lg:text-6xl">
            {t.home.headlineStart}{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-accent to-primary-hover bg-clip-text text-transparent font-bold">
                {t.home.headlineHighlight}
              </span>
              {/* Sleek architectural underline */}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary-border to-transparent opacity-90" />
            </span>
          </h1>

          {/* Subheadline with Generous Breathing Room */}
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
            {t.home.subheadline}
          </p>

          {/* High-Tech Interactive Search Box */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="group mx-auto mt-7 flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-border bg-white/95 p-2 shadow-card backdrop-blur-md transition-all duration-200 hover:border-primary-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-scholarship-search" className="sr-only">
              {t.home.searchPlaceholder}
            </label>
            <div className="flex min-h-12 w-full min-w-0 items-center gap-2 px-1">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-border/70 bg-primary-soft text-primary transition-colors group-focus-within:bg-primary group-focus-within:text-white">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="hero-scholarship-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="min-h-12 w-full min-w-0 border-0 bg-transparent px-2 text-sm font-medium text-text-primary placeholder:text-muted focus:border-0 focus:ring-0 sm:text-base"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="h-12 w-full shrink-0 px-6 text-sm font-semibold sm:w-auto"
              rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}
            >
              {t.common.search}
            </Button>
          </form>

          {/* Popular Search Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-text-secondary">
            <span className="inline-flex min-h-11 items-center gap-1.5 px-1 font-semibold text-text-secondary">
              <Compass className="h-3.5 w-3.5 text-mauve" />
              <span>{t.home.popularSearches}</span>
            </span>
            {trendingTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => {
                  if (tag.type === 'degree') {
                    router.push(`/${locale}/scholarships?degree=${encodeURIComponent(tag.query)}`);
                  } else if (tag.type === 'funding') {
                    router.push(`/${locale}/scholarships?funding=${encodeURIComponent(tag.query)}`);
                  } else {
                    router.push(`/${locale}/scholarships?country=${encodeURIComponent(tag.query)}`);
                  }
                }}
                className="inline-flex min-h-11 items-center rounded-full border border-border bg-white px-3 text-xs font-medium text-text-secondary shadow-2xs transition-colors hover:border-primary-border hover:bg-primary-soft hover:text-primary"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Tablet Spotlight Cards (phones keep the hero distraction-free) */}
          {spotlightScholarships.length > 0 && (
            <div className="mt-8 hidden grid-cols-2 gap-3 text-start md:grid xl:hidden">
              {spotlightScholarships.slice(0, 2).map((scholarship) => (
                <ScholarshipSpotlight key={scholarship.id} scholarship={scholarship} {...spotlightProps} />
              ))}
            </div>
          )}

          {/* Telemetry Metrics Bar */}
          <div className="mx-auto mt-9 grid max-w-4xl grid-cols-2 gap-3 border-t border-border/70 pt-7 sm:mt-11 sm:gap-4 lg:grid-cols-4">
            <div className="card-surface flex flex-col items-center rounded-2xl p-3.5 text-center sm:p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="text-2xl font-semibold tabular-nums text-text-primary sm:text-3xl">
                {stats.scholarshipCount}
              </div>
              <div className="mt-1 text-xs font-medium leading-snug text-text-secondary">
                {t.home.verifiedGrants}
              </div>
            </div>

            <div className="card-surface flex flex-col items-center rounded-2xl p-3.5 text-center sm:p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-2xl font-semibold tabular-nums text-text-primary sm:text-3xl">
                {stats.countryCount}
              </div>
              <div className="mt-1 text-xs font-medium leading-snug text-text-secondary">
                {t.home.hostCountries}
              </div>
            </div>

            <div className="card-surface flex flex-col items-center rounded-2xl p-3.5 text-center sm:p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-2xl font-semibold tabular-nums text-text-primary sm:text-3xl">100%</div>
              <div className="mt-1 text-xs font-medium leading-snug text-text-secondary">
                {t.home.officialLinks}
              </div>
            </div>

            <div className="card-surface flex flex-col items-center rounded-2xl p-3.5 text-center sm:p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-2xl font-semibold tabular-nums text-text-primary sm:text-3xl">$0</div>
              <div className="mt-1 text-xs font-medium leading-snug text-text-secondary">
                {t.home.zeroFees}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
