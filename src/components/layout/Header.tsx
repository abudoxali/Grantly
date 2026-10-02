'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { Logo } from '@/components/brand/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Menu,
  X,
  Bookmark,
  User,
  ShieldAlert,
  LogOut,
  ArrowRight,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { locale, t } = useI18n();
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.includes('/admin')) {
    return null;
  }

  const navLinks = [
    { name: t.common.home, href: `/${locale}` },
    { name: t.common.scholarships, href: `/${locale}/scholarships` },
    { name: t.common.countries, href: `/${locale}/countries` },
    { name: t.common.fields, href: `/${locale}/fields` },
    { name: t.common.guides, href: `/${locale}/guides` },
    { name: t.common.about, href: `/${locale}/about` },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200 border-b',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-slate-200/90 shadow-xs'
          : 'bg-white/90 backdrop-blur-sm border-slate-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === `/${locale}`
                  ? pathname === `/${locale}` || pathname === `/${locale}/`
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative',
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-1.5 start-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Auth State */}
            {user ? (
              <div className="flex items-center gap-2 ms-1">
                <Link
                  href={`/${locale}/account/saved`}
                  className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title={t.common.savedScholarships}
                  aria-label={t.common.savedScholarships}
                >
                  <Bookmark className="w-4 h-4" />
                </Link>

                <Link
                  href={`/${locale}/account/profile`}
                  className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title={t.common.profile}
                  aria-label={t.common.profile}
                >
                  <User className="w-4 h-4" />
                </Link>

                {isAdmin && (
                  <Link
                    href={`/${locale}/admin`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t.nav.admin}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title={t.common.logout}
                  aria-label={t.common.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ms-1">
                <Link
                  href={`/${locale}/auth/login`}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  {t.common.login}
                </Link>
                <Link href={`/${locale}/scholarships`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-9 px-4 text-xs font-semibold"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
                  >
                    {t.nav.findScholarships}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <LanguageSwitcher variant="minimal" />
            <Link
              href={`/${locale}/scholarships`}
              className="p-2 text-slate-700 hover:text-emerald-600"
              aria-label={t.common.search}
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
            {navLinks.map((link) => {
              const isActive =
                link.href === `/${locale}`
                  ? pathname === `/${locale}` || pathname === `/${locale}/`
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-base font-medium flex items-center justify-between transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth and Action */}
          <div className="pt-4 flex flex-col gap-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 font-medium">
                  <span>{user.email}</span>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/${locale}/account/saved`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.common.savedScholarships}</span>
                  </Link>
                  <Link
                    href={`/${locale}/account/profile`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.common.profile}</span>
                  </Link>
                </div>
                {isAdmin && (
                  <Link
                    href={`/${locale}/admin`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>{t.admin.dashboard}</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.common.logout}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/${locale}/auth/login`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.common.login}
                </Link>
                <Link
                  href={`/${locale}/scholarships`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center text-sm font-semibold"
                    rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
                  >
                    {t.nav.findScholarships}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
