-- ==============================================================================
-- Grantly Database Schema & Row Level Security (RLS) Policies
-- PostgreSQL 15+ / Supabase Compatible Snapshot
-- 
-- NOTE: The canonical, incremental migration files are maintained in:
--       supabase/migrations/
--       (e.g., 20261004000001_initial_schema.sql, 20261004000002_security_hardening.sql)
-- This file serves as a consolidated snapshot reference for local tools or direct bootstrapping.
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

-- Private helper used only by authenticated admin policies and security triggers.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, private, pg_temp;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- Anti-role-escalation trigger on profiles: forbids non-admins from modifying role, id, or email
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT private.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Permission denied: cannot modify user role' USING ERRCODE = '42501';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Permission denied: cannot modify profile id' USING ERRCODE = '42501';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Permission denied: cannot modify profile email' USING ERRCODE = '42501';
    END IF;
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      NEW.created_at := OLD.created_at;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.prevent_profile_role_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can read their own profile; admins can read all profiles
CREATE POLICY "Users can read own profile or admins all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR private.is_admin());

-- Users can update only their own profile, role must remain unchanged
CREATE POLICY "Users can update own non-privileged profile data"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can update any profile (e.g. promoting roles)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
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
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

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
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

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
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ------------------------------------------------------------------------------
-- SCHOLARSHIPS POLICIES
-- ------------------------------------------------------------------------------
-- Public users read published scholarships; admins may read unpublished records.
CREATE POLICY "Public can read published scholarships"
  ON public.scholarships FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins can read all scholarships"
  ON public.scholarships FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "Admins can insert scholarships"
  ON public.scholarships FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "Admins can update scholarships"
  ON public.scholarships FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Admins can delete scholarships"
  ON public.scholarships FOR DELETE
  TO authenticated
  USING (private.is_admin());

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
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ------------------------------------------------------------------------------
-- GUIDES POLICIES
-- ------------------------------------------------------------------------------
-- Public users read published guides; admins may read unpublished records.
CREATE POLICY "Public can read published guides"
  ON public.guides FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins can read all guides"
  ON public.guides FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "Admins can insert guides"
  ON public.guides FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "Admins can update guides"
  ON public.guides FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Admins can delete guides"
  ON public.guides FOR DELETE
  TO authenticated
  USING (private.is_admin());

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
-- Strictly assigns 'user' role. Rejects any role provided in client metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'::public.user_role, -- HARDENED: Unconditionally enforce 'user'
    CASE
      WHEN NEW.raw_user_meta_data->>'preferred_language' = 'ar' THEN 'ar'
      ELSE 'en'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- AUTOMATED updated_at TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_countries_updated_at ON public.countries;
CREATE TRIGGER trg_countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_fields_updated_at ON public.fields;
CREATE TRIGGER trg_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_providers_updated_at ON public.providers;
CREATE TRIGGER trg_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_scholarships_updated_at ON public.scholarships;
CREATE TRIGGER trg_scholarships_updated_at BEFORE UPDATE ON public.scholarships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_guides_updated_at ON public.guides;
CREATE TRIGGER trg_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ADMIN AUDIT LOG TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

-- ==============================================================================
-- STORAGE CONFIGURATION (Buckets: scholarship-covers, provider-logos, guide-images)
-- ==============================================================================
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES
    ('scholarship-covers', 'scholarship-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('provider-logos', 'provider-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('guide-images', 'guide-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN others THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read media" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;

  CREATE POLICY "Public read media"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('scholarship-covers', 'provider-logos', 'guide-images'));

  CREATE POLICY "Admins can upload media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN ('scholarship-covers', 'provider-logos', 'guide-images')
      AND private.is_admin()
    );

  CREATE POLICY "Admins can update media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id IN ('scholarship-covers', 'provider-logos', 'guide-images')
      AND private.is_admin()
    )
    WITH CHECK (
      bucket_id IN ('scholarship-covers', 'provider-logos', 'guide-images')
      AND private.is_admin()
    );

  CREATE POLICY "Admins can delete media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id IN ('scholarship-covers', 'provider-logos', 'guide-images')
      AND private.is_admin()
    );
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN others THEN null;
END $$;
