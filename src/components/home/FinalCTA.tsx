'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinalCTA() {
  const { locale, t } = useI18n();

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/25 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <Compass className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans text-balance">
          {t.home.ctaTitle}
        </h2>

        <p className="mt-4 text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
          {t.home.ctaDesc}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/${locale}/scholarships`}>
            <Button
              variant="amber"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              className="w-full sm:w-auto h-12 px-8 font-bold"
            >
              {t.home.ctaButton}
            </Button>
          </Link>
          <Link href={`/${locale}/countries`}>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 bg-transparent text-white border-slate-700 hover:bg-slate-800"
            >
              {t.home.ctaSecondary}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
