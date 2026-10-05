'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import { ShieldCheck, CheckCircle2, Lock, Landmark } from 'lucide-react';

export function TrustSection() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const pillars = [
    {
      title: isAr ? 'مصادر رسمية معتمدة حصراً' : '100% Primary Sources',
      desc: isAr
        ? 'كل رابط على منصة جرانتلي يقود مباشرة إلى النطاق الحكومي أو الجامعي الرسمي (.gov / .edu / .ac.uk).'
        : 'Every external link points directly to the accredited primary government or university portal.',
      icon: Landmark,
    },
    {
      title: isAr ? 'صفر رسوم وساطة أو تقديم' : 'Zero Intermediary Fees',
      desc: isAr
        ? 'لا نفرض أي رسوم، ولا نتقاضى عمولات من الطلاب، ونحذر دائماً من سماسرة المنح التجارية.'
        : 'Grantly never charges student fees, accepts commissions, or promotes paid placement agents.',
      icon: Lock,
    },
    {
      title: isAr ? 'بيانات حقيقية مدققة ومحدثة' : 'Transparent Coverage',
      desc: isAr
        ? 'نوضح الراتب الشهري الحقيقي وشروط التأشيرة وتذاكر الطيران بكل أمانة دون تضخيم أو وعود زائفة.'
        : 'Clear breakdown of stipends, flights, and health insurance with verified dates and requirements.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="border-b border-border/70 bg-background py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-success-border bg-success-soft text-success-ink">
            <ShieldCheck className="h-6 w-6 text-success-ink" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {t.home.trustTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.home.trustDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="card-surface p-6 text-start"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3.5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{p.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
