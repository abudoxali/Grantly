import * as React from 'react';
import Link from 'next/link';
import {
  getScholarships,
  getCountries,
  getFields,
  getGuides,
  getProfiles,
  getProviders,
} from '@/lib/db/repository';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import {
  Globe2,
  BookOpen,
  Users,
  Building2,
  Plus,
  ArrowRight,
  ExternalLink,
  Edit2,
  FileCheck2,
  FileEdit,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface AdminOverviewProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminOverviewPage({ params }: AdminOverviewProps) {
  const { locale } = await params;
  const loc = (isValidLocale(locale) ? locale : 'en') as Locale;
  const t = getDictionary(loc);
  const isAr = loc === 'ar';

  const [
    { scholarships },
    countries,
    fields,
    guides,
    profiles,
    providers,
  ] = await Promise.all([
    getScholarships({ publishedOnly: false }, loc),
    getCountries(),
    getFields(),
    getGuides(false),
    getProfiles(),
    getProviders(),
  ]);

  const publishedCount = scholarships.filter((s) => s.published).length;
  const draftCount = scholarships.length - publishedCount;

  const stats = [
    {
      label: isAr ? 'المنح المنشورة' : 'Published Scholarships',
      value: publishedCount,
      icon: FileCheck2,
      href: `/${locale}/admin/scholarships`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      label: isAr ? 'مسودات المنح' : 'Draft Scholarships',
      value: draftCount,
      icon: FileEdit,
      href: `/${locale}/admin/scholarships`,
      color: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      label: t.admin.totalProviders,
      value: providers.length,
      icon: Building2,
      href: `/${locale}/admin/providers`,
      color: 'text-teal-700 bg-teal-50 border-teal-100',
    },
    {
      label: t.admin.totalCountries,
      value: countries.length,
      icon: Globe2,
      href: `/${locale}/admin/countries`,
      color: 'text-blue-700 bg-blue-50 border-blue-100',
    },
    {
      label: t.admin.totalFields,
      value: fields.length,
      icon: BookOpen,
      href: `/${locale}/admin/fields`,
      color: 'text-purple-700 bg-purple-50 border-purple-100',
    },
    {
      label: t.admin.totalGuides,
      value: guides.length,
      icon: BookOpen,
      href: `/${locale}/admin/guides`,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-100',
    },
    {
      label: t.admin.totalUsers,
      value: profiles.length,
      icon: Users,
      href: `/${locale}/admin/users`,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans">
            {t.admin.dashboard}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'مرحباً بك في لوحة الإدارة. يمكنك إدارة المنح، والدول، والتخصصات، والأدلة المنشورة.'
              : 'Welcome to Grantly administration. Manage scholarships, countries, fields, and guides.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/scholarships/new`}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {isAr ? 'إضافة منحة جديدة' : 'Add Scholarship'}
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={i}
              href={s.href}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900">{s.value}</span>
              <span className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                {s.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Recent Scholarships Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {isAr ? 'أحدث المنح في النظام' : 'Recent Scholarships'}
          </h2>
          <Link
            href={`/${locale}/admin/scholarships`}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>{isAr ? 'عرض الكل' : 'View all'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 text-start">{isAr ? 'المنحة' : 'Scholarship'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'الدولة' : 'Country'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'التمويل' : 'Funding'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'الموعد' : 'Deadline'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scholarships.slice(0, 5).map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                    {isAr ? sch.title_ar : sch.title_en}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {sch.country?.flag} {isAr ? sch.country?.name_ar : sch.country?.name_en}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {sch.funding_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {sch.deadline ? formatDate(sch.deadline) : 'Ongoing'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={sch.published ? 'success' : 'amber'}
                      size="sm"
                    >
                      {sch.published
                        ? isAr
                          ? 'منشورة'
                          : 'Published'
                        : isAr
                          ? 'مسودة'
                          : 'Draft'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${locale}/admin/scholarships/${sch.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/${locale}/scholarships/${sch.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="View Public"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
