'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { Logo } from '@/components/brand/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  Terminal,
} from 'lucide-react';

export default function AdminLoginPage() {
  const { locale, t } = useI18n();
  const { login, logout, isAdmin, user } = useAuth();
  const router = useRouter();
  const isAr = locale === 'ar';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // If already authenticated as admin, route directly to admin dashboard
  React.useEffect(() => {
    if (user && isAdmin) {
      router.push(`/${locale}/admin`);
    }
  }, [user, isAdmin, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError(
        isAr
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
          : 'Please enter both email and password'
      );
      setLoading(false);
      return;
    }

    try {
      const res = await login(email, password);

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Explicit role validation: check if the authenticated profile is an administrator
      if (res.user && res.user.role !== 'admin') {
        await logout();
        setError(
          isAr
            ? 'تم التحقق من بيانات الحساب، لكن لا توجد صلاحيات مسؤول (Admin) مرتبطة بهذا الحساب. تم إنهاء الجلسة لأسباب أمنية.'
            : 'Access denied: This authenticated profile does not possess administrator privileges. The session was closed for security.'
        );
        setLoading(false);
        return;
      }

      // Successful admin login
      setLoading(false);
      router.push(`/${locale}/admin`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background p-4 sm:p-6 lg:p-8">
      {/* Standalone Admin Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 group">
          <Logo size="sm" asLink={false} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
            {isAr ? 'الموقع العام' : 'Public Site'}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Login Card Container */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="card-surface p-6 sm:p-8 lg:p-10">
          {/* Card Branding & Title */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-border/70 bg-primary-soft text-primary shadow-2xs">
              <ShieldCheck className="h-6 w-6 text-success-ink" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span>{isAr ? 'بوابة المشرفين' : 'Admin Portal'}</span>
            </div>

            <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-primary">
              {isAr ? 'تسجيل دخول المشرف' : 'Admin Portal Sign In'}
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-xs">
              {isAr
                ? 'الوصول المعتمد لمحرري المحتوى ومشرفي منصة منح جرانتلي.'
                : 'Authorized access for Grantly CMS editors and platform administrators.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div role="alert" className="mb-6 flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-soft p-4 text-sm leading-relaxed text-danger-ink">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grantly.org"
                  className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-4 text-sm text-text-primary placeholder:text-muted transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t.auth.passwordLabel}
                </label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-11 w-full rounded-xl border border-border bg-white py-2.5 ps-10 pe-14 text-sm text-text-primary placeholder:text-muted transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-1 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                  aria-label={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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
                {loading ? t.common.loading : t.admin.loginAsAdmin}
              </Button>
            </div>
          </form>

          {/* Development Bootstrap Guidance (Visible only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                <Terminal className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">
                    {isAr ? 'بيئة التطوير المحلية' : 'Local Development Notice'}
                  </span>
                  <span>
                    {isAr
                      ? 'لإنشاء حساب مشرف حقيقي أو ترقية حسابك، نفذ الأمر:'
                      : 'To create or promote an admin account via Supabase Admin API, run:'}
                  </span>
                  <code className="block mt-1 font-mono text-[10px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-900 select-all">
                    npm run bootstrap:admin
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Focused Shell Bottom Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Grantly Inc. &bull;{' '}
          {isAr ? 'بوابة الإدارة المعتمدة' : 'Authorized Personnel Only'}
        </p>
      </div>
    </div>
  );
}
