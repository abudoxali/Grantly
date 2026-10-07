import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  dateString: string | null | undefined,
  locale: 'en' | 'ar' = 'en'
): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    if (locale === 'ar') {
      return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatStipend(
  stipend: string | null | undefined,
  locale: 'en' | 'ar' = 'en'
): string {
  if (!stipend) {
    return locale === 'ar' ? 'حسب الجامعة والبرنامج' : 'Varies by host';
  }

  if (locale === 'en') {
    return stipend;
  }

  // Arabic natural formatting
  let result = stipend.trim();

  // Normalize frequency
  result = result
    .replace(/\/\s*month\b/gi, '/ شهرياً')
    .replace(/\/\s*mo\b/gi, '/ شهرياً')
    .replace(/\/\s*year\b/gi, '/ سنوياً')
    .replace(/\/\s*yr\b/gi, '/ سنوياً');

  // Translate common benefits / tuition phrases
  result = result
    .replace(/Fully Funded \+/gi, 'تمويل كامل + ')
    .replace(/100% tuition \+/gi, 'إعفاء 100% من الرسوم + ')
    .replace(/Tuition \+/gi, 'إعفاء الرسوم + ');

  // Translate currency symbols into natural Arabic notation (Amount Currency / Period)
  result = result
    .replace(/€\s*([\d,]+)/g, '$1 يورو')
    .replace(/£\s*([\d,]+)/g, '$1 جنيه إسترليني')
    .replace(/\$\s*([\d,]+)/g, '$1 دولار')
    .replace(/¥\s*([\d,]+)/g, '$1 ين ياباني')
    .replace(/CAD\s*\$?\s*([\d,]+)/gi, '$1 دولار كندي')
    .replace(/AUD\s*\$?\s*([\d,]+)/gi, '$1 دولار أسترالي')
    .replace(/([\d,]+)\s*KRW/gi, '$1 وون كوري')
    .replace(/([\d,]+)\s*SEK/gi, '$1 كرونة سويدية');

  return result;
}

export function formatLivingCost(
  from: number | null | undefined,
  to: number | null | undefined,
  currency: string = 'EUR',
  locale: 'en' | 'ar' = 'en'
): string {
  if (from === null || from === undefined) return '';

  const currencyMapAr: Record<string, string> = {
    EUR: 'يورو',
    GBP: 'جنيه إسترليني',
    USD: 'دولار',
    CAD: 'دولار كندي',
    AUD: 'دولار أسترالي',
    JPY: 'ين ياباني',
    KRW: 'وون كوري',
    SEK: 'كرونة سويدية',
    TRY: 'ليرة تركية',
    SAR: 'ريال سعودي',
    AED: 'درهم إماراتي',
  };

  const currencySymbolEn: Record<string, string> = {
    EUR: '€',
    GBP: '£',
    USD: '$',
    CAD: 'CA$',
    AUD: 'AU$',
    JPY: '¥',
  };

  const formattedFrom = from.toLocaleString();
  const formattedTo = to ? to.toLocaleString() : null;

  if (locale === 'ar') {
    const curName = currencyMapAr[currency.toUpperCase()] || currency;
    if (formattedTo) {
      return `~ ${formattedFrom} - ${formattedTo} ${curName} / شهرياً`;
    }
    return `~ ${formattedFrom} ${curName} / شهرياً`;
  }

  const symbol = currencySymbolEn[currency.toUpperCase()] || currency + ' ';
  if (formattedTo) {
    return `~${symbol}${formattedFrom} - ${symbol}${formattedTo} / month`;
  }
  return `~${symbol}${formattedFrom} / month`;
}

export function formatGuideCategory(
  category: string | null | undefined,
  locale: 'en' | 'ar' = 'en'
): string {
  if (!category) return '';
  if (locale === 'en') return category;

  const categoryMapAr: Record<string, string> = {
    'Application Strategy': 'استراتيجية التقديم',
    'Resume & CV': 'السيرة الذاتية والأكاديمية',
    'Language Tests': 'اختبارات اللغة الدولية',
    'Interviews': 'المقابلات الشخصية',
    'Visa & Travel': 'التأشيرة والسفر',
    'Scholarship Search': 'البحث عن المنح',
    'General': 'دليل عام',
  };

  return categoryMapAr[category] || category;
}

export function formatDegreeLevel(
  level: string,
  locale: 'en' | 'ar' = 'en'
): string {
  if (locale === 'en') return level;
  switch (level.toLowerCase()) {
    case 'bachelor':
      return 'بكالوريوس';
    case 'master':
      return 'ماجستير';
    case 'phd':
      return 'دكتوراه';
    case 'postdoctoral':
      return 'ما بعد الدكتوراه';
    default:
      return level;
  }
}

export function getDaysRemaining(deadlineString: string): { days: number; isUrgent: boolean; isExpired: boolean } {
  try {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      isUrgent: diffDays > 0 && diffDays <= 30,
      isExpired: diffDays < 0,
    };
  } catch {
    return { days: 0, isUrgent: false, isExpired: false };
  }
}

