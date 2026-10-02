'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';
import type { DegreeLevel } from '@/lib/supabase/types';

export default function ProfilePage() {
  const { locale, t } = useI18n();
  const { user, profile, updateUserProfile, isLoading } = useAuth();

  const [syncedProfileId, setSyncedProfileId] = React.useState<string | null>(profile?.id || null);
  const [fullName, setFullName] = React.useState(profile?.full_name || '');
  const [country, setCountry] = React.useState(profile?.country || '');
  const [degreeLevel, setDegreeLevel] = React.useState<DegreeLevel>(
    profile?.degree_level || 'Master'
  );
  const [academicField, setAcademicField] = React.useState(
    profile?.academic_field || ''
  );
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  if (profile && profile.id !== syncedProfileId) {
    setSyncedProfileId(profile.id);
    setFullName(profile.full_name || '');
    setCountry(profile.country || '');
    if (profile.degree_level) setDegreeLevel(profile.degree_level);
    setAcademicField(profile.academic_field || '');
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        {t.common.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
          <User className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {t.account.myProfile}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            {locale === 'ar'
              ? 'يرجى تسجيل الدخول لعرض وتحديث بيانات ملفك الشخصي.'
              : 'Please log in to view and update your profile settings.'}
          </p>
          <Link href={`/${locale}/auth/login`}>
            <Button variant="primary" size="md" className="w-full justify-center">
              {t.common.login}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const res = await updateUserProfile({
      full_name: fullName,
      country,
      degree_level: degreeLevel,
      academic_field: academicField,
    });

    setSaving(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>{t.account.myProfile}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
            {t.account.profileSettings}
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.account.profileUpdated}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-semibold text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.auth.emailLabel}
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.auth.fullNameLabel}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {locale === 'ar' ? 'بلد الإقامة' : 'Country of Residence'}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={locale === 'ar' ? 'مصر، السعودية، المغرب...' : 'United Kingdom, Canada...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.auth.degreeLevel}
                </label>
                <select
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                >
                  <option value="Bachelor">{locale === 'ar' ? 'بكالوريوس' : 'Bachelor'}</option>
                  <option value="Master">{locale === 'ar' ? 'ماجستير' : 'Master'}</option>
                  <option value="PhD">{locale === 'ar' ? 'دكتوراه' : 'PhD'}</option>
                  <option value="Postdoctoral">{locale === 'ar' ? 'ما بعد الدكتوراه' : 'Postdoctoral'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.auth.academicField}
              </label>
              <input
                type="text"
                value={academicField}
                onChange={(e) => setAcademicField(e.target.value)}
                placeholder={locale === 'ar' ? 'علوم الحاسوب، الذكاء الاصطناعي...' : 'Computer Science, AI...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saving}
                className="font-bold px-6 h-11"
              >
                {saving ? t.common.loading : t.account.saveChanges}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
