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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:py-16">
      <div className="card-surface w-full max-w-md p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-balance text-2xl font-semibold text-text-primary">
            {isAr ? 'إعادة تعيين كلمة المرور' : 'Create New Password'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'أدخل كلمة مرور جديدة وقوية لحماية حسابك.'
              : 'Choose a strong, secure password for your Grantly account.'}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-soft p-4 text-sm text-danger-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div role="status" className="space-y-4 rounded-2xl border border-success-border bg-success-soft p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <div>
              <p className="mb-1 text-sm font-semibold text-success-ink">
                {isAr
                  ? 'تم تحديث كلمة المرور بنجاح!'
                  : 'Password updated successfully!'}
              </p>
              <p className="text-sm text-success-ink">
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
              <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-14 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-1 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                  aria-label={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t.auth.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-14 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
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
