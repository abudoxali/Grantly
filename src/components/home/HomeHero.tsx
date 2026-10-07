'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Globe2,
  GraduationCap,
  Users,
  Coins,
  Sparkles,
} from 'lucide-react';
import type { Scholarship } from '@/lib/supabase/types';

interface HomeHeroProps {
  stats: {
    scholarshipCount: number;
    countryCount: number;
  };
  spotlightScholarships?: Scholarship[];
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
    { label: isAr ? 'كندا' : 'Canada', query: 'Canada', type: 'country' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-[#FFF9FA] to-white pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
      {/* Background Cinematic Artwork with Sakura Framing */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <Image
          src="/images/hero-bg.jpg"
          alt="Global education travel scene"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_top] sm:object-[center_top] md:object-[60%_top] lg:object-center opacity-90 transition-opacity duration-700"
        />

        {/* Directional Softening Gradient Overlay for Perfect Typography Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40 md:via-white/75 md:to-transparent rtl:bg-gradient-to-l rtl:from-white/95 rtl:via-white/85 rtl:to-white/40 rtl:md:via-white/75 rtl:md:to-transparent" />
        
        {/* Top and Bottom Atmosphere Fades */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[480px] lg:min-h-[540px]">
          {/* Left Column: Heading, Subtitle, Search, Popular tags */}
          <div className="lg:col-span-7 xl:col-span-7 text-start">
            {/* Tagline / Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {isAr ? 'فرص عالمية. مستقبل أكثر إشراقاً.' : 'GLOBAL OPPORTUNITIES. BRIGHTER FUTURES.'}
              </span>
            </div>

            {/* High-Impact Editorial Serif Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[3.85rem] font-bold tracking-tight text-slate-900 leading-[1.12] mb-4 sm:mb-6">
              <span>{isAr ? 'ابحث عن منح دراسية' : 'Find verified'}</span>
              <br />
              <span>{isAr ? 'عالمية موثقة.' : 'global scholarships.'}</span>
              <br />
              <span className="text-primary font-bold">
                {isAr ? 'وصول رسمي ومباشر.' : 'Direct official access.'}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-600 mb-6 sm:mb-8 font-normal">
              {isAr
                ? 'اكتشف المنح الدولية الممولة بالكامل، وقارن الرواتب المعيشية الحقيقية، وقدّم طلبك مباشرة عبر البوابات الحكومية والجامعية الرسمية.'
                : 'Discover fully funded international scholarships, compare living allowances, and apply directly through official government and university portals.'}
            </p>

            {/* Pill Search Bar */}
            <form onSubmit={handleSearch} role="search" className="max-w-xl sm:max-w-2xl mb-4 sm:mb-5">
              <div className="relative flex items-center bg-white rounded-full p-1.5 sm:p-2 shadow-xl shadow-rose-950/5 border border-pink-100 hover:border-pink-300 transition-all duration-200 focus-within:ring-4 focus-within:ring-primary/15 focus-within:border-primary">
                <div className="flex items-center justify-center ps-3 pe-2 text-primary shrink-0">
                  <Search className="w-5 h-5" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث باسم المنحة، الجامعة، الدولة، أو التخصص...'
                      : 'Search by title, university, country, or academic discipline...'
                  }
                  aria-label={t.home.searchPlaceholder}
                  className="w-full bg-transparent py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-primary hover:bg-primary-hover active:bg-primary-active text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                >
                  <span className="hidden sm:inline">{isAr ? 'بحث' : 'Search'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* Popular Search Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 inline-flex items-center gap-1.5 me-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>{isAr ? 'الأكثر بحثاً:' : 'Popular searches:'}</span>
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
                  className="rounded-full border border-pink-200/80 bg-white/90 hover:bg-primary-soft hover:border-primary-border hover:text-primary text-slate-700 px-3 py-1 text-xs font-medium shadow-2xs transition-all duration-150 backdrop-blur-xs"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Floating Atmospheric Badges & Traveler Scene (Desktop) */}
          <div className="lg:col-span-5 xl:col-span-5 relative hidden lg:block h-[440px]">
            {/* Playful Handwritten Cursive Note */}
            <div className="absolute top-2 start-4 sm:start-8 z-20 pointer-events-none select-none">
              <span className="font-handwriting text-xl sm:text-2xl text-primary/80 font-bold tracking-wide -rotate-6 inline-block drop-shadow-xs">
                {isAr ? 'مستقبل عالمي أكثر إشراقاً ♡' : 'A more brighter global future ♡'}
              </span>
            </div>

            {/* Floating Glassmorphism Badge 1: Verified Sources */}
            <div className="absolute top-10 end-4 z-20 animate-float-slow">
              <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-white/80 shadow-lg shadow-rose-950/5 rounded-2xl p-3 px-4 transition-transform hover:scale-105">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-primary border border-rose-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {isAr ? 'مصادر موثقة' : 'Verified Sources'}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                    {isAr ? 'رسمية بنسبة 100%' : '100% Official'}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Glassmorphism Badge 2: Global Coverage */}
            <div className="absolute top-36 end-10 z-20 animate-float-reverse">
              <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-white/80 shadow-lg shadow-rose-950/5 rounded-2xl p-3 px-4 transition-transform hover:scale-105">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-primary border border-rose-100">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {isAr ? 'تغطية عالمية' : 'Global Coverage'}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                    {isAr ? 'أكثر من 100 دولة' : '100+ Countries'}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Glassmorphism Badge 3: Zero Middlemen */}
            <div className="absolute bottom-12 end-6 z-20 animate-float-slow">
              <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-white/80 shadow-lg shadow-rose-950/5 rounded-2xl p-3 px-4 transition-transform hover:scale-105">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-primary border border-rose-100">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {isAr ? 'بدون أي وسطاء' : 'Zero Middlemen'}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                    {isAr ? 'تقديم مباشر' : 'Direct Access'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Unified Stats Bar (Spanning Transition) */}
        <div className="mt-10 sm:mt-12 lg:mt-14">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl shadow-rose-950/5 border border-pink-100/90 p-5 sm:p-6 lg:p-7 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:divide-x lg:divide-pink-100/80 rtl:lg:divide-x-reverse">
              {/* Stat 1: Verified Grants */}
              <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-4">
                <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-primary border border-rose-100 shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {stats.scholarshipCount || 14}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1 leading-snug">
                    {isAr ? 'منحة موثقة' : 'Verified Grants'}
                  </div>
                </div>
              </div>

              {/* Stat 2: Host Nations */}
              <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-4">
                <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-primary border border-rose-100 shrink-0">
                  <Globe2 className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {stats.countryCount || 12}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1 leading-snug">
                    {isAr ? 'دولة مضيفة' : 'Host Nations'}
                  </div>
                </div>
              </div>

              {/* Stat 3: 100% Official Direct Portals */}
              <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-4">
                <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-primary border border-rose-100 shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    100%
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1 leading-snug">
                    {isAr ? 'بوابات رسمية مباشرة' : 'Official Direct Portals'}
                  </div>
                </div>
              </div>

              {/* Stat 4: $0 Zero Intermediary Fees */}
              <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-4">
                <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-primary border border-rose-100 shrink-0">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    $0
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1 leading-snug">
                    {isAr ? 'بدون أي رسوم وسيطة' : 'Zero Intermediary Fees'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
