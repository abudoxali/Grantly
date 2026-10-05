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
import { EmptyState } from '@/components/ui/EmptyState';

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
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.home.popularFieldsTitle}</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {isAr ? 'التخصصات والمجالات العلمية' : 'Academic Disciplines & Fields'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {isAr
              ? 'تصفح مسارات المنح العالمية المخصصة للتخصصات الواعدة في العلوم والتكنولوجيا والعلوم الإنسانية.'
              : 'Browse specialized scholarship tracks designed for emerging technologies, life sciences, and policy governance.'}
          </p>
        </div>

        {fields.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={isAr ? 'التخصصات الأكاديمية قيد الإعداد' : 'Academic fields are being prepared'}
            description={isAr ? 'ستظهر هنا المجالات التي تتوفر لها فرص دراسية منشورة ومعلومات موثوقة.' : 'Academic fields will appear here as verified scholarship listings become available.'}
            action={
              <Link
                href={`/${locale}/scholarships`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                <span>{t.nav.findScholarships}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((field) => {
              const Icon = ICON_MAP[field.icon] || BookOpen;
              const name = isAr ? field.name_ar : field.name_en;
              const desc = isAr ? field.description_ar : field.description_en;

              return (
                <div key={field.id} className="card-surface card-interactive flex flex-col p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary-border/70 bg-primary-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-text-primary">{name}</h3>

                  {desc && (
                    <p className="flex-1 text-sm leading-relaxed text-text-secondary">
                      {desc}
                    </p>
                  )}

                  <div className="mt-5 border-t border-border/70 pt-3">
                    <Link
                      href={`/${locale}/scholarships?field=${encodeURIComponent(field.name_en)}`}
                      className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                    >
                      <span>{isAr ? 'تصفح منح هذا التخصص' : 'Browse Scholarships'}</span>
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
