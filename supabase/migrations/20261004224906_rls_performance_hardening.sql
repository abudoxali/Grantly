-- Production RLS and performance hardening applied to the Grantly Supabase project.

CREATE INDEX IF NOT EXISTS idx_providers_country_id ON public.providers(country_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_provider_id ON public.scholarships(provider_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_fields ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

DROP POLICY IF EXISTS "Users can read own profile or admins all" ON public.profiles;
CREATE POLICY "Users can read own profile or admins all"
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own non-privileged profile data" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Users or admins can update profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin())
  WITH CHECK ((SELECT auth.uid()) = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can read own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can read own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Public can read countries" ON public.countries;
CREATE POLICY "Public can read countries" ON public.countries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage countries" ON public.countries;
CREATE POLICY "Admins can insert countries" ON public.countries FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update countries" ON public.countries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete countries" ON public.countries FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can read fields" ON public.fields;
CREATE POLICY "Public can read fields" ON public.fields FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage fields" ON public.fields;
CREATE POLICY "Admins can insert fields" ON public.fields FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update fields" ON public.fields FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete fields" ON public.fields FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can read providers" ON public.providers;
CREATE POLICY "Public can read providers" ON public.providers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage providers" ON public.providers;
CREATE POLICY "Admins can insert providers" ON public.providers FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update providers" ON public.providers FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete providers" ON public.providers FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can read published scholarships" ON public.scholarships;
CREATE POLICY "Public can read published scholarships" ON public.scholarships FOR SELECT USING (published = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins can manage scholarships" ON public.scholarships;
CREATE POLICY "Admins can insert scholarships" ON public.scholarships FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update scholarships" ON public.scholarships FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete scholarships" ON public.scholarships FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can read scholarship fields" ON public.scholarship_fields;
CREATE POLICY "Public can read scholarship fields" ON public.scholarship_fields FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage scholarship fields" ON public.scholarship_fields;
CREATE POLICY "Admins can insert scholarship fields" ON public.scholarship_fields FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update scholarship fields" ON public.scholarship_fields FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete scholarship fields" ON public.scholarship_fields FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can read published guides" ON public.guides;
CREATE POLICY "Public can read published guides" ON public.guides FOR SELECT USING (published = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins can manage guides" ON public.guides;
CREATE POLICY "Admins can insert guides" ON public.guides FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update guides" ON public.guides FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete guides" ON public.guides FOR DELETE TO authenticated USING (public.is_admin());
