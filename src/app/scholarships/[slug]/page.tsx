import { redirect } from 'next/navigation';

interface UnlocalizedSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UnlocalizedScholarshipDetailPage({
  params,
}: UnlocalizedSlugPageProps) {
  const { slug } = await params;
  redirect(`/en/scholarships/${slug}`);
}
