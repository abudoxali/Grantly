'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(
        isAr
          ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.'
          : 'Password must be at least 8 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isAr
          ? 'كلمتا المرور غير متطابقتين.'
          : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update password');
        setLoading(false);
      }
    } else {
      // Offline / dev fallback
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            {isAr ? 'إعادة تعيين كلمة المرور' : 'Create New Password'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'أدخل كلمة مرور جديدة وقوية لحماية حسابك.'
              : 'Choose a strong, secure password for your Grantly account.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div>
              <p className="text-sm font-bold text-emerald-950 mb-1">
                {isAr
                  ? 'تم تحديث كلمة المرور بنجاح!'
                  : 'Password updated successfully!'}
              </p>
              <p className="text-xs text-emerald-800">
                {isAr
                  ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.'
                  : 'You can now sign in using your new credentials.'}
              </p>
            </div>
            <div className="pt-2">
              <Link href={`/${locale}/auth/login`}>
                <Button variant="primary" size="md" className="w-full justify-center font-bold">
                  {t.auth.loginButton}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full ps-10 pe-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.auth.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full ps-10 pe-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full justify-center font-bold text-sm h-11"
                rightIcon={
                  loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  )
                }
              >
                {loading ? t.common.loading : (isAr ? 'حفظ كلمة المرور الجديدة' : 'Update Password')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
