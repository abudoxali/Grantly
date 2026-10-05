'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { locale, t } = useI18n();
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
        });
      } catch {
        // Fallback
      }
    }

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:py-16">
      <div className="card-surface w-full max-w-md p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-balance text-2xl font-semibold text-text-primary">
            {t.auth.resetPassword}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {locale === 'ar'
              ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك تعليمات استعادة كلمة المرور.'
              : 'Enter your registered email address and we will send you password reset instructions.'}
          </p>
        </div>

        {sent ? (
          <div role="status" className="space-y-3 rounded-2xl border border-success-border bg-success-soft p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <p className="text-sm font-semibold text-success-ink">
              {locale === 'ar'
                ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
                : 'A password reset link has been dispatched to your email address.'}
            </p>
            <div className="pt-2">
              <Link href={`/${locale}/auth/login`}>
                <Button variant="outline" size="sm">
                  {t.common.login}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-password-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="forgot-password-email"
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

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full justify-center font-bold text-sm h-11"
                rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              >
                {loading ? t.common.loading : t.auth.sendResetLink}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs">
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold text-primary transition-colors hover:bg-primary-soft"
          >
            <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
            <span>{t.common.login}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
