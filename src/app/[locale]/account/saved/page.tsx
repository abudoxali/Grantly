'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { getBookmarks } from '@/lib/db/repository';
import type { Bookmark } from '@/lib/supabase/types';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Bookmark as BookmarkIcon, ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SavedScholarshipsPage() {
  const { locale, t } = useI18n();
  const { user, isLoading } = useAuth();
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;
    if (user?.id) {
      getBookmarks(user.id).then((data) => {
        if (!ignore) {
          setBookmarks(data);
          setLoading(false);
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const refreshBookmarks = React.useCallback(() => {
    if (user) {
      getBookmarks(user.id).then(setBookmarks);
    }
  }, [user]);

  if (isLoading || (user && loading)) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        {t.common.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 sm:py-24">
        <div className="card-surface w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-border/70 bg-primary-soft text-primary">
            <BookmarkIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {t.account.savedScholarshipsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            {locale === 'ar'
              ? 'يرجى تسجيل الدخول إلى حسابك لعرض المنح المحفوظة ومتابعة مواعيد التقديم.'
              : 'Please log in to your account to view your bookmarked scholarships and track deadlines.'}
          </p>
          <Link href={`/${locale}/auth/login`}>
            <Button variant="primary" size="md" className="w-full justify-center">
              {t.common.login}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const validScholarships = bookmarks
    .map((b) => b.scholarship)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>{t.account.savedScholarshipsTitle}</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {t.account.savedScholarshipsTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {t.account.savedScholarshipsSubtitle}
          </p>
        </div>

        {validScholarships.length === 0 ? (
          <EmptyState
            icon={Compass}
            title={t.account.noSavedScholarships}
            description={t.account.exploreAndSave}
            action={
              <Link href={`/${locale}/scholarships`}>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}
                >
                  {t.nav.findScholarships}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validScholarships.map((s) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                onBookmarkChange={refreshBookmarks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
