'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { locale, t } = useI18n();
  const { login, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // If already logged in, redirect to saved or home
  React.useEffect(() => {
    if (user) {
      router.push(`/${locale}/account/saved`);
    }
  }, [user, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await login(email, password);
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
            {t.auth.loginTitle}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {t.auth.loginSubtitle}
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
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-email"
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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t.auth.passwordLabel}
              </label>
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-xs text-emerald-700 hover:underline"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-3 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full justify-center font-bold text-sm h-11"
              rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
            >
              {submitting ? t.common.loading : t.auth.loginButton}
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                onClick={() => {
                  setEmail('student@example.com');
                  setPassword('student123');
                }}
                className="min-h-11 text-center text-xs font-medium text-primary transition-colors hover:text-primary-hover"
              >
                {locale === 'ar'
                  ? 'ملء بيانات طالب تجريبي (student@example.com)'
                  : 'Fill Demo Scholar Credentials (student@example.com)'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>{t.auth.dontHaveAccount}</span>{' '}
          <Link
            href={`/${locale}/auth/register`}
            className="font-bold text-emerald-700 hover:underline ms-1"
          >
            {t.auth.registerButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
