'use client';

import * as React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          An unexpected error occurred
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          We encountered an issue processing your request. Please try again.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => reset()}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="w-full justify-center"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
