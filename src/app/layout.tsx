import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans, Playfair_Display, Caveat } from 'next/font/google';
import './globals.css';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-serif',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-handwriting',
  display: 'swap',
});

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
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }] },
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
    <html
      lang="en"
      className={`h-full antialiased ${ibmPlexArabic.variable} ${plusJakarta.variable} ${playfair.variable} ${caveat.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary font-sans selection:bg-primary-soft selection:text-text-primary">
        {children}
      </body>
    </html>
  );
}
