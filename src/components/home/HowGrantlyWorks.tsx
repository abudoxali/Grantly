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
    <section className="border-b border-border/70 bg-background py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
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
                className="card-surface relative flex flex-col p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary font-semibold">
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
