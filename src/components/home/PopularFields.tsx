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
import { EmptyState } from '@/components/ui/EmptyState';

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
    <section className="border-b border-border/70 bg-white py-14 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {t.home.popularFieldsTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            {t.home.popularFieldsSubtitle}
          </p>
        </div>

        {fields.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            compact
            title={isAr ? 'التخصصات الأكاديمية قيد الإعداد' : 'Academic fields are being prepared'}
            description={isAr ? 'ستظهر هنا المسارات التي تتوفر لها منح منشورة ومعلومات موثوقة.' : 'Academic pathways will appear here as verified scholarship listings become available.'}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {fields.map((field) => {
              const Icon = ICON_MAP[field.icon] || BookOpen;
              const name = isAr ? field.name_ar : field.name_en;
              const desc = isAr ? field.description_ar : field.description_en;

              return (
                <Link
                  key={field.id}
                  href={`/${locale}/scholarships?field=${encodeURIComponent(field.name_en)}`}
                  className="card-surface card-interactive group flex flex-col p-5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary-border/70 bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-primary">
                    {name}
                  </h3>

                  {desc && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                      {desc}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs font-semibold text-primary">
                    <span>{t.common.scholarships}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
