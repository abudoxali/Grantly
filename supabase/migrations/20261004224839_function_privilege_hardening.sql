-- Production hardening applied to the Grantly Supabase project.
-- Prevent trigger-only SECURITY DEFINER functions from being exposed as RPCs.

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_profile_role_escalation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS 'RLS helper: callable by authenticated users to test only their own admin status; anonymous execution revoked.';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auth trigger only; direct execution revoked from API roles.';
COMMENT ON FUNCTION public.prevent_profile_role_escalation() IS 'Profile trigger only; direct execution revoked from API roles.';
