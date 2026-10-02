import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFields } from '@/lib/db/repository';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import {
  Code,
  Cpu,
  Activity,
  Briefcase,
  Atom,
  Users,
  Scale,
  Palette,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface FieldsPageProps {
  params: Promise<{ locale: string }>;
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

export async function generateMetadata({
  params,
}: FieldsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'التخصصات والمجالات الأكاديمية للمنح | جرانتلي'
      : 'Academic Fields & Specializations | Grantly',
    description: isAr
      ? 'استكشف المنح الدولية المتاحة بحسب التخصص: علوم الحاسوب، الهندسة، الطب، إدارة الأعمال، القانون، والمزيد.'
      : 'Explore international scholarships filtered by academic field: Computer Science, Engineering, Medicine, Business, Law, and more.',
  };
}

export default async function LocalizedFieldsPage({ params }: FieldsPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;
  const t = getDictionary(loc);
  const isAr = loc === 'ar';

  const fields = await getFields();

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.home.popularFieldsTitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-sans tracking-tight">
            {isAr ? 'التخصصات والمجالات العلمية' : 'Academic Disciplines & Fields'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {isAr
              ? 'تصفح مسارات المنح العالمية المخصصة للتخصصات الواعدة في العلوم والتكنولوجيا والعلوم الإنسانية.'
              : 'Browse specialized scholarship tracks designed for emerging technologies, life sciences, and policy governance.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fields.map((field) => {
            const Icon = ICON_MAP[field.icon] || BookOpen;
            const name = isAr ? field.name_ar : field.name_en;
            const desc = isAr ? field.description_ar : field.description_en;

            return (
              <div
                key={field.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{name}</h3>

                {desc && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                    {desc}
                  </p>
                )}

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/${locale}/scholarships?field=${encodeURIComponent(field.name_en)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>{isAr ? 'تصفح منح هذا التخصص' : 'Browse Scholarships'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
