-- ==============================================================================
-- Migration: Split public content reads from authenticated admin reads
-- Timestamp: 2026-10-05 14:00:00
-- Purpose: Keep anonymous policies independent from the private admin helper
-- ================================================================================

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Public can read published scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Admins can read all scholarships" ON public.scholarships;
CREATE POLICY "Public can read published scholarships"
  ON public.scholarships
  FOR SELECT
  TO anon, authenticated
  USING (published = true);
CREATE POLICY "Admins can read all scholarships"
  ON public.scholarships
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

DROP POLICY IF EXISTS "Public can read published guides" ON public.guides;
DROP POLICY IF EXISTS "Admins can read all guides" ON public.guides;
CREATE POLICY "Public can read published guides"
  ON public.guides
  FOR SELECT
  TO anon, authenticated
  USING (published = true);
CREATE POLICY "Admins can read all guides"
  ON public.guides
  FOR SELECT
  TO authenticated
  USING (private.is_admin());
