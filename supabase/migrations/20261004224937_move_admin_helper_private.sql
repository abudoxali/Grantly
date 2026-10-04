-- Move the admin RLS helper out of the exposed public API schema.

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private, pg_temp;

DROP POLICY IF EXISTS "Users can read own profile or admins all" ON public.profiles;
CREATE POLICY "Users can read own profile or admins all" ON public.profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id OR private.is_admin());
DROP POLICY IF EXISTS "Users or admins can update profiles" ON public.profiles;
CREATE POLICY "Users or admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id OR private.is_admin()) WITH CHECK ((SELECT auth.uid()) = id OR private.is_admin());

DROP POLICY IF EXISTS "Admins can insert countries" ON public.countries;
DROP POLICY IF EXISTS "Admins can update countries" ON public.countries;
DROP POLICY IF EXISTS "Admins can delete countries" ON public.countries;
CREATE POLICY "Admins can insert countries" ON public.countries FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admins can update countries" ON public.countries FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete countries" ON public.countries FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can insert fields" ON public.fields;
DROP POLICY IF EXISTS "Admins can update fields" ON public.fields;
DROP POLICY IF EXISTS "Admins can delete fields" ON public.fields;
CREATE POLICY "Admins can insert fields" ON public.fields FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admins can update fields" ON public.fields FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete fields" ON public.fields FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can insert providers" ON public.providers;
DROP POLICY IF EXISTS "Admins can update providers" ON public.providers;
DROP POLICY IF EXISTS "Admins can delete providers" ON public.providers;
CREATE POLICY "Admins can insert providers" ON public.providers FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admins can update providers" ON public.providers FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete providers" ON public.providers FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Public can read published scholarships" ON public.scholarships;
CREATE POLICY "Public can read published scholarships" ON public.scholarships FOR SELECT USING (published = true OR private.is_admin());
DROP POLICY IF EXISTS "Admins can insert scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Admins can update scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Admins can delete scholarships" ON public.scholarships;
CREATE POLICY "Admins can insert scholarships" ON public.scholarships FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admins can update scholarships" ON public.scholarships FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete scholarships" ON public.scholarships FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can insert scholarship fields" ON public.scholarship_fields;
DROP POLICY IF EXISTS "Admins can update scholarship fields" ON public.scholarship_fields;
DROP POLICY IF EXISTS "Admins can delete scholarship fields" ON public.scholarship_fields;
CREATE POLICY "Admins can insert scholarship fields" ON public.scholarship_fields FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admins can update scholarship fields" ON public.scholarship_fields FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete scholarship fields" ON public.scholarship_fields FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Public can read published guides" ON public.guides;
CREATE POLICY "Public can read published guides" ON public.guides FOR SELECT USING (published = true OR private.is_admin());
DROP POLICY IF EXISTS "Admins can insert guides" ON public.guides;
DROP POLICY IF EXISTS "Admins can update guides" ON public.guides;
DROP POLICY IF EXISTS "Admins can delete guides" ON public.guides;
CREATE POLICY "Admins can insert guides" ON public.guides FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admins can update guides" ON public.guides FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete guides" ON public.guides FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT TO authenticated WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
CREATE POLICY "Admins can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('scholarship-covers','provider-logos','guide-images') AND private.is_admin());
CREATE POLICY "Admins can update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('scholarship-covers','provider-logos','guide-images') AND private.is_admin()) WITH CHECK (bucket_id IN ('scholarship-covers','provider-logos','guide-images') AND private.is_admin());
CREATE POLICY "Admins can delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('scholarship-covers','provider-logos','guide-images') AND private.is_admin());

DROP FUNCTION IF EXISTS public.is_admin();