export function getScholarshipCoverImage(scholarship: {
  id?: string;
  slug?: string;
  cover_image?: string | null;
  country?: { code?: string } | null;
}): string {
  if (scholarship.cover_image && scholarship.cover_image.trim().length > 0) {
    return scholarship.cover_image;
  }
  const slug = (scholarship.slug || '').toLowerCase();
  const countryCode = (scholarship.country?.code || '').toUpperCase();

  if (slug.includes('chevening') || countryCode === 'GB' || slug.includes('uk')) {
    return '/images/oxford.jpg';
  }
  if (slug.includes('daad') || countryCode === 'DE' || slug.includes('german')) {
    return '/images/berlin.jpg';
  }
  if (slug.includes('mext') || countryCode === 'JP' || slug.includes('japan')) {
    return '/images/fuji.jpg';
  }
  if (slug.includes('eiffel') || countryCode === 'FR' || slug.includes('france')) {
    return '/images/paris.jpg';
  }
  if (countryCode === 'CA' || slug.includes('vanier') || slug.includes('canada')) {
    return '/images/canada.jpg';
  }
  if (countryCode === 'US' || slug.includes('fulbright') || slug.includes('usa')) {
    return '/images/usa.jpg';
  }
  if (countryCode === 'AU' || slug.includes('australia')) {
    return '/images/australia.jpg';
  }
  if (countryCode === 'TR' || slug.includes('turkiye') || slug.includes('turkey')) {
    return '/images/turkey.jpg';
  }

  const pool = [
    '/images/oxford.jpg',
    '/images/berlin.jpg',
    '/images/fuji.jpg',
    '/images/paris.jpg',
    '/images/canada.jpg',
    '/images/usa.jpg',
    '/images/australia.jpg',
    '/images/turkey.jpg',
  ];
  let sum = 0;
  for (let i = 0; i < (scholarship.slug || scholarship.id || '').length; i++) {
    sum += (scholarship.slug || scholarship.id || '').charCodeAt(i);
  }
  return pool[sum % pool.length];
}

export function getCountryCoverImage(country: {
  id?: string;
  code?: string;
  cover_image?: string | null;
}): string {
  if (country.cover_image && country.cover_image.trim().length > 0) {
    return country.cover_image;
  }
  const code = (country.code || '').toUpperCase();
  switch (code) {
    case 'GB':
      return '/images/oxford.jpg';
    case 'DE':
      return '/images/berlin.jpg';
    case 'JP':
      return '/images/fuji.jpg';
    case 'FR':
      return '/images/paris.jpg';
    case 'CA':
      return '/images/canada.jpg';
    case 'US':
      return '/images/usa.jpg';
    case 'AU':
      return '/images/australia.jpg';
    case 'TR':
      return '/images/turkey.jpg';
    default: {
      const pool = [
        '/images/oxford.jpg',
        '/images/berlin.jpg',
        '/images/fuji.jpg',
        '/images/paris.jpg',
        '/images/canada.jpg',
        '/images/usa.jpg',
        '/images/australia.jpg',
        '/images/turkey.jpg',
      ];
      let sum = 0;
      for (let i = 0; i < (country.code || country.id || '').length; i++) {
        sum += (country.code || country.id || '').charCodeAt(i);
      }
      return pool[sum % pool.length];
    }
  }
}
