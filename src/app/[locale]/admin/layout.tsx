'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { Logo } from '@/components/brand/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  GraduationCap,
  Globe2,
  BookOpen,
  Users,
  LogOut,
  ExternalLink,
  Lock,
  Building2,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, t } = useI18n();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const pathname = usePathname() || '';

  // If path is admin login itself, render children directly without auth restriction
  if (pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  // If loading auth state
  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-slate-500">
        {t.common.loading}
      </div>
    );
  }

  // Enforce server & client role check
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {t.admin.adminAccessOnly}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            {locale === 'ar'
              ? 'هذه المنطقة مخصصة حصرياً للمشرفين المعتمدين في إدارة المنصة. يرجى تسجيل الدخول بحساب مسؤول للوصول.'
              : 'This management portal requires verified administrator credentials. Please sign in with an admin profile.'}
          </p>
          <div className="flex flex-col gap-2.5">
            <Link href={`/${locale}/admin/login`}>
              <Button variant="primary" size="md" className="w-full justify-center">
                {t.admin.loginAsAdmin}
              </Button>
            </Link>
            <Link href={`/${locale}`}>
              <Button variant="outline" size="md" className="w-full justify-center">
                {locale === 'ar' ? 'العودة للرئيسية' : 'Return to Website'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminNav = [
    {
      name: t.admin.overview,
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: t.admin.scholarships,
      href: `/${locale}/admin/scholarships`,
      icon: GraduationCap,
      exact: false,
    },
    {
      name: t.admin.providers,
      href: `/${locale}/admin/providers`,
      icon: Building2,
      exact: false,
    },
    {
      name: t.admin.countries,
      href: `/${locale}/admin/countries`,
      icon: Globe2,
      exact: false,
    },
    {
      name: t.admin.fields,
      href: `/${locale}/admin/fields`,
      icon: BookOpen,
      exact: false,
    },
    {
      name: t.admin.guides,
      href: `/${locale}/admin/guides`,
      icon: BookOpen,
      exact: false,
    },
    {
      name: t.admin.users,
      href: `/${locale}/admin/users`,
      icon: Users,
      exact: false,
    },
    {
      name: t.admin.account,
      href: `/${locale}/account/profile`,
      icon: UserCog,
      exact: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Logo size="sm" href={`/${locale}/admin`} />
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] tracking-wider uppercase border border-amber-200">
            Admin CMS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="minimal" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{user.email}</span>
          </div>
          <Link
            href={`/${locale}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 p-2 rounded-lg hover:bg-slate-50"
            title="Open Public Site"
          >
            <span>{locale === 'ar' ? 'الموقع العام' : 'Public Site'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title={t.common.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Body: Sidebar + Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs sticky top-24 space-y-1">
            {adminNav.map((item) => {
              const isActive = item.exact
                ? pathname === item.href || pathname === `${item.href}/`
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
