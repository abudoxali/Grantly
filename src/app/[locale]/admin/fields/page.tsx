'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import {
  getFields,
  createField,
  updateField,
  deleteField,
} from '@/lib/db/repository';
import type { Field } from '@/lib/supabase/types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminFieldsPage() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const [fields, setFields] = React.useState<Field[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingField, setEditingField] = React.useState<Field | null>(null);

  const [nameEn, setNameEn] = React.useState('');
  const [nameAr, setNameAr] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [icon, setIcon] = React.useState('Code');
  const [descEn, setDescEn] = React.useState('');
  const [descAr, setDescAr] = React.useState('');

  const loadData = React.useCallback(async () => {
    const list = await getFields();
    setFields(list);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let ignore = false;
    getFields().then((list) => {
      if (!ignore) {
        setFields(list);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const openAddModal = () => {
    setEditingField(null);
    setNameEn('');
    setNameAr('');
    setSlug('');
    setIcon('Code');
    setDescEn('');
    setDescAr('');
    setIsModalOpen(true);
  };

  const openEditModal = (f: Field) => {
    setEditingField(f);
    setNameEn(f.name_en);
    setNameAr(f.name_ar);
    setSlug(f.slug);
    setIcon(f.icon);
    setDescEn(f.description_en || '');
    setDescAr(f.description_ar || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingField) {
      await updateField(editingField.id, {
        name_en: nameEn,
        name_ar: nameAr,
        slug,
        icon,
        description_en: descEn,
        description_ar: descAr,
      });
    } else {
      await createField({
        name_en: nameEn,
        name_ar: nameAr,
        slug: slug || nameEn.toLowerCase().replace(/\s+/g, '-'),
        icon,
        description_en: descEn,
        description_ar: descAr,
        featured: false,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'حذف هذا التخصص؟' : 'Delete this field?')) {
      await deleteField(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans">
            {t.admin.fields}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'إدارة التخصصات والمجالات الأكاديمية والمسارات العلمية.'
              : 'Manage academic study fields and specialization tracks.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          {isAr ? 'إضافة تخصص جديد' : 'Add Field'}
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
                  <th className="py-3 px-4 text-start">{isAr ? 'الأيقونة' : 'Icon'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'التخصص (إنجليزي)' : 'Name (EN)'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'التخصص (عربي)' : 'Name (AR)'}</th>
                  <th className="py-3 px-4 text-start">Slug</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {f.icon}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{f.name_en}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{f.name_ar}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{f.slug}</td>
                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(f)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingField
                  ? isAr
                    ? 'تعديل التخصص'
                    : 'Edit Field'
                  : isAr
                  ? 'إضافة تخصص جديد'
                  : 'Add New Field'}
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
                  <label className="block font-bold text-slate-700 mb-1">Name (EN) *</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name (AR) *</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="علوم الحاسوب"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="computer-science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lucide Icon Name</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Code, Cpu, Activity..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (EN)</label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (AR)</label>
                <textarea
                  rows={2}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
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
