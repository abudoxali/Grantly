'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import {
  getScholarships,
  updateScholarship,
  deleteScholarship,
  logAdminAudit,
} from '@/lib/db/repository';
import type { Scholarship } from '@/lib/supabase/types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminScholarshipsPage() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const isAr = locale === 'ar';
  const showSavedAlert = searchParams.get('saved') === 'true';

  const [scholarships, setScholarships] = React.useState<Scholarship[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;
    getScholarships({ publishedOnly: false }, locale).then(({ scholarships: list }) => {
      if (!ignore) {
        setScholarships(list);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [locale]);

  const handleTogglePublish = async (sch: Scholarship) => {
    const nextPublished = !sch.published;
    const updated = await updateScholarship(sch.id, { published: nextPublished });
    if (updated) {
      await logAdminAudit({
        action: nextPublished ? 'PUBLISH' : 'UNPUBLISH',
        entityType: 'SCHOLARSHIP',
        entityId: sch.id,
        metadata: { title_en: sch.title_en, slug: sch.slug },
      });
      setScholarships((prev) =>
        prev.map((s) => (s.id === sch.id ? { ...s, published: nextPublished } : s))
      );
    }
  };

  const handleToggleFeature = async (sch: Scholarship) => {
    const nextFeatured = !sch.featured;
    const updated = await updateScholarship(sch.id, { featured: nextFeatured });
    if (updated) {
      await logAdminAudit({
        action: nextFeatured ? 'FEATURE' : 'UNFEATURE',
        entityType: 'SCHOLARSHIP',
        entityId: sch.id,
        metadata: { title_en: sch.title_en, slug: sch.slug },
      });
      setScholarships((prev) =>
        prev.map((s) => (s.id === sch.id ? { ...s, featured: nextFeatured } : s))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const sch = scholarships.find((s) => s.id === id);
    if (!confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذه المنحة نهائياً؟' : 'Are you sure you want to permanently delete this scholarship?')) {
      return;
    }

    setDeletingId(id);
    const success = await deleteScholarship(id);
    setDeletingId(null);
    if (success) {
      await logAdminAudit({
        action: 'DELETE',
        entityType: 'SCHOLARSHIP',
        entityId: id,
        metadata: { title_en: sch?.title_en, slug: sch?.slug },
      });
      setScholarships((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const filteredList = scholarships.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleEn = s.title_en.toLowerCase();
    const titleAr = s.title_ar.toLowerCase();
    const country = s.country?.name_en.toLowerCase() || '';
    return titleEn.includes(q) || titleAr.includes(q) || country.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans">
            {t.admin.scholarships}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'إنشاء، وتعديل، ونشر، وإدارة المنح الدراسية الموثقة.'
              : 'Create, edit, publish, and manage verified scholarship opportunities.'}
          </p>
        </div>

        <Link href={`/${locale}/admin/scholarships/new`}>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            {isAr ? 'إضافة منحة جديدة' : 'Add Scholarship'}
          </Button>
        </Link>
      </div>

      {showSavedAlert && (
        <div role="status" className="flex items-center justify-between rounded-xl border border-success-border bg-success-soft p-4 text-sm text-success-ink shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span className="font-bold">
              {isAr
                ? 'تم حفظ بيانات المنحة الدراسية بنجاح وتحديث السجلات.'
                : 'Scholarship data was saved and records were updated successfully.'}
            </span>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? 'البحث في المنح...' : 'Search scholarships...'}
            className="min-h-11 w-full rounded-xl border border-border bg-background py-2 ps-10 pe-3 text-sm focus:bg-white focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            {t.common.loading}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            {t.scholarships.emptyTitle}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? 'المنحة' : 'Scholarship'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الدولة' : 'Country'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'التمويل' : 'Funding'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الموعد النهائي' : 'Deadline'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'النشر' : 'Published'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'مميزة' : 'Featured'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {isAr ? sch.title_ar : sch.title_en}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {sch.country?.flag} {isAr ? sch.country?.name_ar : sch.country?.name_en}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-secondary">
                      {sch.funding_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {sch.deadline ? formatDate(sch.deadline, locale) : (isAr ? 'مفتوح' : 'Open')}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(sch)}
                        className={cn(
                          'inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                          sch.published
                            ? 'border border-success-border bg-success-soft text-success-ink'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        )}
                      >
                        {sch.published ? (
                          <>
                            <Eye className="h-3 w-3 text-success" />
                            <span>{isAr ? 'منشور' : 'Live'}</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>{isAr ? 'مسودة' : 'Draft'}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeature(sch)}
                        className={cn(
                          'p-1.5 rounded-lg border transition-colors',
                          sch.featured
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'text-slate-300 border-transparent hover:text-slate-500'
                        )}
                        title={sch.featured ? 'Featured' : 'Not featured'}
                      >
                        <Star className={cn('w-4 h-4', sch.featured && 'fill-amber-500')} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/${locale}/admin/scholarships/${sch.id}/edit`}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-primary-soft hover:text-primary"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/${locale}/scholarships/${sch.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Preview"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(sch.id)}
                          disabled={deletingId === sch.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
