import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grantly — Verified Global Scholarships & Official Portals',
  description:
    'Discover verified, fully funded international scholarships. Calculate authentic living allowances, compare eligibility, and apply directly to official university and government portals.',
  keywords: [
    'scholarships',
    'fully funded scholarships',
    'global education',
    'master scholarships',
    'phd scholarships',
    'chevening',
    'daad',
    'fulbright',
    'study abroad',
    'منح دراسية',
    'منح ماجستير',
    'منح ممولة بالكامل',
  ],
  authors: [{ name: 'Grantly Editorial Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Grantly — Verified Global Scholarships',
    description: 'Find verified global scholarships and official application portals with zero intermediary fees.',
    siteName: 'Grantly',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
