'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const pathname = usePathname() || '';
  const isAr = pathname.split('/')[1] === 'ar';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
      className="flex min-h-screen items-center justify-center bg-background p-4"
    >
      <div className="card-surface w-full max-w-md p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-border/70 bg-primary-soft text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-primary">
          404
        </span>
        <h1 className="text-balance text-2xl font-semibold text-text-primary">
          {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
        </h1>
        <p className="mb-6 mt-3 text-sm leading-relaxed text-text-secondary">
          {isAr
            ? 'تعذر العثور على المنحة أو الصفحة التي تبحث عنها. ربما نُقلت أو لم تُنشر بعد.'
            : 'The scholarship or page you are looking for could not be found. It may have moved or is not published yet.'}
        </p>
        <Link
          href={isAr ? '/ar' : '/en'}
          className="inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
        >
          {isAr ? 'العودة إلى الرئيسية' : 'Return to homepage'}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
