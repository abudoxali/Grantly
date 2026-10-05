'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() || '';
  const isAr = pathname.split('/')[1] === 'ar';

  React.useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
      className="flex min-h-screen items-center justify-center bg-background p-4"
    >
      <div role="alert" className="card-surface w-full max-w-md p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-danger-border bg-danger-soft text-danger">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-balance text-xl font-semibold text-text-primary">
          {isAr ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
        </h1>
        <p className="mb-6 mt-3 text-sm leading-relaxed text-text-secondary">
          {isAr
            ? 'واجهنا مشكلة أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
            : 'We encountered an issue processing your request. Please try again.'}
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => reset()}
          leftIcon={<RotateCcw className="h-4 w-4" />}
          className="w-full justify-center"
        >
          {isAr ? 'حاول مرة أخرى' : 'Try again'}
        </Button>
      </div>
    </div>
  );
}
