export type UserRole = 'user' | 'admin';
export type FundingType = 'Fully Funded' | 'Partial Funding' | 'Tuition Only';
export type ScholarshipStatus = 'Open' | 'Opening Soon' | 'Closed';
export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD' | 'Postdoctoral';

export interface ScholarshipBenefit {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  preferred_language: 'en' | 'ar';
  country: string | null;
  degree_level: DegreeLevel | null;
  academic_field: string | null;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  code: string;
  flag: string;
  description_en: string | null;
  description_ar: string | null;
  currency: string;
  living_cost_from: number | null;
  living_cost_to: number | null;
  featured: boolean;
  created_at: string;
  updated_at?: string;
  scholarship_count?: number;
}

export interface Field {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  icon: string;
  featured: boolean;
  created_at: string;
  updated_at?: string;
  scholarship_count?: number;
}

export interface Provider {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  country_id: string | null;
  provider_type: 'Government' | 'University' | 'Foundation' | 'Organization';
  website_url: string | null;
  logo_url: string | null;
  description_en: string | null;
  description_ar: string | null;
  verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Scholarship {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  short_description_en: string | null;
  short_description_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  provider_id: string | null;
  country_id: string | null;
  funding_type: FundingType;
  funding_summary_en: string | null;
  funding_summary_ar: string | null;
  stipend_amount: string | null;
  stipend_currency: string | null;
  deadline: string | null; // ISO YYYY-MM-DD
  application_open_date: string | null;
  status: ScholarshipStatus;
  official_url: string;
  degree_levels: DegreeLevel[];
  eligible_nationalities: string;
  benefits: ScholarshipBenefit[];
  eligibility_en: string[];
  eligibility_ar: string[];
  required_documents_en: string[];
  required_documents_ar: string[];
  featured: boolean;
  published: boolean;
  cover_image: string | null;
  logo_image: string | null;
  last_verified_at: string;
  created_at: string;
  updated_at: string;

  // Joined fields for display
  provider?: Provider | null;
  country?: Country | null;
  fields?: Field[];
}

export interface Guide {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  content_en: string;
  content_ar: string;
  category: string;
  cover_image: string | null;
  reading_time_minutes: number;
  published: boolean;
  featured: boolean;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  scholarship_id: string;
  created_at: string;
  scholarship?: Scholarship;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
      };
      countries: {
        Row: Country;
        Insert: Omit<Country, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Country>;
      };
      fields: {
        Row: Field;
        Insert: Omit<Field, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Field>;
      };
      providers: {
        Row: Provider;
        Insert: Omit<Provider, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Provider>;
      };
      scholarships: {
        Row: Scholarship;
        Insert: Omit<Scholarship, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Scholarship>;
      };
      guides: {
        Row: Guide;
        Insert: Omit<Guide, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Guide>;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: Omit<Bookmark, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Bookmark>;
      };
    };
  };
}
