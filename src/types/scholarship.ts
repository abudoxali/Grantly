export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD' | 'Postdoctoral';

export type FundingType = 'Fully Funded' | 'Partial Funding' | 'Tuition Only';

export type ScholarshipStatus = 'Open' | 'Opening Soon' | 'Closed';

export type StudyField =
  | 'Computer Science'
  | 'Engineering'
  | 'Medicine'
  | 'Business'
  | 'Science'
  | 'Arts & Humanities'
  | 'Social Sciences'
  | 'Law';

export interface ScholarshipBenefit {
  title: string;
  description: string;
}

export interface EligibilityCriterion {
  category: string;
  requirements: string[];
}

export interface Scholarship {
  id: string;
  slug: string;
  title: string;
  provider: string;
  providerType: 'Government' | 'University' | 'Foundation' | 'Organization';
  country: string;
  countryCode: string;
  flagEmoji: string;
  city?: string;
  fundingType: FundingType;
  fundingSummary: string;
  stipendAmount?: string;
  degreeLevels: DegreeLevel[];
  status: ScholarshipStatus;
  deadline: string; // ISO date string YYYY-MM-DD
  academicYear: string;
  overview: string;
  benefits: ScholarshipBenefit[];
  eligibility: EligibilityCriterion[];
  requiredDocuments: string[];
  fieldsOfStudy: string[];
  eligibleNationalities: string;
  officialWebsiteUrl: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  applicantTarget?: string;
  verifiedAt: string;
}

export interface FilterState {
  query: string;
  degrees: DegreeLevel[];
  fundingTypes: FundingType[];
  countries: string[];
  fields: string[];
  statuses: ScholarshipStatus[];
  sortBy: 'deadline-asc' | 'deadline-desc' | 'popular' | 'newest';
}

export interface CountryExploreItem {
  name: string;
  code: string;
  flagEmoji: string;
  scholarshipCount: number;
  featuredScholarship: string;
  topUniversities: string[];
  averageLivingCost: string;
}

export interface FieldExploreItem {
  name: string;
  slug: string;
  iconName: string;
  scholarshipCount: number;
  popularCareers: string[];
  featuredCount: number;
}

export interface GuideItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  author: string;
  publishedAt: string;
}
