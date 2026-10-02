'use client';

import * as React from 'react';
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
import { cn } from '@/lib/utils';

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
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-sans tracking-tight">
            {t.scholarships.directoryTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
            {t.scholarships.directorySubtitle}
          </p>
        </div>

        {/* Top Controls: Search Input + Sort + Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.scholarships.searchPlaceholder}
              className="w-full ps-10 pe-9 py-2 rounded-xl text-sm bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>{t.common.filters}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
              <span className="hidden sm:inline">{t.scholarships.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
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
                  className="hover:text-rose-600 ms-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDegrees.map((deg) => (
              <span
                key={deg}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
              >
                <span>{deg}</span>
                <button
                  type="button"
                  onClick={() => toggleDegree(deg)}
                  className="hover:text-rose-600 ms-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedFunding.map((fund) => (
              <span
                key={fund}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
              >
                <span>{fund}</span>
                <button
                  type="button"
                  onClick={() => toggleFunding(fund)}
                  className="hover:text-rose-600 ms-1"
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
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => toggleCountry(c)}
                  className="hover:text-rose-600 ms-1"
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
                <span>{st}</span>
                <button
                  type="button"
                  onClick={() => toggleStatus(st)}
                  className="hover:text-rose-600 ms-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:underline ms-2"
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
                    className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.scholarships.clearAll}</span>
                  </button>
                )}
              </div>

              {/* Degrees */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {t.scholarships.filterByDegree}
                </h4>
                <div className="space-y-1.5">
                  {degreeOptions.map((deg) => {
                    const checked = selectedDegrees.includes(deg);
                    return (
                      <label
                        key={deg}
                        onClick={() => toggleDegree(deg)}
                        className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer select-none py-1"
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                            checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
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
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {t.scholarships.filterByFunding}
                </h4>
                <div className="space-y-1.5">
                  {fundingOptions.map((fund) => {
                    const checked = selectedFunding.includes(fund);
                    return (
                      <label
                        key={fund}
                        onClick={() => toggleFunding(fund)}
                        className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer select-none py-1"
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                            checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
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
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {t.scholarships.filterByCountry}
                </h4>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pe-1">
                  {countries.map((c) => {
                    const checked = selectedCountries.includes(c.name_en);
                    const name = isAr ? c.name_ar : c.name_en;
                    return (
                      <label
                        key={c.id}
                        onClick={() => toggleCountry(c.name_en)}
                        className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer select-none py-1"
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0',
                            checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">
                          {c.flag} {name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Fields of Study */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {isAr ? 'التخصص الأكاديمي' : 'Field of Study'}
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pe-1">
                  {fields.map((f) => {
                    const checked = selectedFields.includes(f.name_en);
                    const name = isAr ? f.name_ar : f.name_en;
                    return (
                      <label
                        key={f.id}
                        onClick={() => toggleField(f.name_en)}
                        className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer select-none py-1"
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0',
                            checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Application Status */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {t.scholarships.filterByStatus}
                </h4>
                <div className="space-y-1.5">
                  {statusOptions.map((st) => {
                    const checked = selectedStatuses.includes(st);
                    return (
                      <label
                        key={st}
                        onClick={() => toggleStatus(st)}
                        className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer select-none py-1"
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                            checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>
                          {st === 'Open' ? t.common.open : t.common.openingSoon}
                        </span>
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
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                <strong className="text-slate-900 font-bold">
                  {sortedScholarships.length}
                </strong>{' '}
                {t.scholarships.resultsFound}
              </span>
            </div>

            {/* Empty State */}
            {sortedScholarships.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t.scholarships.emptyTitle}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  {t.scholarships.emptyDesc}
                </p>
                <div className="mt-6">
                  <Button variant="outline" size="sm" onClick={resetAllFilters}>
                    {t.common.resetFilters}
                  </Button>
                </div>
              </div>
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
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">{t.common.filters}</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Degrees */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {t.scholarships.filterByDegree}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {degreeOptions.map((deg) => {
                    const checked = selectedDegrees.includes(deg);
                    return (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => toggleDegree(deg)}
                        className={cn(
                          'p-2.5 rounded-xl border text-xs font-medium text-start transition-colors',
                          checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        )}
                      >
                        {deg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Funding Type */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {t.scholarships.filterByFunding}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {fundingOptions.map((fund) => {
                    const checked = selectedFunding.includes(fund);
                    return (
                      <button
                        key={fund}
                        type="button"
                        onClick={() => toggleFunding(fund)}
                        className={cn(
                          'p-2.5 rounded-xl border text-xs font-medium text-start transition-colors',
                          checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        )}
                      >
                        {fund}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Countries */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {t.scholarships.filterByCountry}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {countries.map((c) => {
                    const checked = selectedCountries.includes(c.name_en);
                    const name = isAr ? c.name_ar : c.name_en;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCountry(c.name_en)}
                        className={cn(
                          'p-2 rounded-xl border text-xs font-medium text-start truncate transition-colors',
                          checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        )}
                      >
                        {c.flag} {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fields of Study */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {isAr ? 'التخصص الأكاديمي' : 'Field of Study'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {fields.map((f) => {
                    const checked = selectedFields.includes(f.name_en);
                    const name = isAr ? f.name_ar : f.name_en;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleField(f.name_en)}
                        className={cn(
                          'p-2 rounded-xl border text-xs font-medium text-start truncate transition-colors',
                          checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        )}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center gap-3">
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
