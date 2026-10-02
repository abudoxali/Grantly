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
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            {t.auth.resetPassword}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {locale === 'ar'
              ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك تعليمات استعادة كلمة المرور.'
              : 'Enter your registered email address and we will send you password reset instructions.'}
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-emerald-950">
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
            className="font-bold text-emerald-700 hover:underline"
          >
            ← {t.common.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
