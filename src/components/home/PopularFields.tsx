'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import type { Field } from '@/lib/supabase/types';
import {
  Code,
  Cpu,
  Activity,
  Briefcase,
  Atom,
  Users,
  Scale,
  Palette,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface PopularFieldsProps {
  fields: Field[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code,
  Cpu,
  Activity,
  Briefcase,
  Atom,
  Users,
  Scale,
  Palette,
  BookOpen,
};

export function PopularFields({ fields }: PopularFieldsProps) {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
            {t.home.popularFieldsTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            {t.home.popularFieldsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {fields.map((field) => {
            const Icon = ICON_MAP[field.icon] || BookOpen;
            const name = isAr ? field.name_ar : field.name_en;
            const desc = isAr ? field.description_ar : field.description_en;

            return (
              <Link
                key={field.id}
                href={`/${locale}/scholarships?field=${encodeURIComponent(field.name_en)}`}
                className="group flex flex-col p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 mb-3">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {name}
                </h3>

                {desc && (
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {desc}
                  </p>
                )}

                <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>{t.common.scholarships}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
