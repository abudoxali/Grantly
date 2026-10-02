import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['en', 'ar'];
const DEFAULT_LOCALE = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, next internal files, and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if pathname has a supported locale prefix
  const matchedLocale = LOCALES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (matchedLocale) {
    const pathWithoutLocale =
      pathname.replace(new RegExp(`^/${matchedLocale}`), '') || '/';

    // SERVER-SIDE ADMIN ROUTE PROTECTION
    if (pathWithoutLocale.startsWith('/admin')) {
      const isAdminLogin = pathWithoutLocale === '/admin/login';

      if (!isAdminLogin) {
        const sessionRole = request.cookies.get('grantly_session_role')?.value;

        // If not logged in or not an admin, redirect server-side immediately
        if (sessionRole !== 'admin') {
          const loginUrl = request.nextUrl.clone();
          loginUrl.pathname = `/${matchedLocale}/admin/login`;
          loginUrl.searchParams.set('next', pathname);
          if (sessionRole === 'user') {
            loginUrl.searchParams.set('unauthorized', 'true');
          }
          return NextResponse.redirect(loginUrl);
        }
      }
    }

    return NextResponse.next();
  }

  // Determine user's preferred locale
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const targetLocale =
    cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  // Rewrite / redirect to locale path
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|api).*)'],
};
