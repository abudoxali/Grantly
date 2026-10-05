'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { addBookmark, removeBookmark, isBookmarked } from '@/lib/db/repository';
import type { Scholarship } from '@/lib/supabase/types';
import { formatDate, formatStipend, formatDegreeLevel, getDaysRemaining } from '@/lib/utils';
import {
  Calendar,
  Building,
  Bookmark,
  Coins,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

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
  const description = isAr
    ? scholarship.short_description_ar || scholarship.description_ar
    : scholarship.short_description_en || scholarship.description_en;
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

  const deadlineInfo = scholarship.deadline
    ? getDaysRemaining(scholarship.deadline)
    : null;

  return (
    <article
      className={cn(
        'card-surface card-interactive group flex h-full min-w-0 flex-col overflow-hidden',
        className
      )}
    >
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <Link
          href={`/${locale}/scholarships/${scholarship.slug}`}
          className="min-w-0 flex-1 rounded-md focus-visible:outline-none"
        >
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-text-primary transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>

        {/* Bookmark Action */}
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={saving}
          aria-pressed={isCurrentSaved}
          aria-busy={saving}
          className={cn(
            'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border transition-colors focus:outline-hidden',
            saved
              ? 'border-primary-border bg-primary-soft text-primary'
              : 'border-border bg-background text-muted hover:border-primary-border hover:bg-primary-soft hover:text-primary'
          )}
          title={saved ? t.common.removeSaved : t.common.saveScholarship}
          aria-label={saved ? t.common.removeSaved : t.common.saveScholarship}
        >
          <Bookmark className={cn('h-4 w-4', saved && 'fill-primary')} />
        </button>
      </div>

      {/* Country with Flag */}
      {(providerName || countryName) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-5 text-xs font-medium text-text-secondary">
          {providerName && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate">{providerName}</span>
            </span>
          )}
          {scholarship.country && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-sm leading-none">{scholarship.country.flag}</span>
              <span>{countryName}</span>
            </span>
          )}
        </div>
      )}

      {/* Funding Badge */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-5">
        <Badge
          variant={
            scholarship.funding_type === 'Fully Funded'
              ? 'success'
              : scholarship.funding_type === 'Partial Funding'
                ? 'amber'
                : 'sky'
          }
          size="sm"
        >
          {scholarship.funding_type === 'Fully Funded'
            ? t.common.fullyFunded
            : scholarship.funding_type === 'Partial Funding'
              ? t.common.partialFunding
              : t.common.tuitionOnly}
        </Badge>
        {scholarship.stipend_amount && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Coins className="h-3.5 w-3.5 shrink-0" />
            {formatStipend(scholarship.stipend_amount, locale)}
          </span>
        )}
      </div>

      {/* Degree Levels & Supporting Details */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        {/* Degrees & Footer Details */}
        <div className="flex flex-wrap gap-1.5">
          {scholarship.degree_levels.map((level) => (
            <span
              key={level}
              className="rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-text-secondary"
            >
              {formatDegreeLevel(level, locale)}
            </span>
          ))}
        </div>

        {description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        )}

        {/* Final Details and Apply Actions */}
        <div className="mt-auto pt-4">
          {/* Deadline / Status */}
          <div className="mb-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs">
            <div className="flex min-w-0 items-center gap-1.5 text-text-secondary">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted" />
              {scholarship.deadline ? (
                <span className="truncate">
                  {formatDate(scholarship.deadline, locale)}
                  {deadlineInfo && deadlineInfo.days > 0 && deadlineInfo.days <= 60 && (
                    <span className="ms-1.5 font-semibold text-warning-ink">
                      ({deadlineInfo.days} {t.common.daysLeft})
                    </span>
                  )}
                </span>
              ) : (
                <Badge status={scholarship.status} size="sm">
                  {scholarship.status === 'Open'
                    ? t.common.open
                    : scholarship.status === 'Opening Soon'
                      ? t.common.openingSoon
                      : t.common.closed}
                </Badge>
              )}
            </div>
            <Link
              href={`/${locale}/scholarships/${scholarship.slug}`}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
            >
              <span>{t.common.viewDetails}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>

          <a
            href={scholarship.official_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.common.applyOfficial}: ${title}`}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active sm:text-sm"
          >
            <span>{t.common.applyOfficial}</span>
            <ExternalLink className="h-4 w-4 shrink-0 rtl:rotate-180" />
          </a>
        </div>
      </div>
    </article>
  );
}
