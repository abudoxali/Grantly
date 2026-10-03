'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import {
  Search,
  ArrowRight,
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 border-b border-slate-200/80 pt-10 pb-16 lg:pt-16 lg:pb-20">
      {/* Non-intrusive Architectural Ambient Background */}
      <HeroGeometricBackground />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        {/* Top Focused Live Radar Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-emerald-200 text-xs font-bold text-emerald-800 mb-6 shadow-2xs backdrop-blur-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="font-semibold tracking-normal">{t.home.badge}</span>
        </div>

        {/* Main Headline with Cairo Font Hierarchy */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-sans leading-[1.25] text-balance">
          {t.home.headlineStart}{' '}
          <span className="block mt-2 text-emerald-700 font-black">
            {t.home.headlineHighlight}
          </span>
        </h1>

        {/* Subheadline with Generous Spacing */}
        <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          {t.home.subheadline}
        </p>

        {/* Clean, High-Contrast Search Box */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-2xl mx-auto relative flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500/60 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 shadow-lg shadow-slate-200/60 transition-all duration-200 group"
        >
          <div className="relative flex-1 w-full flex items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center ms-1 shrink-0 border border-emerald-100 transition-colors group-focus-within:bg-emerald-600 group-focus-within:text-white">
              <Search className="w-5 h-5 transition-transform group-focus-within:scale-105" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="w-full py-3 px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent font-medium"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto px-7 h-12 text-sm font-bold shrink-0 shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all"
            rightIcon={
              <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            }
          >
            {t.common.search}
          </Button>
        </form>

        {/* Popular Search Tags */}
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
              className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 transition-all font-medium border border-slate-200/90 shadow-2xs cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Live Verified Opportunities Showcase (Structured Dual Cards, No Overlap!) */}
        <div className="mt-8 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
          {/* Card 1: DAAD Germany */}
          <Link
            href={`/${locale}/scholarships/daad-helmut-schmidt`}
            className="group block p-3.5 rounded-xl bg-white/95 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
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
            <p className="text-[11px] text-slate-500 mb-2">
              {isAr ? 'ألمانيا • تمويل حكومي كامل 100%' : 'Germany • Full Government Grant'}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span className="font-bold text-emerald-700">
                {isAr ? '€934 / شهر + سكن' : '€934 / mo + Housing'}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5 group-hover:text-emerald-600 transition-colors font-medium">
                <span>{isAr ? 'البوابة الرسمية' : 'Official Portal'}</span>
                <ExternalLink className="w-2.5 h-2.5 rtl:rotate-180" />
              </span>
            </div>
          </Link>

          {/* Card 2: Chevening UK */}
          <Link
            href={`/${locale}/scholarships/chevening-uk`}
            className="group block p-3.5 rounded-xl bg-white/95 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
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
            <p className="text-[11px] text-slate-500 mb-2">
              {isAr ? 'المملكة المتحدة • ماجستير معتمد' : 'United Kingdom • Master Degree'}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span className="font-bold text-slate-800">
                {isAr ? '100% الرسوم + تذاكر الطيران' : 'Full Tuition + Flights'}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5 group-hover:text-emerald-600 transition-colors font-medium">
                <span>{isAr ? 'البوابة الرسمية' : 'Official Portal'}</span>
                <ExternalLink className="w-2.5 h-2.5 rtl:rotate-180" />
              </span>
            </div>
          </Link>
        </div>

        {/* Telemetry Metrics Bar with Harmonious Light Styling */}
        <div className="mt-12 pt-8 border-t border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.scholarshipCount}+</div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">{t.home.verifiedGrants}</div>
            <div className="mt-1 text-[10px] text-emerald-700 font-semibold">{isAr ? '● فحص دائم' : '● ACTIVE INDEX'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.countryCount}</div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">{t.home.hostCountries}</div>
            <div className="mt-1 text-[10px] text-blue-700 font-semibold">{isAr ? '● وجهات دولية' : '● GLOBAL HUBS'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-800">100%</div>
            <div className="text-xs text-emerald-800 font-semibold mt-0.5">{t.home.officialLinks}</div>
            <div className="mt-1 text-[10px] text-emerald-700 font-semibold">{isAr ? '● بوابات رسمية' : '● OFFICIAL ONLY'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">$0</div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">{t.home.zeroFees}</div>
            <div className="mt-1 text-[10px] text-amber-700 font-semibold">{isAr ? '● بدون أي عمولة' : '● ZERO FEES'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
