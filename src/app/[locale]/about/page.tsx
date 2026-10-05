import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import { ShieldCheck, HeartHandshake, Globe2, Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'عن منصة جرانتلي ورسالتنا التعليمية | جرانتلي'
      : 'About Grantly — Mission & Educational Philosophy | Grantly',
    description: isAr
      ? 'تعرف على رسالة منصة جرانتلي في توفير وصول عادل ومجاني للمنح الدراسية العالمية الموثقة وبوابات التقديم الرسمية.'
      : 'Learn about Grantly mission to democratize global higher education with verified scholarship data and zero intermediary barriers.',
  };
}

export default async function LocalizedAboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;
  const t = getDictionary(loc);
  const isAr = loc === 'ar';

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            {isAr ? 'عن منصة جرانتلي' : 'About Grantly'}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {isAr
              ? 'نبني منصة استكشاف تعليمية عالمية تربط الطلاب مباشرة بالفرص الموثقة دون أي وسطاء أو رسوم خفية.'
              : 'Building a transparent discovery platform that connects scholars worldwide directly to verified educational opportunities.'}
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xs space-y-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {isAr ? 'لماذا أنشأنا جرانتلي؟' : 'Why Grantly Exists'}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {isAr
                ? 'يواجه ملايين الطلاب الطموحين حول العالم صعوبة بالغة في الوصول إلى المنح الدراسية الحقيقية؛ فالإنترنت يعج بالمواقع المضللة، والإعلانات الوهمية، والوكلاء التجاريين الذين يتقاضون مبالغ باهظة لقاء معلومات يفترض أن تكون متاحة للجميع مجاناً. تأسست جرانتلي لتكون مصدراً موثوقاً ونقياً يقدم الحقيقة الأكاديمية والمالية بدقة وأمانة.'
                : 'Millions of ambitious students worldwide struggle to discover legitimate international funding. The internet is saturated with ad-heavy directories, outdated dead ends, and commercial brokers charging steep fees for information that governments and universities publish for free. Grantly was created to provide a verified, clean, and direct-to-source alternative.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {isAr ? 'بيانات أصلية وموثقة' : '100% Primary Sources'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'ندقق كل معيار وموعد نهائي مباشرة من البوابات الرسمية.'
                  : 'Every listing is verified directly against government and university records.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <HeartHandshake className="w-5 h-5 text-emerald-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {isAr ? 'مجانية بالكامل' : 'Zero Intermediary Fees'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'لا نتقاضى أي رسوم من الطلاب للبحث أو التقديم.'
                  : 'Free forever for students. No paid placement agents or paywalls.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <Globe2 className="w-5 h-5 text-emerald-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {isAr ? 'وصول عادل للجميع' : 'Global Inclusivity'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'دعم كامل للغتين العربية والإنجليزية لتيسير الوصول.'
                  : 'Full Arabic and English bilingual parity for international applicants.'}
              </p>
            </div>
          </div>
        </div>

        {/* Integrity Notice */}
        <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 mb-3">
            {isAr ? 'التزامنا الأخلاقي المستمر' : 'Our Commitment to Integrity'}
          </h2>
          <p className="text-sm text-emerald-800 leading-relaxed max-w-2xl mx-auto mb-6">
            {isAr
              ? 'جرانتلي منصة مستقلة تماماً. نحن لا نقبل طلبات التقديم نيابة عن الطلاب، ولا نضمن القبول لأحد، ونوجه الجميع دائماً إلى الموقع الرسمي للمنحة. نجاحنا يقاس بعدد الطلاب الذين يصلون إلى البوابات الرسمية بثقة ووضوح.'
              : 'Grantly is strictly independent. We do not act as admissions representatives, accept application fees, or guarantee admissions. We empower students with clear intelligence and direct official links.'}
          </p>
          <Link href={`/${locale}/scholarships`}>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              className="font-bold px-6"
            >
              {t.nav.findScholarships}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
