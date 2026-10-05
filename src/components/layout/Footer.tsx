'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { Logo } from '@/components/brand/Logo';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  const { locale, t } = useI18n();
  const pathname = usePathname() || '';
  const isAr = locale === 'ar';

  if (pathname.includes('/admin')) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-800 bg-deep-plum text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo size="md" theme="dark" />

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {isAr
                ? 'بوصلتك نحو التعليم العالي المتميز. نساعد الطلاب في كافة أنحاء العالم على اكتشاف المنح الممولة بالكامل والتقديم المباشر عبر البوابات الرسمية.'
                : 'Your trusted gateway to global higher education. Grantly helps students worldwide discover fully funded scholarships and apply directly to official institution portals.'}
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-medium text-success-soft">
              <ShieldCheck className="h-4 w-4 shrink-0 text-success-soft" />
              <span>{t.common.officialSource}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'استكشف الفرص' : 'Explore'}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link
                  href={`/${locale}/scholarships`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {t.common.scholarships}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/countries`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {t.common.countries}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/fields`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {t.common.fields}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {t.common.guides}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {t.common.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Degrees */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'حسب المرحلة' : 'Degree Levels'}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link
                  href={`/${locale}/scholarships?degree=Master`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {isAr ? 'منح الماجستير' : "Master's Scholarships"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/scholarships?degree=PhD`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {isAr ? 'منح الدكتوراه والأبحاث' : 'PhD & Doctoral Grants'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/scholarships?degree=Bachelor`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {isAr ? 'منح البكالوريوس' : "Bachelor's Scholarships"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/scholarships?degree=Postdoctoral`}
                  className="hover:text-primary-200 transition-colors"
                >
                  {isAr ? 'أبحاث ما بعد الدكتوراه' : 'Postdoctoral Research'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'أبرز الوجهات' : 'Top Destinations'}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link
                  href={`/${locale}/scholarships?country=United+Kingdom`}
                  className="hover:text-primary-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>🇬🇧</span> {isAr ? 'المملكة المتحدة' : 'United Kingdom'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/scholarships?country=Germany`}
                  className="hover:text-primary-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>🇩🇪</span> {isAr ? 'ألمانيا' : 'Germany'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/scholarships?country=United+States`}
                  className="hover:text-primary-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>🇺🇸</span> {isAr ? 'الولايات المتحدة' : 'United States'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/scholarships?country=Japan`}
                  className="hover:text-primary-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>🇯🇵</span> {isAr ? 'اليابان' : 'Japan'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-400">
          <p className="max-w-2xl leading-relaxed">
            <strong className="text-slate-300 font-semibold">{isAr ? 'تنبيه:' : 'Notice:'}</strong>{' '}
            {t.common.disclaimer}
          </p>

          <div className="flex items-center gap-5 shrink-0 text-slate-400">
            <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
              {t.common.about}
            </Link>
            <Link href={`/${locale}/guides`} className="hover:text-white transition-colors">
              {t.common.guides}
            </Link>
            <span>© {new Date().getFullYear()} Grantly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
