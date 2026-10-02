'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-50/50 via-slate-50/30 to-transparent pointer-events-none" />
      <div className="absolute -top-24 end-1/2 translate-x-1/2 w-[700px] h-[350px] bg-emerald-100/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 mb-6 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.home.badge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 font-sans leading-[1.15] text-balance">
            {t.home.headlineStart}{' '}
            <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2 underline-offset-6">
              {t.home.headlineHighlight}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.home.subheadline}
          </p>

          {/* Interactive Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-2xl mx-auto relative flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 shadow-lg shadow-slate-200/50 transition-all duration-200"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-slate-400 ms-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto px-6 h-11 text-sm font-bold shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
            >
              {t.common.search}
            </Button>
          </form>

          {/* Popular Search Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">{t.home.popularSearches}</span>
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
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors font-medium border border-slate-200/60"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Grounded, Authentic Telemetry Metrics (No fake numbers!) */}
          <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 text-center">
              <div className="text-2xl font-black text-slate-900">{stats.scholarshipCount}+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{t.home.verifiedGrants}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 text-center">
              <div className="text-2xl font-black text-slate-900">{stats.countryCount}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{t.home.hostCountries}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-center">
              <div className="text-2xl font-black text-emerald-800">100%</div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">{t.home.officialLinks}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-center">
              <div className="text-2xl font-black text-amber-800">$0</div>
              <div className="text-xs text-amber-700 font-medium mt-0.5">{t.home.zeroFees}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
