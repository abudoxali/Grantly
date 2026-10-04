-- ==============================================================================
-- Migration: 20261004000001_initial_schema.sql
-- Description: Core database schema, tables, enums, constraints, and base indexes
-- Compatibility: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
  country TEXT,
  degree_level TEXT,
  academic_field TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. COUNTRIES TABLE
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  code VARCHAR(5) NOT NULL,
  flag TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  currency TEXT DEFAULT 'USD',
  living_cost_from INTEGER,
  living_cost_to INTEGER,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_countries_slug ON public.countries(slug);
CREATE INDEX IF NOT EXISTS idx_countries_code ON public.countries(code);

-- 5. ACADEMIC FIELDS TABLE
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fields_slug ON public.fields(slug);

-- 6. PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  provider_type TEXT NOT NULL DEFAULT 'Government',
  website_url TEXT,
  logo_url TEXT,
  description_en TEXT,
  description_ar TEXT,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_slug ON public.providers(slug);

-- 7. SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  short_description_en TEXT,
  short_description_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  funding_type TEXT NOT NULL CHECK (funding_type IN ('Fully Funded', 'Partial Funding', 'Tuition Only')),
  funding_summary_en TEXT,
  funding_summary_ar TEXT,
  stipend_amount TEXT,
  stipend_currency TEXT,
  deadline DATE,
  application_open_date DATE,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Opening Soon', 'Closed')),
  official_url TEXT NOT NULL,
  source_url TEXT,
  degree_levels TEXT[] NOT NULL DEFAULT '{}',
  eligible_nationalities TEXT NOT NULL DEFAULT 'Global',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  eligibility_en TEXT[] NOT NULL DEFAULT '{}',
  eligibility_ar TEXT[] NOT NULL DEFAULT '{}',
  required_documents_en TEXT[] NOT NULL DEFAULT '{}',
  required_documents_ar TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending_review', 'unverified')),
  last_verified_at DATE DEFAULT CURRENT_DATE,
  cover_image TEXT,
  logo_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarships_slug ON public.scholarships(slug);
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON public.scholarships(country_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_funding ON public.scholarships(funding_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_status ON public.scholarships(status);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_published ON public.scholarships(published);
CREATE INDEX IF NOT EXISTS idx_scholarships_featured ON public.scholarships(featured);

-- 8. SCHOLARSHIP_FIELDS JOIN TABLE
CREATE TABLE IF NOT EXISTS public.scholarship_fields (
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  PRIMARY KEY (scholarship_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_scholarship_fields_field ON public.scholarship_fields(field_id);

-- 9. GUIDES TABLE
CREATE TABLE IF NOT EXISTS public.guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  excerpt_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  author TEXT NOT NULL DEFAULT 'Grantly Editorial Team',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guides_slug ON public.guides(slug);
CREATE INDEX IF NOT EXISTS idx_guides_published ON public.guides(published);

-- 10. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_scholarship ON public.bookmarks(scholarship_id);
