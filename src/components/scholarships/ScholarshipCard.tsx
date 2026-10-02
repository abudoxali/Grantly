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
    <div
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden',
        className
      )}
    >
      {/* Top Meta Bar */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Country with Flag */}
          {scholarship.country && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 text-xs font-semibold text-slate-700">
              <span className="text-sm leading-none">{scholarship.country.flag}</span>
              <span>{countryName}</span>
            </span>
          )}

          {/* Funding Badge */}
          <Badge
            variant={
              scholarship.funding_type === 'Fully Funded'
                ? 'emerald'
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
        </div>

        {/* Bookmark Action */}
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={saving}
          className={cn(
            'p-2 rounded-xl border transition-all cursor-pointer select-none shrink-0 focus:outline-hidden',
            saved
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          )}
          title={saved ? t.common.removeSaved : t.common.saveScholarship}
          aria-label={saved ? t.common.removeSaved : t.common.saveScholarship}
        >
          <Bookmark className={cn('w-4 h-4', saved && 'fill-emerald-600')} />
        </button>
      </div>

      {/* Main Title & Provider */}
      <div className="px-5 flex-1 flex flex-col">
        <Link
          href={`/${locale}/scholarships/${scholarship.slug}`}
          className="group-hover:text-emerald-700 transition-colors"
        >
          <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
            {title}
          </h3>
        </Link>

        {providerName && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium line-clamp-1">
            <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>{providerName}</span>
          </div>
        )}

        {description && (
          <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Stipend Callout if available */}
        {scholarship.stipend_amount && (
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs font-bold text-emerald-800 self-start">
            <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{formatStipend(scholarship.stipend_amount, locale)}</span>
          </div>
        )}
      </div>

      {/* Degrees & Footer Details */}
      <div className="px-5 pt-3 pb-4 mt-auto">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {scholarship.degree_levels.map((lvl) => (
            <span
              key={lvl}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
            >
              {formatDegreeLevel(lvl, locale)}
            </span>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {/* Deadline / Status */}
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {scholarship.deadline ? (
              <span>
                {formatDate(scholarship.deadline, locale)}
                {deadlineInfo && deadlineInfo.days > 0 && deadlineInfo.days <= 60 && (
                  <span className="ms-1.5 font-bold text-amber-700">
                    ({deadlineInfo.days} {t.common.daysLeft})
                  </span>
                )}
              </span>
            ) : (
              <span>{scholarship.status}</span>
            )}
          </div>

          <Link
            href={`/${locale}/scholarships/${scholarship.slug}`}
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          >
            <span>{t.common.viewDetails}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
