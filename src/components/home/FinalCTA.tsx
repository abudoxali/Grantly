'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { Compass, ArrowRight } from 'lucide-react';

export function FinalCTA() {
  const { locale, t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-deep-plum to-slate-950 py-16 text-white sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-primary-soft text-primary shadow-lg shadow-black/10">
          <Compass className="w-6 h-6" />
        </div>

        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {t.home.ctaTitle}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary-100 sm:text-lg">
          {t.home.ctaDesc}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={`/${locale}/scholarships`}
            className="inline-flex h-12 min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            {t.home.ctaButton}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
          <Link
            href={`/${locale}/countries`}
            className="inline-flex h-12 min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-transparent px-8 py-3 text-base text-white shadow-xs transition-all hover:bg-slate-800 active:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            {t.home.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
