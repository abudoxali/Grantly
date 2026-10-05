'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { locale, t } = useI18n();
  const { register, user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      router.push(`/${locale}/account/saved`);
    }
  }, [user, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(locale === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(
        locale === 'ar'
          ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل'
          : 'Password must be at least 6 characters long'
      );
      return;
    }

    setSubmitting(true);
    const res = await register(email, password, fullName, locale);
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
    } else {
      router.push(`/${locale}/account/saved`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:py-16">
      <div className="card-surface w-full max-w-md p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-balance text-2xl font-semibold text-text-primary">
            {t.auth.registerTitle}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {t.auth.registerSubtitle}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-danger-border bg-danger-soft p-3.5 text-sm text-danger-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t.auth.fullNameLabel}
            </label>
            <div className="relative">
              <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={locale === 'ar' ? 'أحمد المنصور' : 'Alex Johnson'}
                className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-3 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-3 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-3 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t.auth.confirmPasswordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-3 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full justify-center font-bold text-sm h-11"
              rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
            >
              {submitting ? t.common.loading : t.auth.registerButton}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>{t.auth.alreadyHaveAccount}</span>{' '}
          <Link
            href={`/${locale}/auth/login`}
            className="font-bold text-emerald-700 hover:underline ms-1"
          >
            {t.auth.loginButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
