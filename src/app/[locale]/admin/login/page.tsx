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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Standalone Admin Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 group">
          <Logo size="sm" />
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
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm">
          {/* Card Branding & Title */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center mb-4 shadow-2xs">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{isAr ? 'بوابة المشرفين' : 'Admin Portal'}</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-950 font-sans tracking-tight">
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
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grantly.org"
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
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
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full ps-10 pe-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
