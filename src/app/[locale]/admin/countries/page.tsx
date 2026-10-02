'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
} from '@/lib/db/repository';
import type { Country } from '@/lib/supabase/types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminCountriesPage() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCountry, setEditingCountry] = React.useState<Country | null>(null);

  // Form states
  const [nameEn, setNameEn] = React.useState('');
  const [nameAr, setNameAr] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [code, setCode] = React.useState('');
  const [flag, setFlag] = React.useState('');
  const [descEn, setDescEn] = React.useState('');
  const [descAr, setDescAr] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [costFrom, setCostFrom] = React.useState<number>(800);
  const [costTo, setCostTo] = React.useState<number>(1400);

  const loadData = React.useCallback(async () => {
    const list = await getCountries();
    setCountries(list);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let ignore = false;
    getCountries().then((list) => {
      if (!ignore) {
        setCountries(list);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const openAddModal = () => {
    setEditingCountry(null);
    setNameEn('');
    setNameAr('');
    setSlug('');
    setCode('');
    setFlag('🌐');
    setDescEn('');
    setDescAr('');
    setCurrency('USD');
    setCostFrom(800);
    setCostTo(1400);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Country) => {
    setEditingCountry(c);
    setNameEn(c.name_en);
    setNameAr(c.name_ar);
    setSlug(c.slug);
    setCode(c.code);
    setFlag(c.flag);
    setDescEn(c.description_en || '');
    setDescAr(c.description_ar || '');
    setCurrency(c.currency);
    setCostFrom(c.living_cost_from || 800);
    setCostTo(c.living_cost_to || 1400);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCountry) {
      await updateCountry(editingCountry.id, {
        name_en: nameEn,
        name_ar: nameAr,
        slug,
        code,
        flag,
        description_en: descEn,
        description_ar: descAr,
        currency,
        living_cost_from: costFrom,
        living_cost_to: costTo,
      });
    } else {
      await createCountry({
        name_en: nameEn,
        name_ar: nameAr,
        slug: slug || nameEn.toLowerCase().replace(/\s+/g, '-'),
        code,
        flag,
        description_en: descEn,
        description_ar: descAr,
        currency,
        living_cost_from: costFrom,
        living_cost_to: costTo,
        featured: false,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذه الدولة؟' : 'Delete this country?')) {
      await deleteCountry(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans">
            {t.admin.countries}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'إدارة وجهات الدراسة العالمية وتكاليف المعيشة المقدرة.'
              : 'Manage host destination countries and estimated living expenses.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          {isAr ? 'إضافة دولة جديدة' : 'Add Country'}
        </Button>
      </div>

      {/* Countries Table */}
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
                  <th className="py-3 px-4 text-start">{isAr ? 'العلم' : 'Flag'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الدولة (إنجليزي)' : 'Name (EN)'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الدولة (عربي)' : 'Name (AR)'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الرمز' : 'Code'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'تكاليف المعيشة' : 'Living Cost'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {countries.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-2xl">{c.flag}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name_en}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{c.name_ar}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{c.code}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      ~{c.currency} {c.living_cost_from} - {c.living_cost_to}/mo
                    </td>
                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
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

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCountry
                  ? isAr
                    ? 'تعديل بيانات الدولة'
                    : 'Edit Country'
                  : isAr
                  ? 'إضافة دولة جديدة'
                  : 'Add New Country'}
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
                    placeholder="Germany"
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
                    placeholder="ألمانيا"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="DE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flag Emoji *</label>
                  <input
                    type="text"
                    required
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="🇩🇪"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="EUR"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Living Cost From</label>
                  <input
                    type="number"
                    value={costFrom}
                    onChange={(e) => setCostFrom(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Living Cost To</label>
                  <input
                    type="number"
                    value={costTo}
                    onChange={(e) => setCostTo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
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
