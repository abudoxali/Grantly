'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import { Search, Coins, FileCheck, ExternalLink } from 'lucide-react';

export function HowGrantlyWorks() {
  const { t } = useI18n();

  const steps = [
    {
      num: '01',
      title: t.home.step1Title,
      desc: t.home.step1Desc,
      icon: Search,
    },
    {
      num: '02',
      title: t.home.step2Title,
      desc: t.home.step2Desc,
      icon: Coins,
    },
    {
      num: '03',
      title: t.home.step3Title,
      desc: t.home.step3Desc,
      icon: FileCheck,
    },
    {
      num: '04',
      title: t.home.step4Title,
      desc: t.home.step4Desc,
      icon: ExternalLink,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50/50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
            {t.home.howItWorksTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            {t.home.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    STEP {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
