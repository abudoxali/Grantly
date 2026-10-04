'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  getCountries,
  logAdminAudit,
} from '@/lib/db/repository';
import type { Provider, Country } from '@/lib/supabase/types';
import { Plus, Edit2, Trash2, X, Building2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function AdminProvidersPage() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProvider, setEditingProvider] = React.useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Form states
  const [nameEn, setNameEn] = React.useState('');
  const [nameAr, setNameAr] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [providerType, setProviderType] = React.useState<Provider['provider_type']>('University');
  const [countryId, setCountryId] = React.useState<string>('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [descEn, setDescEn] = React.useState('');
  const [descAr, setDescAr] = React.useState('');
  const [verified, setVerified] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      const [provList, countryList] = await Promise.all([
        getProviders(),
        getCountries(),
      ]);
      setProviders(provList);
      setCountries(countryList);
    } catch (err: unknown) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    Promise.all([getProviders(), getCountries()])
      .then(([provList, countryList]) => {
        if (!ignore) {
          setProviders(provList);
          setCountries(countryList);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load providers:', err);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const openAddModal = () => {
    setEditingProvider(null);
    setErrorMessage(null);
    setNameEn('');
    setNameAr('');
    setSlug('');
    setProviderType('University');
    setCountryId(countries[0]?.id || '');
    setWebsiteUrl('');
    setLogoUrl('');
    setDescEn('');
    setDescAr('');
    setVerified(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Provider) => {
    setEditingProvider(p);
    setErrorMessage(null);
    setNameEn(p.name_en);
    setNameAr(p.name_ar);
    setSlug(p.slug);
    setProviderType(p.provider_type);
    setCountryId(p.country_id || '');
    setWebsiteUrl(p.website_url || '');
    setLogoUrl(p.logo_url || '');
    setDescEn(p.description_en || '');
    setDescAr(p.description_ar || '');
    setVerified(p.verified);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id, {
          name_en: nameEn,
          name_ar: nameAr,
          slug,
          provider_type: providerType,
          country_id: countryId || null,
          website_url: websiteUrl || null,
          logo_url: logoUrl || null,
          description_en: descEn || null,
          description_ar: descAr || null,
          verified,
        });

        await logAdminAudit({
          action: 'UPDATE',
          entityType: 'PROVIDER',
          entityId: editingProvider.id,
          metadata: { name_en: nameEn, slug },
        });
      } else {
        const created = await createProvider({
          name_en: nameEn,
          name_ar: nameAr,
          slug: slug || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          provider_type: providerType,
          country_id: countryId || null,
          website_url: websiteUrl || null,
          logo_url: logoUrl || null,
          description_en: descEn || null,
          description_ar: descAr || null,
          verified,
        });

        await logAdminAudit({
          action: 'CREATE',
          entityType: 'PROVIDER',
          entityId: created.id,
          metadata: { name_en: nameEn, slug },
        });
      }

      await loadData();
      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMessage = isAr
      ? `هل أنت متأكد من رغبتك في حذف الجهة المانحة "${name}"؟`
      : `Are you sure you want to delete provider "${name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteProvider(id);
      await logAdminAudit({
        action: 'DELETE',
        entityType: 'PROVIDER',
        entityId: id,
        metadata: { name },
      });
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-950 font-sans flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>{isAr ? 'إدارة الجهات المانحة والجامعات' : 'Scholarship Providers CMS'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'إدارة الجامعات والمؤسسات الحكومية والجهات المانحة المسؤولة عن تقديم المنح الدراسية.'
              : 'Manage universities, ministries, and philanthropic institutions offering global scholarships.'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-2xs font-bold"
        >
          {isAr ? 'إضافة جهة مانحة' : 'Add Provider'}
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 text-start">{isAr ? 'الجهة المانحة' : 'Provider'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'النوع' : 'Type'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'بلد المقر' : 'Country'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'الموقع الرسمي' : 'Official Portal'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'حالة التوثيق' : 'Verification'}</th>
                <th className="py-3.5 px-4 text-end">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {t.common.loading}
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {isAr ? 'لا توجد جهات مانحة مضافة بعد.' : 'No scholarship providers found.'}
                  </td>
                </tr>
              ) : (
                providers.map((p) => {
                  const country = countries.find((c) => c.id === p.country_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {p.name_en.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{isAr ? p.name_ar : p.name_en}</p>
                            <p className="text-[11px] text-slate-400">{isAr ? p.name_en : p.name_ar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {p.provider_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {country ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span>{country.flag}</span>
                            <span>{isAr ? country.name_ar : country.name_en}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.website_url ? (
                          <a
                            href={p.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                          >
                            <span className="truncate max-w-[140px]">{p.website_url.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{isAr ? 'موثوق' : 'Verified'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                            {isAr ? 'غير موثق' : 'Unverified'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={t.admin.edit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, isAr ? p.name_ar : p.name_en)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t.admin.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 end-6 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-950 mb-4 font-sans flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>
                {editingProvider
                  ? isAr ? 'تعديل بيانات الجهة المانحة' : 'Edit Provider'
                  : isAr ? 'إضافة جهة مانحة جديدة' : 'Add New Provider'}
              </span>
            </h2>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isAr ? 'الاسم (بالإنجليزية)' : 'Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => {
                      setNameEn(e.target.value);
                      if (!editingProvider && !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    placeholder="University of Oxford"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 font-sans"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isAr ? 'الاسم (بالعربية)' : 'Name (Arabic)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="جامعة أكسفورد"
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isAr ? 'المعرف الفريد (Slug)' : 'Slug Identifier'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="university-of-oxford"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isAr ? 'نوع الجهة' : 'Provider Type'}
                  </label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value as Provider['provider_type'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="University">{isAr ? 'جامعة' : 'University'}</option>
                    <option value="Government">{isAr ? 'مؤسسة حكومية / وزارة' : 'Government / Ministry'}</option>
                    <option value="Foundation">{isAr ? 'مؤسسة وقفية / خيرية' : 'Foundation'}</option>
                    <option value="Organization">{isAr ? 'منظمة دولية' : 'International Organization'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isAr ? 'الدولة التابعة لها' : 'Host Country'}
                  </label>
                  <select
                    value={countryId}
                    onChange={(e) => setCountryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="">{isAr ? '-- غير محدد --' : '-- Not Specified --'}</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {isAr ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isAr ? 'الموقع الرسمي' : 'Website URL'}
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.ox.ac.uk"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <ImageUpload
                value={logoUrl}
                onChange={(url) => setLogoUrl(url || '')}
                bucket="provider-logos"
                label={isAr ? 'شعار الجهة المانحة (Logo)' : 'Provider Logo Image'}
                isArabic={isAr}
                maxSizeMB={2}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="verified-checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="verified-checkbox" className="font-semibold text-slate-800 cursor-pointer">
                  {isAr ? 'توثيق رسمي للجهة (Verified Official Institution)' : 'Verified Official Institution'}
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  {t.admin.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving}
                  className="font-bold"
                >
                  {saving ? t.common.loading : t.admin.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
