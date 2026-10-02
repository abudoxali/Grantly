-- ==============================================================================
-- Grantly Database Schema & Row Level Security (RLS) Policies
-- PostgreSQL / Supabase Free-Tier Compatible
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
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

-- Index for profiles
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

-- 6. PROVIDERS TABLE (Universities, Governments, Foundations)
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
  degree_levels TEXT[] NOT NULL DEFAULT '{}',
  eligible_nationalities TEXT NOT NULL DEFAULT 'Global',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  eligibility_en TEXT[] NOT NULL DEFAULT '{}',
  eligibility_ar TEXT[] NOT NULL DEFAULT '{}',
  required_documents_en TEXT[] NOT NULL DEFAULT '{}',
  required_documents_ar TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  cover_image TEXT,
  logo_image TEXT,
  last_verified_at DATE DEFAULT CURRENT_DATE,
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone logged in can read their own profile; admins can read all profiles
CREATE POLICY "Users can read own profile or admins all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (e.g. promoting roles)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- COUNTRIES POLICIES
-- ------------------------------------------------------------------------------
-- Public can read all countries
CREATE POLICY "Public can read countries"
  ON public.countries FOR SELECT
  TO public
  USING (true);

-- Admins can do full CRUD on countries
CREATE POLICY "Admins have full CRUD on countries"
  ON public.countries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- FIELDS POLICIES
-- ------------------------------------------------------------------------------
-- Public can read all fields
CREATE POLICY "Public can read fields"
  ON public.fields FOR SELECT
  TO public
  USING (true);

-- Admins can do full CRUD on fields
CREATE POLICY "Admins have full CRUD on fields"
  ON public.fields FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- PROVIDERS POLICIES
-- ------------------------------------------------------------------------------
-- Public can read verified providers
CREATE POLICY "Public can read providers"
  ON public.providers FOR SELECT
  TO public
  USING (true);

-- Admins have full CRUD on providers
CREATE POLICY "Admins have full CRUD on providers"
  ON public.providers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- SCHOLARSHIPS POLICIES
-- ------------------------------------------------------------------------------
-- Public can read published scholarships; admins can read all (including unpublished)
CREATE POLICY "Public can read published scholarships"
  ON public.scholarships FOR SELECT
  TO public
  USING (published = true OR public.is_admin());

-- Admins have full CRUD on scholarships
CREATE POLICY "Admins have full CRUD on scholarships"
  ON public.scholarships FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- SCHOLARSHIP_FIELDS POLICIES
-- ------------------------------------------------------------------------------
-- Public can read scholarship_fields
CREATE POLICY "Public can read scholarship fields"
  ON public.scholarship_fields FOR SELECT
  TO public
  USING (true);

-- Admins have full CRUD on scholarship_fields
CREATE POLICY "Admins have full CRUD on scholarship fields"
  ON public.scholarship_fields FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- GUIDES POLICIES
-- ------------------------------------------------------------------------------
-- Public can read published guides; admins can read all
CREATE POLICY "Public can read published guides"
  ON public.guides FOR SELECT
  TO public
  USING (published = true OR public.is_admin());

-- Admins have full CRUD on guides
CREATE POLICY "Admins have full CRUD on guides"
  ON public.guides FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- BOOKMARKS POLICIES
-- ------------------------------------------------------------------------------
-- Authenticated users can view only their own bookmarks
CREATE POLICY "Users can read own bookmarks"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTH AUTOMATION TRIGGER: create profile on user registration
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- STORAGE CONFIGURATION (Buckets: grantly-media)
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('grantly-media', 'grantly-media', true) ON CONFLICT (id) DO NOTHING;
-- Policy for public read access to grantly-media
-- CREATE POLICY "Public read grantly media" ON storage.objects FOR SELECT USING (bucket_id = 'grantly-media');
-- Policy for admin upload access to grantly-media
-- CREATE POLICY "Admin upload grantly media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'grantly-media' AND public.is_admin());
