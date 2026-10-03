'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeroGeometricBackground } from './HeroGeometricBackground';

interface HomeHeroProps {
  stats: {
    scholarshipCount: number;
    countryCount: number;
  };
}

export function HomeHero({ stats }: HomeHeroProps) {
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 border-b border-slate-200/80 pt-12 pb-16 lg:pt-16 lg:pb-24">
      {/* Architectural & Geometric Motion Background */}
      <HeroGeometricBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Floating Interactive Scholarship Cards (Desktop Flanks) */}
        {/* Left Floating Card: DAAD Germany */}
        <div className="hidden xl:block absolute top-16 -start-4 w-72 pointer-events-auto">
          <Link
            href={`/${locale}/scholarships/daad-helmut-schmidt`}
            className="group block p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 animate-float-slow"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇩🇪</span>
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  DAAD Helmut-Schmidt
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200/70">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{isAr ? 'موثقة' : 'Verified'}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-500 line-clamp-1 mb-2.5">
              {isAr ? 'ألمانيا • تمويل حكومي كامل' : 'Germany • Full Government Grant'}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span className="font-semibold text-emerald-800">
                {isAr ? '€934 / شهرياً + السكن' : '€934 / mo + Housing'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5 group-hover:text-emerald-600 transition-colors">
                <span>{isAr ? 'عرض' : 'View'}</span>
                <ExternalLink className="w-2.5 h-2.5 rtl:rotate-180" />
              </span>
            </div>
          </Link>
        </div>

        {/* Right Floating Card: Chevening UK */}
        <div className="hidden xl:block absolute top-28 -end-4 w-72 pointer-events-auto">
          <Link
            href={`/${locale}/scholarships/chevening-uk`}
            className="group block p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 animate-float-reverse"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇬🇧</span>
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Chevening UK
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-[10px] font-bold text-amber-700 border border-amber-200/70">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{isAr ? 'ممولة بالكامل' : '100% Funded'}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-500 line-clamp-1 mb-2.5">
              {isAr ? 'المملكة المتحدة • ماجستير معتمد' : 'United Kingdom • Master Degree'}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span className="font-semibold text-slate-800">
                {isAr ? 'رسوم دراسية كاملة + طيران' : 'Full Tuition + Flights'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5 group-hover:text-emerald-600 transition-colors">
                <span>{isAr ? 'عرض' : 'View'}</span>
                <ExternalLink className="w-2.5 h-2.5 rtl:rotate-180" />
              </span>
            </div>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Top Live Verification Beacon Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-emerald-300/80 text-xs font-bold text-emerald-800 mb-6 shadow-xs backdrop-blur-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
            </span>
            <span className="tracking-wide">{t.home.badge}</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-semibold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحقق مباشر ومضمون' : 'DIRECT VERIFIED FEED'}</span>
            </span>
          </div>

          {/* Main Headline with Architectural Highlight */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 font-sans leading-[1.2] text-balance">
            {t.home.headlineStart}{' '}
            <span className="relative inline-block mt-1 sm:mt-2">
              <span className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 bg-clip-text text-transparent font-black">
                {t.home.headlineHighlight}
              </span>
              {/* Precision architectural underline with central glowing coordinate beacon */}
              <span className="absolute -bottom-1.5 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full" />
              <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.9)] ring-2 ring-emerald-200" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.home.subheadline}
          </p>

          {/* Tech-Enhanced Interactive Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-2xl mx-auto relative flex flex-col sm:flex-row items-center gap-2 p-2 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-slate-200/90 hover:border-emerald-500/50 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/15 shadow-xl shadow-slate-200/70 transition-all duration-300 group"
          >
            <div className="relative flex-1 w-full flex items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center ms-1 shrink-0 border border-emerald-100/80 transition-colors group-focus-within:bg-emerald-600 group-focus-within:text-white">
                <Search className="w-5 h-5 transition-transform group-focus-within:scale-110" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full py-3 px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent font-medium"
              />
              <div className="hidden sm:flex items-center me-2 pointer-events-none select-none">
                <kbd className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-400 bg-slate-100 rounded-md border border-slate-200/80">
                  {isAr ? '↵ بحث' : '↵ Enter'}
                </kbd>
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto px-7 h-12 text-sm font-bold shrink-0 shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 transition-all"
              rightIcon={
                <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              }
            >
              {t.common.search}
            </Button>
          </form>

          {/* Popular Search Pills with Subtle Tech Styling */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
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
                className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 transition-all duration-200 font-medium border border-slate-200 shadow-2xs hover:shadow-xs cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Grounded CAD / Engineering Telemetry Metrics Strip */}
          <div className="mt-14 pt-8 border-t border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {/* Metric 1 */}
            <div className="relative p-3.5 sm:p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-center group">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                {stats.scholarshipCount}+
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">
                {t.home.verifiedGrants}
              </div>
              <div className="mt-1 text-[10px] font-mono text-emerald-600 uppercase tracking-wider font-semibold">
                INDEX: VERIFIED
              </div>
            </div>

            {/* Metric 2 */}
            <div className="relative p-3.5 sm:p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-center group">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                {stats.countryCount}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">
                {t.home.hostCountries}
              </div>
              <div className="mt-1 text-[10px] font-mono text-blue-600 uppercase tracking-wider font-semibold">
                GEO_HUBS: GLOBAL
              </div>
            </div>

            {/* Metric 3 */}
            <div className="relative p-3.5 sm:p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-emerald-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all duration-200 text-center group">
              <div className="text-2xl sm:text-3xl font-black text-emerald-800">100%</div>
              <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                {t.home.officialLinks}
              </div>
              <div className="mt-1 text-[10px] font-mono text-emerald-700 uppercase tracking-wider font-semibold">
                PORTALS: DIRECT
              </div>
            </div>

            {/* Metric 4 */}
            <div className="relative p-3.5 sm:p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-amber-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-200 text-center group">
              <div className="text-2xl sm:text-3xl font-black text-amber-800">$0</div>
              <div className="text-xs text-amber-800 font-semibold mt-0.5">
                {t.home.zeroFees}
              </div>
              <div className="mt-1 text-[10px] font-mono text-amber-700 uppercase tracking-wider font-semibold">
                MIDDLEMEN: ZERO
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
