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
    <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
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
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs text-start"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3.5">
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
