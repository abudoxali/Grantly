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
  Home,
  GraduationCap,
  Globe2,
  BookOpen,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { locale, t } = useI18n();
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const isAr = locale === 'ar';

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingInlineEnd = document.body.style.paddingInlineEnd;
    const trigger = menuButtonRef.current;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !mobileMenuRef.current) return;
      const focusable = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingInlineEnd = `${scrollbarWidth}px`;
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingInlineEnd = previousPaddingInlineEnd;
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [mobileMenuOpen]);

  if (pathname.includes('/admin')) {
    return null;
  }

  const navLinks = [
    { name: t.common.home, href: `/${locale}`, icon: Home },
    { name: t.common.scholarships, href: `/${locale}/scholarships`, icon: GraduationCap },
    { name: t.common.countries, href: `/${locale}/countries`, icon: Globe2 },
    { name: t.common.fields, href: `/${locale}/fields`, icon: BookOpen },
    {
      name: t.common.guides,
      mobileName: isAr ? 'أدلة وأدوات التقديم' : 'Guides & Application Tools',
      href: `/${locale}/guides`,
      icon: BookOpen,
    },
    { name: t.common.about, href: `/${locale}/about`, icon: Info },
  ];

  const isActive = (href: string) =>
    href === `/${locale}`
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(href);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-200',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-border shadow-xs'
          : 'bg-white/90 backdrop-blur-sm border-border/70'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-[88rem]">
        <div className="flex items-center justify-between h-16 sm:h-[4.5rem] 2xl:h-20">
          {/* Logo */}
          <div className="xl:hidden">
            <Logo size="sm" showSubtitle={false} />
          </div>
          <div className="hidden xl:block">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 2xl:gap-2" aria-label={isAr ? 'التنقل الرئيسي' : 'Main navigation'}>
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors 2xl:px-3.5 2xl:text-[0.9375rem]',
                    active
                      ? 'bg-primary-soft/70 text-primary font-semibold'
                      : 'text-slate-600 hover:bg-background hover:text-text-primary'
                  )}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-1 start-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary rtl:translate-x-1/2" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side Controls */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-2.5">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Auth State */}
            {user ? (
              <div className="flex items-center gap-1 ms-1">
                <Link
                  href={`/${locale}/account/saved`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary"
                  title={t.common.savedScholarships}
                  aria-label={t.common.savedScholarships}
                >
                  <Bookmark className="w-4 h-4" />
                </Link>

                <Link
                  href={`/${locale}/account/profile`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary"
                  title={t.common.profile}
                  aria-label={t.common.profile}
                >
                  <User className="w-4 h-4" />
                </Link>

                {isAdmin && (
                  <Link
                    href={`/${locale}/admin`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t.nav.admin}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                  title={t.common.logout}
                  aria-label={t.common.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ms-1">
                <Link
                  href={`/${locale}/auth/login`}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 transition-colors hover:text-primary"
                >
                  {t.common.login}
                </Link>
                <Link
                  href={`/${locale}/scholarships`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 2xl:text-sm"
                >
                  {t.nav.findScholarships}
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1 xl:hidden">
            <LanguageSwitcher variant="minimal" className="px-2.5" />
            <Link
              href={`/${locale}/scholarships`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
              aria-label={t.common.search}
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
              aria-label={mobileMenuOpen ? (isAr ? 'إغلاق قائمة التنقل' : 'Close navigation menu') : (isAr ? 'فتح قائمة التنقل' : 'Open navigation menu')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <button
            type="button"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-deep-plum/35 backdrop-blur-[2px]"
            aria-label={isAr ? 'إغلاق قائمة التنقل' : 'Close navigation menu'}
          />
          <div
            ref={mobileMenuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? 'قائمة التنقل' : 'Navigation menu'}
            className="mobile-drawer-enter absolute inset-y-0 end-0 z-10 flex h-[100dvh] w-[min(100%,28rem)] flex-col overflow-y-auto bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo size="sm" showSubtitle={false} />
              <button
                type="button"
                onClick={closeMobileMenu}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary"
                aria-label={isAr ? 'إغلاق القائمة' : 'Close menu'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
              <span className="text-sm font-semibold text-text-secondary">
                {isAr ? 'اللغة' : 'Language'}
              </span>
              <LanguageSwitcher onSwitch={closeMobileMenu} />
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label={isAr ? 'التنقل الرئيسي' : 'Main navigation'}>
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'text-text-secondary hover:bg-background hover:text-text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{link.mobileName || link.name}</span>
                  </Link>
                );
              })}

              <div className="my-3 border-t border-border" />

              <Link
                href={`/${locale}/account/saved`}
                onClick={closeMobileMenu}
                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
              >
                <Bookmark className="h-5 w-5 shrink-0" />
                <span>{t.common.savedScholarships}</span>
              </Link>
              <Link
                href={`/${locale}/account/profile`}
                onClick={closeMobileMenu}
                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
              >
                <User className="h-5 w-5 shrink-0" />
                <span>{t.nav.account}</span>
              </Link>
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-50"
                >
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{t.admin.dashboard}</span>
                </Link>
              )}
            </nav>

            {/* Mobile Auth and Action */}
            <div className="border-t border-border bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 px-1 text-xs font-medium text-muted">
                    <span className="truncate">{user.email}</span>
                    {isAdmin && (
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-900">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.common.logout}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/${locale}/auth/login`}
                    onClick={closeMobileMenu}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-3 text-sm font-semibold text-text-primary transition-colors hover:bg-primary-soft"
                  >
                    {t.common.login}
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    onClick={closeMobileMenu}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    {t.common.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
