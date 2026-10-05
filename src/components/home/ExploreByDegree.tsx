'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { GraduationCap, Award, BookOpen, Microscope, ArrowRight } from 'lucide-react';

export function ExploreByDegree() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const degrees = [
    {
      level: 'Bachelor',
      title: isAr ? 'مرحلة البكالوريوس' : "Bachelor's Degree",
      description: isAr
        ? 'فرص تمويل تغطي المصروفات الدراسية والسكن للطلاب المتفوقين خريجي الثانوية.'
        : 'Undergraduate entry grants covering tuition, dormitory, and stipends.',
      icon: GraduationCap,
      href: `/${locale}/scholarships?degree=Bachelor`,
      highlight: isAr ? 'منح حكومية وجامعية' : 'Gov & Uni Schemes',
    },
    {
      level: 'Master',
      title: isAr ? 'درجة الماجستير' : "Master's Degree",
      description: isAr
        ? 'البرامج الأكثر طلباً عالمياً مع رواتب شهرية وتذاكر طيران وإعفاء كامل من الرسوم.'
        : 'Flagship fully funded awards with comprehensive living allowances and flights.',
      icon: Award,
      href: `/${locale}/scholarships?degree=Master`,
      highlight: isAr ? 'تشيفنينغ، داد، إيفل' : 'Chevening, DAAD, Eiffel',
    },
    {
      level: 'PhD',
      title: isAr ? 'الدكتوراه والأبحاث' : 'Doctoral & PhD',
      description: isAr
        ? 'تمويل بحثي مرموق ورواتب مجزية للباحثين الواعدين في المعاهد المتقدمة.'
        : 'Full doctoral fellowships and research assistantships with competitive stipends.',
      icon: Microscope,
      href: `/${locale}/scholarships?degree=PhD`,
      highlight: isAr ? 'رواتب حتى 3,200$/شهرياً' : 'Stipends up to $3,200/mo',
    },
    {
      level: 'Postdoctoral',
      title: isAr ? 'أبحاث ما بعد الدكتوراه' : 'Postdoctoral Fellowships',
      description: isAr
        ? 'زمالات استقلالية بحثية للعلماء وحملة الدكتوراه في المختبرات العالمية.'
        : 'Independent research fellowships for senior scholars in top global labs.',
      icon: BookOpen,
      href: `/${locale}/scholarships?degree=Postdoctoral`,
      highlight: isAr ? 'سويسرا وكندا' : 'Swiss & Canadian Grants',
    },
  ];

  return (
    <section className="border-b border-border/70 bg-white py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {t.home.exploreDegreesTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            {t.home.exploreDegreesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {degrees.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.level}
                href={item.href}
                className="card-surface card-interactive group relative flex flex-col p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary-border/70 bg-primary-soft text-primary shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="mt-4 flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {item.highlight}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-text-primary transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center border-t border-border/70 pt-3 text-xs font-semibold text-primary">
                  <span>{t.common.scholarships}</span>
                  <ArrowRight className="w-3.5 h-3.5 ms-1.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
