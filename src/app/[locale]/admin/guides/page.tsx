'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import {
  getGuides,
  createGuide,
  updateGuide,
  deleteGuide,
} from '@/lib/db/repository';
import type { Guide } from '@/lib/supabase/types';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminGuidesPage() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const [guides, setGuides] = React.useState<Guide[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingGuide, setEditingGuide] = React.useState<Guide | null>(null);

  const [titleEn, setTitleEn] = React.useState('');
  const [titleAr, setTitleAr] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [category, setCategory] = React.useState('Application Strategy');
  const [readingTime, setReadingTime] = React.useState(5);
  const [excerptEn, setExcerptEn] = React.useState('');
  const [excerptAr, setExcerptAr] = React.useState('');
  const [contentEn, setContentEn] = React.useState('');
  const [contentAr, setContentAr] = React.useState('');
  const [published, setPublished] = React.useState(true);

  const loadData = React.useCallback(async () => {
    const list = await getGuides(false);
    setGuides(list);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let ignore = false;
    getGuides(false).then((list) => {
      if (!ignore) {
        setGuides(list);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const openAddModal = () => {
    setEditingGuide(null);
    setTitleEn('');
    setTitleAr('');
    setSlug('');
    setCategory('Application Strategy');
    setReadingTime(5);
    setExcerptEn('');
    setExcerptAr('');
    setContentEn('');
    setContentAr('');
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (g: Guide) => {
    setEditingGuide(g);
    setTitleEn(g.title_en);
    setTitleAr(g.title_ar);
    setSlug(g.slug);
    setCategory(g.category);
    setReadingTime(g.reading_time_minutes);
    setExcerptEn(g.excerpt_en);
    setExcerptAr(g.excerpt_ar);
    setContentEn(g.content_en);
    setContentAr(g.content_ar);
    setPublished(g.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuide) {
      await updateGuide(editingGuide.id, {
        title_en: titleEn,
        title_ar: titleAr,
        slug,
        category,
        reading_time_minutes: readingTime,
        excerpt_en: excerptEn,
        excerpt_ar: excerptAr,
        content_en: contentEn,
        content_ar: contentAr,
        published,
      });
    } else {
      await createGuide({
        title_en: titleEn,
        title_ar: titleAr,
        slug: slug || titleEn.toLowerCase().replace(/\s+/g, '-'),
        category,
        reading_time_minutes: readingTime,
        excerpt_en: excerptEn,
        excerpt_ar: excerptAr,
        content_en: contentEn,
        content_ar: contentAr,
        published,
        featured: false,
        author: 'Grantly Editorial Team',
        cover_image: null,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'حذف هذا الدليل؟' : 'Delete this guide?')) {
      await deleteGuide(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans">
            {t.admin.guides}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'إدارة مقالات واستراتيجيات القبول وخطابات الدافع.'
              : 'Publish admissions playbooks, CV formats, and application strategy articles.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          {isAr ? 'إضافة دليل جديد' : 'Add Guide'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            {t.common.loading}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? 'العنوان' : 'Title'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'زمن القراءة' : 'Reading Time'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guides.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm truncate">
                      {isAr ? g.title_ar : g.title_en}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {g.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {g.reading_time_minutes} min
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          g.published
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {g.published ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>{isAr ? 'منشور' : 'Live'}</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>{isAr ? 'مسودة' : 'Draft'}</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(g)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(g.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingGuide
                  ? isAr
                    ? 'تعديل الدليل'
                    : 'Edit Guide'
                  : isAr
                  ? 'إضافة دليل جديد'
                  : 'Add New Guide'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title (EN) *</label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title (AR) *</label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Read Time (min)</label>
                  <input
                    type="number"
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Excerpt (EN)</label>
                  <textarea
                    rows={2}
                    value={excerptEn}
                    onChange={(e) => setExcerptEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Excerpt (AR)</label>
                  <textarea
                    rows={2}
                    value={excerptAr}
                    onChange={(e) => setExcerptAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Content (EN)</label>
                  <textarea
                    rows={6}
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Content (AR)</label>
                  <textarea
                    rows={6}
                    value={contentAr}
                    onChange={(e) => setContentAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="guide-published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="guide-published" className="font-semibold text-slate-800">
                  {isAr ? 'نشر المقال' : 'Publish Guide'}
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  {t.admin.cancel}
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {t.admin.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
