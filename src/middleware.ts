import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const LOCALES = ['en', 'ar'];
const DEFAULT_LOCALE = 'en';

export async function middleware(request: NextRequest) {
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
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const isProd = process.env.NODE_ENV === 'production';

        // In production, Supabase MUST be configured
        if (!supabaseUrl || !supabaseAnonKey) {
          if (isProd) {
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = `/${matchedLocale}/admin/login`;
            loginUrl.searchParams.set('error', 'backend_unconfigured');
            return NextResponse.redirect(loginUrl);
          }

          // Non-production without Supabase: check dev mock allowance
          const devMockAllowed = process.env.NEXT_PUBLIC_ALLOW_DEV_MOCK_ADMIN === 'true';
          const sessionRole = request.cookies.get('grantly_session_role')?.value;
          if (!devMockAllowed || sessionRole !== 'admin') {
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = `/${matchedLocale}/admin/login`;
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
          }
          return NextResponse.next();
        }

        // When Supabase is configured: strictly verify user with Supabase server
        let res = NextResponse.next({ request });
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              res = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                res.cookies.set(name, value, options)
              );
            },
          },
        });

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          const loginUrl = request.nextUrl.clone();
          loginUrl.pathname = `/${matchedLocale}/admin/login`;
          loginUrl.searchParams.set('next', pathname);
          return NextResponse.redirect(loginUrl);
        }

        // Verify role in public.profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          const loginUrl = request.nextUrl.clone();
          loginUrl.pathname = `/${matchedLocale}/admin/login`;
          loginUrl.searchParams.set('unauthorized', 'true');
          return NextResponse.redirect(loginUrl);
        }

        return res;
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
