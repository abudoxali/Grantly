'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { addBookmark, removeBookmark, isBookmarked } from '@/lib/db/repository';
import type { Scholarship } from '@/lib/supabase/types';
import { Bookmark, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ScholarshipDetailClientProps {
  scholarship: Scholarship;
}

export function ScholarshipDetailClient({
  scholarship,
}: ScholarshipDetailClientProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    if (user?.id) {
      isBookmarked(user.id, scholarship.id).then((val) => {
        if (!ignore) setSaved(val);
      });
    }
    return () => {
      ignore = true;
    };
  }, [user?.id, scholarship.id]);

  const toggleBookmark = async () => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setLoading(true);
    if (saved) {
      await removeBookmark(user.id, scholarship.id);
      setSaved(false);
    } else {
      await addBookmark(user.id, scholarship.id);
      setSaved(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
      <Button
        variant={saved ? 'outline' : 'outline'}
        size="md"
        onClick={toggleBookmark}
        disabled={loading}
        className={saved ? 'border-emerald-500 text-emerald-800 bg-emerald-50' : ''}
        leftIcon={<Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-600' : ''}`} />}
      >
        {saved ? t.common.removeSaved : t.common.saveScholarship}
      </Button>

      <a
        href={scholarship.official_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto"
      >
        <Button
          variant="primary"
          size="md"
          className="w-full sm:w-auto font-bold h-11 px-5"
          rightIcon={<ExternalLink className="w-4 h-4 rtl:rotate-180" />}
        >
          {t.details.proceedToOfficialPortal}
        </Button>
      </a>
    </div>
  );
}
