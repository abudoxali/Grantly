'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import {
  createScholarship,
  updateScholarship,
} from '@/lib/db/repository';
import type {
  Scholarship,
  Country,
  Provider,
  DegreeLevel,
  FundingType,
  ScholarshipStatus,
} from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface ScholarshipEditorProps {
  initialData?: Scholarship | null;
  countries: Country[];
  providers: Provider[];
}

export function ScholarshipEditor({
  initialData,
  countries,
  providers,
}: ScholarshipEditorProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const isAr = locale === 'ar';
  const isEdit = Boolean(initialData);

  const [titleEn, setTitleEn] = React.useState(initialData?.title_en || '');
  const [titleAr, setTitleAr] = React.useState(initialData?.title_ar || '');
  const [slug, setSlug] = React.useState(initialData?.slug || '');
  const [shortDescEn, setShortDescEn] = React.useState(
    initialData?.short_description_en || ''
  );
  const [shortDescAr, setShortDescAr] = React.useState(
    initialData?.short_description_ar || ''
  );
  const [descEn, setDescEn] = React.useState(initialData?.description_en || '');
  const [descAr, setDescAr] = React.useState(initialData?.description_ar || '');
  const [countryId, setCountryId] = React.useState(
    initialData?.country_id || countries[0]?.id || ''
  );
  const [providerId, setProviderId] = React.useState(
    initialData?.provider_id || providers[0]?.id || ''
  );
  const [fundingType, setFundingType] = React.useState<FundingType>(
    initialData?.funding_type || 'Fully Funded'
  );
  const [stipendAmount, setStipendAmount] = React.useState(
    initialData?.stipend_amount || ''
  );
  const [deadline, setDeadline] = React.useState(initialData?.deadline || '');
  const [status, setStatus] = React.useState<ScholarshipStatus>(
    initialData?.status || 'Open'
  );
  const [officialUrl, setOfficialUrl] = React.useState(
    initialData?.official_url || ''
  );
  const [degreeLevels, setDegreeLevels] = React.useState<DegreeLevel[]>(
    initialData?.degree_levels || ['Master']
  );
  const [eligibleNationalities, setEligibleNationalities] = React.useState(
    initialData?.eligible_nationalities || 'Global applicants'
  );
  const [eligibilityEn, setEligibilityEn] = React.useState(
    initialData?.eligibility_en?.join('\n') || ''
  );
  const [eligibilityAr, setEligibilityAr] = React.useState(
    initialData?.eligibility_ar?.join('\n') || ''
  );
  const [documentsEn, setDocumentsEn] = React.useState(
    initialData?.required_documents_en?.join('\n') || ''
  );
  const [documentsAr, setDocumentsAr] = React.useState(
    initialData?.required_documents_ar?.join('\n') || ''
  );
  const [featured, setFeatured] = React.useState(initialData?.featured || false);
  const [published, setPublished] = React.useState(
    initialData?.published !== undefined ? initialData.published : true
  );
  const [coverImage, setCoverImage] = React.useState<string | null>(
    initialData?.cover_image || null
  );

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDirty, setIsDirty] = React.useState(false);

  // Unsaved changes alert
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // Auto generate slug from titleEn if creating
  const handleTitleEnChange = (val: string) => {
    setTitleEn(val);
    markDirty();
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const toggleDegree = (deg: DegreeLevel) => {
    markDirty();
    setDegreeLevels((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Strict validation
    if (!titleEn.trim() || !titleAr.trim()) {
      setError(
        isAr
          ? 'يرجى إدخال عنوان المنحة باللغتين الإنجليزية والعربية'
          : 'Please enter scholarship titles in both English and Arabic'
      );
      setSaving(false);
      return;
    }

    if (!slug.trim()) {
      setError(
        isAr ? 'يرجى تحديد المعرّف (Slug)' : 'Please provide a valid URL slug'
      );
      setSaving(false);
      return;
    }

    if (!countryId) {
      setError(isAr ? 'يرجى اختيار دولة المنحة' : 'Please select a host country');
      setSaving(false);
      return;
    }

    if (!providerId) {
      setError(isAr ? 'يرجى اختيار الجهة المانحة' : 'Please select a scholarship provider');
      setSaving(false);
      return;
    }

    if (degreeLevels.length === 0) {
      setError(
        isAr
          ? 'يرجى اختيار مرحلة دراسية واحدة على الأقل'
          : 'Please select at least one eligible degree level'
      );
      setSaving(false);
      return;
    }

    if (!officialUrl.trim()) {
      setError(
        isAr
          ? 'يرجى إدخال رابط التقديم الرسمي'
          : 'Please enter the official application URL'
      );
      setSaving(false);
      return;
    }

    try {
      const parsedUrl = new URL(officialUrl.trim());
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error();
      }
    } catch {
      setError(
        isAr
          ? 'رابط التقديم الرسمي غير صالح (يجب أن يبدأ بـ https:// أو http://)'
          : 'The official application URL is invalid (must begin with https:// or http://)'
      );
      setSaving(false);
      return;
    }

    const eligibility_en = eligibilityEn
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const eligibility_ar = eligibilityAr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const required_documents_en = documentsEn
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const required_documents_ar = documentsAr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isEdit && initialData) {
        await updateScholarship(initialData.id, {
          title_en: titleEn.trim(),
          title_ar: titleAr.trim(),
          slug: slug.trim(),
          short_description_en: shortDescEn.trim(),
          short_description_ar: shortDescAr.trim(),
          description_en: descEn.trim(),
          description_ar: descAr.trim(),
          country_id: countryId,
          provider_id: providerId,
          funding_type: fundingType,
          stipend_amount: stipendAmount.trim(),
          deadline: deadline || null,
          status,
          official_url: officialUrl.trim(),
          degree_levels: degreeLevels,
          eligible_nationalities: eligibleNationalities.trim(),
          eligibility_en,
          eligibility_ar,
          required_documents_en,
          required_documents_ar,
          featured,
          published,
          cover_image: coverImage,
        });
      } else {
        await createScholarship({
          title_en: titleEn.trim(),
          title_ar: titleAr.trim(),
          slug: slug.trim() || `scholarship-${Date.now()}`,
          short_description_en: shortDescEn.trim(),
          short_description_ar: shortDescAr.trim(),
          description_en: descEn.trim(),
          description_ar: descAr.trim(),
          country_id: countryId,
          provider_id: providerId,
          funding_type: fundingType,
          funding_summary_en: `${fundingType} - ${stipendAmount.trim()}`,
          funding_summary_ar: `${fundingType} - ${stipendAmount.trim()}`,
          stipend_amount: stipendAmount.trim(),
          stipend_currency: null,
          deadline: deadline || null,
          application_open_date: null,
          status,
          official_url: officialUrl.trim(),
          degree_levels: degreeLevels,
          eligible_nationalities: eligibleNationalities.trim(),
          benefits: [],
          eligibility_en,
          eligibility_ar,
          required_documents_en,
          required_documents_ar,
          featured,
          published,
          cover_image: coverImage,
          logo_image: null,
          last_verified_at: new Date().toISOString().split('T')[0],
        });
      }

      setIsDirty(false);
      setSaving(false);
      router.push(`/${locale}/admin/scholarships?saved=true`);
    } catch (err: unknown) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Error saving scholarship');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/scholarships`}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-sans">
            {isEdit
              ? isAr
                ? 'تعديل المنحة الدراسية'
                : 'Edit Scholarship'
              : isAr
              ? 'إضافة منحة جديدة'
              : 'Create New Scholarship'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Bilingual Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isAr ? 'بيانات المنحة الأساسية' : 'Basic Identity'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.admin.titleEn} *
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => handleTitleEnChange(e.target.value)}
                placeholder="Chevening Scholarships UK"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.admin.titleAr} *
              </label>
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="منحة تشيفنينغ البريطانية"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="chevening-scholarships-uk"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.admin.shortDescEn}
              </label>
              <textarea
                rows={2}
                value={shortDescEn}
                onChange={(e) => setShortDescEn(e.target.value)}
                placeholder="One-year taught master's in the UK..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.admin.shortDescAr}
              </label>
              <textarea
                rows={2}
                value={shortDescAr}
                onChange={(e) => setShortDescAr(e.target.value)}
                placeholder="دراسة الماجستير لمدة عام في بريطانيا..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.admin.descEn}
              </label>
              <textarea
                rows={4}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.admin.descAr}
              </label>
              <textarea
                rows={4}
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Institution & Funding */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isAr ? 'الجهة المانحة والتمويل' : 'Provider & Financials'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'الجهة المانحة' : 'Provider'} *
              </label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_en} ({p.name_ar})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'الدولة' : 'Country'} *
              </label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name_en} ({c.name_ar})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'نوع التمويل' : 'Funding Type'} *
              </label>
              <select
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value as FundingType)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Fully Funded">Fully Funded</option>
                <option value="Partial Funding">Partial Funding</option>
                <option value="Tuition Only">Tuition Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'الراتب الشهري' : 'Stipend Amount'}
              </label>
              <input
                type="text"
                value={stipendAmount}
                onChange={(e) => setStipendAmount(e.target.value)}
                placeholder="£1,450 / month"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isAr ? 'الجنسيات المؤهلة' : 'Eligible Nationalities'}
            </label>
            <input
              type="text"
              value={eligibleNationalities}
              onChange={(e) => setEligibleNationalities(e.target.value)}
              placeholder="Global applicants / Most countries"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'الموعد النهائي' : 'Deadline'}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'حالة التقديم' : 'Application Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ScholarshipStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Open">Open</option>
                <option value="Opening Soon">Opening Soon</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.admin.officialUrl} *
              </label>
              <input
                type="url"
                required
                value={officialUrl}
                onChange={(e) => setOfficialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {isAr ? 'المراحل الأكاديمية' : 'Degree Levels'} *
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Bachelor', 'Master', 'PhD', 'Postdoctoral'] as DegreeLevel[]).map(
                (deg) => {
                  const active = degreeLevels.includes(deg);
                  return (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => toggleDegree(deg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {deg}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Requirements and Checklists */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isAr ? 'الشروط والوثائق المطلوبة' : 'Criteria & Checklists (One per line)'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'شروط الأهلية (بالإنجليزية)' : 'Eligibility Criteria (English)'}
              </label>
              <textarea
                rows={4}
                value={eligibilityEn}
                onChange={(e) => setEligibilityEn(e.target.value)}
                placeholder="One requirement per line..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'شروط الأهلية (بالعربية)' : 'Eligibility Criteria (Arabic)'}
              </label>
              <textarea
                rows={4}
                value={eligibilityAr}
                onChange={(e) => setEligibilityAr(e.target.value)}
                placeholder="شرط واحد في كل سطر..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'الوثائق المطلوبة (بالإنجليزية)' : 'Required Documents (English)'}
              </label>
              <textarea
                rows={4}
                value={documentsEn}
                onChange={(e) => setDocumentsEn(e.target.value)}
                placeholder="One document per line..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'الوثائق المطلوبة (بالعربية)' : 'Required Documents (Arabic)'}
              </label>
              <textarea
                rows={4}
                value={documentsAr}
                onChange={(e) => setDocumentsAr(e.target.value)}
                placeholder="وثيقة واحدة في كل سطر..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Media & Visual Assets */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isAr ? 'صورة الغلاف والوسائط' : 'Media & Cover Image'}
          </h3>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'ارفع صورة غلاف للمنحة بجودة عالية تظهر في دليل المنح وبطاقات العرض.'
              : 'Upload a high-quality cover image to appear on scholarship cards and details page.'}
          </p>
          <ImageUpload
            value={coverImage}
            onChange={(url) => {
              setCoverImage(url);
              markDirty();
            }}
            bucket="scholarship-covers"
            label={isAr ? 'صورة الغلاف' : 'Cover Image'}
            isArabic={isAr}
          />
        </div>

        {/* Publishing & Visibility */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>{isAr ? 'نشر المنحة للجمهور' : 'Publish to Live Directory'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>{isAr ? 'إبراز في الصفحة الرئيسية' : 'Feature on Homepage'}</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                {isAr ? 'تغييرات غير محفوظة' : 'Unsaved changes'}
              </span>
            )}
            <Link href={`/${locale}/admin/scholarships`}>
              <Button variant="outline" size="md">
                {t.admin.cancel}
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={saving}
              className="font-bold px-6"
            >
              {saving ? t.common.loading : t.admin.save}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
