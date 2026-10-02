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
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            {t.auth.loginTitle}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full ps-10 pe-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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

            <button
              type="button"
              onClick={() => {
                setEmail('student@example.com');
                setPassword('student123');
              }}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium py-1 text-center"
            >
              {locale === 'ar'
                ? 'ملء بيانات طالب تجريبي (student@example.com)'
                : 'Fill Demo Scholar Credentials (student@example.com)'}
            </button>
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
