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
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 sm:py-20">
        <div className="card-surface w-full max-w-md p-8 text-center">
          <User className="mx-auto mb-4 h-10 w-10 text-primary" />
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
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>{t.account.myProfile}</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary">
            {t.account.profileSettings}
          </h1>
        </div>

        <div className="card-surface p-6 sm:p-8">
          {success && (
            <div role="status" className="mb-6 flex items-center gap-2 rounded-xl border border-success-border bg-success-soft p-4 text-sm font-semibold text-success-ink">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <span>{t.account.profileUpdated}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="mb-6 flex items-center gap-2 rounded-xl border border-danger-border bg-danger-soft p-4 text-sm font-semibold text-danger-ink">
              <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="profile-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t.auth.emailLabel}
              </label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t.auth.fullNameLabel}
              </label>
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-country" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {locale === 'ar' ? 'بلد الإقامة' : 'Country of Residence'}
                </label>
                <input
                  id="profile-country"
                  type="text"
                  autoComplete="country-name"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={locale === 'ar' ? 'مصر، السعودية، المغرب...' : 'United Kingdom, Canada...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div>
                <label htmlFor="profile-degree" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.auth.degreeLevel}
                </label>
                <select
                  id="profile-degree"
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="Bachelor">{locale === 'ar' ? 'بكالوريوس' : 'Bachelor'}</option>
                  <option value="Master">{locale === 'ar' ? 'ماجستير' : 'Master'}</option>
                  <option value="PhD">{locale === 'ar' ? 'دكتوراه' : 'PhD'}</option>
                  <option value="Postdoctoral">{locale === 'ar' ? 'ما بعد الدكتوراه' : 'Postdoctoral'}</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="profile-field" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t.auth.academicField}
              </label>
              <input
                id="profile-field"
                type="text"
                value={academicField}
                onChange={(e) => setAcademicField(e.target.value)}
                placeholder={locale === 'ar' ? 'علوم الحاسوب، الذكاء الاصطناعي...' : 'Computer Science, AI...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15"
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
