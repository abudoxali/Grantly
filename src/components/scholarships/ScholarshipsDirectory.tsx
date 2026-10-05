'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import type {
  Scholarship,
  Country,
  Field,
  DegreeLevel,
  FundingType,
  ScholarshipStatus,
} from '@/lib/supabase/types';
import { ScholarshipCard } from './ScholarshipCard';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatDegreeLevel } from '@/lib/utils';

type SortOption = 'deadline-asc' | 'deadline-desc' | 'popular' | 'newest';

interface ScholarshipsDirectoryProps {
  initialScholarships: Scholarship[];
  countries: Country[];
  fields: Field[];
}

export function ScholarshipsDirectory({
  initialScholarships,
  countries,
  fields,
}: ScholarshipsDirectoryProps) {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const isAr = locale === 'ar';

  const [query, setQuery] = React.useState(searchParams.get('q') || '');
  const [selectedDegrees, setSelectedDegrees] = React.useState<DegreeLevel[]>(() => {
    const d = searchParams.get('degree');
    return d ? [d as DegreeLevel] : [];
  });
  const [selectedFunding, setSelectedFunding] = React.useState<FundingType[]>(() => {
    const f = searchParams.get('funding');
    return f ? [f as FundingType] : [];
  });
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>(() => {
    const c = searchParams.get('country');
    return c ? [c] : [];
  });
  const [selectedFields, setSelectedFields] = React.useState<string[]>(() => {
    const f = searchParams.get('field');
    return f ? [f] : [];
  });
  const [selectedStatuses, setSelectedStatuses] = React.useState<ScholarshipStatus[]>(() => {
    const s = searchParams.get('status');
    return s ? [s as ScholarshipStatus] : [];
  });
  const [sortBy, setSortBy] = React.useState<'deadline-asc' | 'deadline-desc' | 'popular' | 'newest'>('popular');

  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const mobileFilterButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileFilterPanelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!mobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingInlineEnd = document.body.style.paddingInlineEnd;
    const trigger = mobileFilterButtonRef.current;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileFiltersOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !mobileFilterPanelRef.current) return;

      const focusable = Array.from(
        mobileFilterPanelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingInlineEnd = `${scrollbarWidth}px`;
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => {
      mobileFilterPanelRef.current?.querySelector<HTMLElement>('button, input')?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingInlineEnd = previousPaddingInlineEnd;
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [mobileFiltersOpen]);

  // Available options
  const degreeOptions: DegreeLevel[] = ['Bachelor', 'Master', 'PhD', 'Postdoctoral'];
  const fundingOptions: FundingType[] = ['Fully Funded', 'Partial Funding', 'Tuition Only'];
  const statusOptions: ScholarshipStatus[] = ['Open', 'Opening Soon'];

  // Filter calculation
  const filteredScholarships = React.useMemo(() => {
    return initialScholarships.filter((s) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const titleEn = s.title_en.toLowerCase();
        const titleAr = s.title_ar.toLowerCase();
        const countryEn = s.country?.name_en.toLowerCase() || '';
        const countryAr = s.country?.name_ar.toLowerCase() || '';
        const providerEn = s.provider?.name_en.toLowerCase() || '';
        const providerAr = s.provider?.name_ar.toLowerCase() || '';
        const descEn = (s.short_description_en || '').toLowerCase();
        const descAr = (s.short_description_ar || '').toLowerCase();

        const matches =
          titleEn.includes(q) ||
          titleAr.includes(q) ||
          countryEn.includes(q) ||
          countryAr.includes(q) ||
          providerEn.includes(q) ||
          providerAr.includes(q) ||
          descEn.includes(q) ||
          descAr.includes(q);

        if (!matches) return false;
      }

      // Degree filter
      if (selectedDegrees.length > 0) {
        const hasDegree = s.degree_levels.some((d) => selectedDegrees.includes(d));
        if (!hasDegree) return false;
      }

      // Funding filter
      if (selectedFunding.length > 0) {
        if (!selectedFunding.includes(s.funding_type)) return false;
      }

      // Country filter
      if (selectedCountries.length > 0) {
        if (!s.country || !selectedCountries.includes(s.country.name_en)) return false;
      }

      // Field filter
      if (selectedFields.length > 0) {
        const hasField = s.fields?.some(
          (f) => selectedFields.includes(f.name_en) || selectedFields.includes(f.slug)
        );
        if (!hasField) return false;
      }

      // Status filter
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(s.status)) return false;
      }

      return true;
    });
  }, [
    initialScholarships,
    query,
    selectedDegrees,
    selectedFunding,
    selectedCountries,
    selectedFields,
    selectedStatuses,
  ]);

  // Sort calculation
  const sortedScholarships = React.useMemo(() => {
    const list = [...filteredScholarships];
    switch (sortBy) {
      case 'deadline-asc':
        return list.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
      case 'deadline-desc':
        return list.sort((a, b) => {
          if (!a.deadline) return -1;
          if (!b.deadline) return 1;
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        });
      case 'newest':
        return list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'popular':
      default:
        return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [filteredScholarships, sortBy]);

  const hasActiveFilters =
    query.trim() !== '' ||
    selectedDegrees.length > 0 ||
    selectedFunding.length > 0 ||
    selectedCountries.length > 0 ||
    selectedFields.length > 0 ||
    selectedStatuses.length > 0;

  const resetAllFilters = () => {
    setQuery('');
    setSelectedDegrees([]);
    setSelectedFunding([]);
    setSelectedCountries([]);
    setSelectedFields([]);
    setSelectedStatuses([]);
    setSortBy('popular');
  };

  const toggleDegree = (deg: DegreeLevel) => {
    setSelectedDegrees((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg]
    );
  };

  const toggleFunding = (fund: FundingType) => {
    setSelectedFunding((prev) =>
      prev.includes(fund) ? prev.filter((f) => f !== fund) : [...prev, fund]
    );
  };

  const toggleCountry = (cName: string) => {
    setSelectedCountries((prev) =>
      prev.includes(cName) ? prev.filter((c) => c !== cName) : [...prev, cName]
    );
  };

  const toggleField = (fName: string) => {
    setSelectedFields((prev) =>
      prev.includes(fName) ? prev.filter((f) => f !== fName) : [...prev, fName]
    );
  };

  const toggleStatus = (st: ScholarshipStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title Section */}
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {t.scholarships.directoryTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
            {t.scholarships.directorySubtitle}
          </p>
        </div>

        {/* Top Controls: Search Input + Sort + Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Search Box */}
          <div className="relative min-w-0 flex-1">
            <label htmlFor="scholarship-directory-search" className="sr-only">
              {t.scholarships.searchPlaceholder}
            </label>
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="scholarship-directory-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.scholarships.searchPlaceholder}
              className="min-h-11 w-full rounded-xl border border-border bg-background py-2 ps-10 pe-11 text-sm text-text-primary placeholder:text-muted focus:bg-white focus:ring-2 focus:ring-primary/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={isAr ? 'إزالة نص البحث' : 'Clear search'}
                className="absolute end-1 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              ref={mobileFilterButtonRef}
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="mobile-scholarship-filters"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-primary-soft hover:text-primary lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>{t.common.filters}</span>
              {hasActiveFilters && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
              <span className="hidden sm:inline">{t.scholarships.sortBy}:</span>
              <select
                aria-label={t.scholarships.sortBy}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="min-h-11 max-w-[65vw] cursor-pointer rounded-xl border border-border bg-white px-3 text-xs font-semibold text-text-primary focus:border-primary sm:max-w-none"
              >
                <option value="popular">{t.scholarships.sortPopular}</option>
                <option value="deadline-asc">{t.scholarships.sortDeadlineAsc}</option>
                <option value="deadline-desc">{t.scholarships.sortDeadlineDesc}</option>
                <option value="newest">{t.scholarships.sortNewest}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="font-semibold text-slate-500">{t.scholarships.activeFilters}</span>
            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium">
                <span>&quot;{query}&quot;</span>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={isAr ? 'إزالة نص البحث' : 'Remove search query'}
                  className="ms-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDegrees.map((deg) => (
              <span
                key={deg}
                className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-primary-border bg-primary-soft px-2.5 py-1 text-primary font-medium"
              >
                <span>{formatDegreeLevel(deg, locale)}</span>
                <button
                  type="button"
                  onClick={() => toggleDegree(deg)}
                  aria-label={isAr ? 'إزالة تصفية المرحلة الدراسية' : 'Remove degree filter'}
                  className="ms-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedFunding.map((fund) => (
              <span
                key={fund}
                className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-primary-border bg-primary-soft px-2.5 py-1 text-primary font-medium"
              >
                <span>
                  {fund === 'Fully Funded'
                    ? t.common.fullyFunded
                    : fund === 'Partial Funding'
                      ? t.common.partialFunding
                      : t.common.tuitionOnly}
                </span>
                <button
                  type="button"
                  onClick={() => toggleFunding(fund)}
                  aria-label={isAr ? 'إزالة تصفية التمويل' : 'Remove funding filter'}
                  className="ms-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedCountries.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium"
              >
                <span>
                  {isAr ? countries.find((country) => country.name_en === c)?.name_ar || c : c}
                </span>
                <button
                  type="button"
                  onClick={() => toggleCountry(c)}
                  aria-label={isAr ? 'إزالة تصفية الدولة' : 'Remove country filter'}
                  className="ms-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedStatuses.map((st) => (
              <span
                key={st}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium"
              >
                <span>{st === 'Open' ? t.common.open : t.common.openingSoon}</span>
                <button
                  type="button"
                  onClick={() => toggleStatus(st)}
                  aria-label={isAr ? 'إزالة تصفية الحالة' : 'Remove status filter'}
                  className="ms-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
            >
              {t.scholarships.clearAll}
            </button>
          </div>
        )}

        {/* Main Content Layout: Sidebar Filters + Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">{t.common.filters}</span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs text-slate-500 hover:text-primary flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.scholarships.clearAll}</span>
                  </button>
                )}
              </div>

              {/* Degrees */}
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByDegree}
                </h4>
                <div className="space-y-1">
                  {degreeOptions.map((deg) => {
                    const checked = selectedDegrees.includes(deg);
                    return (
                      <label
                        key={deg}
                        className="flex min-h-11 cursor-pointer select-none items-center gap-2.5 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDegree(deg)}
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <span>
                          {deg === 'Master'
                            ? isAr
                              ? 'ماجستير'
                              : 'Master'
                            : deg === 'PhD'
                              ? isAr
                                ? 'دكتوراه'
                                : 'PhD'
                              : deg === 'Bachelor'
                                ? isAr
                                  ? 'بكالوريوس'
                                  : 'Bachelor'
                                : isAr
                                  ? 'أبحاث ما بعد الدكتوراه'
                                  : 'Postdoc'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Funding Type */}
              <div className="border-t border-border/70 pt-4">
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByFunding}
                </h4>
                <div className="space-y-1">
                  {fundingOptions.map((fund) => {
                    const checked = selectedFunding.includes(fund);
                    return (
                      <label
                        key={fund}
                        className="flex min-h-11 cursor-pointer select-none items-center gap-2.5 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFunding(fund)}
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <span>
                          {fund === 'Fully Funded'
                            ? t.common.fullyFunded
                            : fund === 'Partial Funding'
                              ? t.common.partialFunding
                              : t.common.tuitionOnly}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Countries */}
              <div className="border-t border-border/70 pt-4">
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByCountry}
                </h4>
                <div className="max-h-52 space-y-1 overflow-y-auto pe-1">
                  {countries.map((c) => {
                    const checked = selectedCountries.includes(c.name_en);
                    const name = isAr ? c.name_ar : c.name_en;
                    return (
                      <label
                        key={c.id}
                        className="flex min-h-11 cursor-pointer select-none items-center gap-2.5 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCountry(c.name_en)}
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <span className="truncate">
                          {c.flag} {name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Fields of Study */}
              <div className="border-t border-border/70 pt-4">
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {isAr ? 'التخصص الأكاديمي' : 'Field of Study'}
                </h4>
                <div className="max-h-48 space-y-1 overflow-y-auto pe-1">
                  {fields.map((f) => {
                    const checked = selectedFields.includes(f.name_en);
                    const name = isAr ? f.name_ar : f.name_en;
                    return (
                      <label
                        key={f.id}
                        className="flex min-h-11 cursor-pointer select-none items-center gap-2.5 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleField(f.name_en)}
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <span className="truncate">{name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Application Status */}
              <div className="border-t border-border/70 pt-4">
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByStatus}
                </h4>
                <div className="space-y-1">
                  {statusOptions.map((status) => {
                    const checked = selectedStatuses.includes(status);
                    return (
                      <label
                        key={status}
                        className="flex min-h-11 cursor-pointer select-none items-center gap-2.5 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStatus(status)}
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <span>{status === 'Open' ? t.common.open : t.common.openingSoon}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Cards Grid */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between text-xs font-medium text-text-secondary">
              <span>
                <strong className="font-semibold text-text-primary">
                  {sortedScholarships.length}
                </strong>{' '}
                {t.scholarships.resultsFound}
              </span>
            </div>

            {/* Empty State */}
            {sortedScholarships.length === 0 ? (
              <EmptyState
                icon={Search}
                title={
                  initialScholarships.length === 0
                    ? isAr ? 'المنح الدراسية قيد الإعداد' : 'The scholarship directory is being prepared'
                    : t.scholarships.emptyTitle
                }
                description={
                  initialScholarships.length === 0
                    ? isAr ? 'ستظهر المنح هنا بعد التحقق من شروطها وروابط التقديم الرسمية.' : 'Verified scholarships will appear here once their requirements and official application links are reviewed.'
                    : t.scholarships.emptyDesc
                }
                action={
                  initialScholarships.length === 0 ? (
                    <Link
                      href={`/${locale}/guides`}
                      className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                    >
                      {isAr ? 'تصفّح أدلة التقديم' : 'Explore application guides'}
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" onClick={resetAllFilters}>
                      {t.common.resetFilters}
                    </Button>
                  )
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sortedScholarships.map((sch) => (
                  <ScholarshipCard key={sch.id} scholarship={sch} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Modal for Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-deep-plum/40 backdrop-blur-sm"
            aria-label={isAr ? 'إغلاق خيارات التصفية' : 'Close filters'}
          />
          <div
            ref={mobileFilterPanelRef}
            id="mobile-scholarship-filters"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-heading"
            className="mobile-drawer-enter absolute inset-x-0 bottom-0 z-10 flex max-h-[90dvh] flex-col rounded-t-3xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id="mobile-filter-heading" className="text-base font-semibold text-text-primary">
                {t.common.filters}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-primary-soft hover:text-primary"
                aria-label={isAr ? 'إغلاق خيارات التصفية' : 'Close filters'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Degrees */}
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByDegree}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {degreeOptions.map((degree) => {
                    const checked = selectedDegrees.includes(degree);
                    return (
                      <button
                        key={degree}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleDegree(degree)}
                        className={cn(
                          'flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-sm font-medium transition-colors',
                          checked
                            ? 'border-primary-border bg-primary-soft text-primary'
                            : 'border-border bg-white text-text-secondary hover:bg-background'
                        )}
                      >
                        <span>{formatDegreeLevel(degree, locale)}</span>
                        {checked && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Funding Type */}
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByFunding}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {fundingOptions.map((funding) => {
                    const checked = selectedFunding.includes(funding);
                    return (
                      <button
                        key={funding}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleFunding(funding)}
                        className={cn(
                          'flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-sm font-medium transition-colors',
                          checked
                            ? 'border-primary-border bg-primary-soft text-primary'
                            : 'border-border bg-white text-text-secondary hover:bg-background'
                        )}
                      >
                        <span>
                          {funding === 'Fully Funded'
                            ? t.common.fullyFunded
                            : funding === 'Partial Funding'
                              ? t.common.partialFunding
                              : t.common.tuitionOnly}
                        </span>
                        {checked && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Countries */}
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByCountry}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {countries.map((country) => {
                    const checked = selectedCountries.includes(country.name_en);
                    const name = isAr ? country.name_ar : country.name_en;
                    return (
                      <button
                        key={country.id}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleCountry(country.name_en)}
                        className={cn(
                          'flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-sm font-medium transition-colors',
                          checked
                            ? 'border-primary-border bg-primary-soft text-primary'
                            : 'border-border bg-white text-text-secondary hover:bg-background'
                        )}
                      >
                        <span className="truncate">{country.flag} {name}</span>
                        {checked && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fields of Study */}
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {isAr ? 'التخصص الأكاديمي' : 'Field of Study'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {fields.map((field) => {
                    const checked = selectedFields.includes(field.name_en);
                    const name = isAr ? field.name_ar : field.name_en;
                    return (
                      <button
                        key={field.id}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleField(field.name_en)}
                        className={cn(
                          'flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-sm font-medium transition-colors',
                          checked
                            ? 'border-primary-border bg-primary-soft text-primary'
                            : 'border-border bg-white text-text-secondary hover:bg-background'
                        )}
                      >
                        <span className="truncate">{name}</span>
                        {checked && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.scholarships.filterByStatus}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((status) => {
                    const checked = selectedStatuses.includes(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleStatus(status)}
                        className={cn(
                          'flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-sm font-medium transition-colors',
                          checked
                            ? 'border-primary-border bg-primary-soft text-primary'
                            : 'border-border bg-white text-text-secondary hover:bg-background'
                        )}
                      >
                        <span>{status === 'Open' ? t.common.open : t.common.openingSoon}</span>
                        {checked && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center gap-3 border-t border-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={resetAllFilters}
              >
                {t.scholarships.clearAll}
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => setMobileFiltersOpen(false)}
              >
                {t.common.apply} ({sortedScholarships.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
