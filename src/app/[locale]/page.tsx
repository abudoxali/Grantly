import { notFound } from 'next/navigation';
import { HomeHero } from '@/components/home/HomeHero';
import { FeaturedScholarships } from '@/components/home/FeaturedScholarships';
import { ExploreByDegree } from '@/components/home/ExploreByDegree';
import { ExploreByDestination } from '@/components/home/ExploreByDestination';
import { PopularFields } from '@/components/home/PopularFields';
import { HowGrantlyWorks } from '@/components/home/HowGrantlyWorks';
import { StudentGuidesSection } from '@/components/home/StudentGuidesSection';
import { TrustSection } from '@/components/home/TrustSection';
import { FinalCTA } from '@/components/home/FinalCTA';
import {
  getScholarships,
  getCountries,
  getFields,
  getGuides,
} from '@/lib/db/repository';
import { isValidLocale } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalizedHomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const loc = locale as Locale;

  // Fetch real data from database repository
  const [{ scholarships }, countries, fields, guides] = await Promise.all([
    getScholarships({ publishedOnly: true }, loc),
    getCountries(),
    getFields(),
    getGuides(true),
  ]);

  const featuredList = scholarships.filter((s) => s.featured);
  const displayScholarships = featuredList.length > 0 ? featuredList : scholarships;

  return (
    <div className="flex flex-col min-h-screen">
      <HomeHero
        stats={{
          scholarshipCount: scholarships.length,
          countryCount: countries.length,
        }}
      />
      <FeaturedScholarships scholarships={displayScholarships} />
      <ExploreByDegree />
      <ExploreByDestination countries={countries} />
      <PopularFields fields={fields} />
      <HowGrantlyWorks />
      <StudentGuidesSection guides={guides} />
      <TrustSection />
      <FinalCTA />
    </div>
  );
}
