import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <Compass className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
          404 Error
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 font-sans mb-3">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          The opportunity or destination you are searching for does not exist or may have been relocated.
        </p>
        <Link href="/en">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
