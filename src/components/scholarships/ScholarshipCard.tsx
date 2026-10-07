'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { addBookmark, removeBookmark, isBookmarked } from '@/lib/db/repository';
import type { Scholarship } from '@/lib/supabase/types';
import {
  formatDate,
  formatDegreeLevel,
  getScholarshipCoverImage,
  cn,
} from '@/lib/utils';
import {
  Calendar,
  Bookmark,
  ArrowRight,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  className?: string;
  onBookmarkChange?: () => void;
}

export function ScholarshipCard({
  scholarship,
  className,
  onBookmarkChange,
}: ScholarshipCardProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const isAr = locale === 'ar';

  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    if (user?.id) {
      isBookmarked(user.id, scholarship.id).then((val) => {
        if (!ignore) setSaved(val);
      });
    }
    return () => {
      ignore = true;
    };
  }, [user?.id, scholarship.id]);

  const isCurrentSaved = !!user && saved;

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setSaving(true);
    if (isCurrentSaved) {
      await removeBookmark(user.id, scholarship.id);
      setSaved(false);
    } else {
      await addBookmark(user.id, scholarship.id);
      setSaved(true);
    }
    setSaving(false);
    onBookmarkChange?.();
  };

  const title = isAr ? scholarship.title_ar : scholarship.title_en;
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
  const flag = scholarship.country?.flag || '';

  const coverImage = getScholarshipCoverImage(scholarship);

  // Formatted degree
  let degreeText = '';
  if (scholarship.degree_levels && scholarship.degree_levels.length > 0) {
    if (scholarship.degree_levels.length > 2) {
      degreeText = isAr ? 'مستويات متعددة' : 'Various Levels';
    } else {
      degreeText = scholarship.degree_levels
        .map((lvl) => formatDegreeLevel(lvl, locale))
        .join(', ');
    }
  } else {
    degreeText = isAr ? 'جميع المستويات' : 'All Levels';
  }

  // Formatted primary field
  let fieldText = '';
  if (scholarship.fields && scholarship.fields.length > 0) {
    fieldText = isAr ? scholarship.fields[0].name_ar : scholarship.fields[0].name_en;
  } else {
    fieldText = isAr ? 'كافة التخصصات' : 'All Fields';
  }

  const detailUrl = `/${locale}/scholarships/${scholarship.slug}`;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-rose-100/70 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-border',
        className
      )}
    >
      {/* Card Visual Header / Photo */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Bookmark Button (top-start) */}
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={saving}
          aria-pressed={isCurrentSaved}
          aria-busy={saving}
          className={cn(
            'absolute top-3 start-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-xs',
            saved
              ? 'bg-white text-primary'
              : 'bg-white/85 text-neutral-600 hover:bg-white hover:text-primary'
          )}
          title={saved ? t.common.removeSaved : t.common.saveScholarship}
          aria-label={saved ? t.common.removeSaved : t.common.saveScholarship}
        >
          <Bookmark className={cn('h-4 w-4', saved && 'fill-primary')} />
        </button>

        {/* Funding Badge (top-end) */}
        <div className="absolute top-3 end-3 z-10">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-xs backdrop-blur-md',
              scholarship.funding_type === 'Fully Funded'
                ? 'bg-white/95 text-primary border border-rose-200/60'
                : scholarship.funding_type === 'Partial Funding'
                ? 'bg-white/95 text-amber-700 border border-amber-200/60'
                : 'bg-white/95 text-sky-700 border border-sky-200/60'
            )}
          >
            {scholarship.funding_type === 'Fully Funded'
              ? t.common.fullyFunded
              : scholarship.funding_type === 'Partial Funding'
              ? t.common.partialFunding
              : t.common.tuitionOnly}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={detailUrl}
          className="group/title focus-visible:outline-none"
        >
          <h3 className="line-clamp-1 font-sans text-base sm:text-lg font-bold text-text-primary transition-colors group-hover/title:text-primary">
            {title}
          </h3>
        </Link>

        {/* Provider & Country Row */}
        {(providerName || countryName) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            {flag && <span className="text-sm leading-none shrink-0">{flag}</span>}
            <span className="truncate">{providerName || countryName}</span>
          </div>
        )}

        {/* Chips row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{degreeText}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{fieldText}</span>
          </span>
        </div>

        {/* Bottom row: Deadline + Circular Action Button */}
        <div className="mt-auto pt-4 border-t border-border/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Calendar className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>
              {scholarship.deadline
                ? formatDate(scholarship.deadline, locale)
                : t.common.open}
            </span>
          </div>

          <Link
            href={detailUrl}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors hover:bg-primary hover:text-white"
            aria-label={`${t.common.viewDetails}: ${title}`}
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}
