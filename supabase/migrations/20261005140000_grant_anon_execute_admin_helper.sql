-- ==============================================================================
-- Migration: Grant anon execute on private.is_admin() helper
-- Timestamp: 2026-10-05 14:00:00
-- Purpose: Enable PostgreSQL RLS policy evaluation for anonymous public queries
-- ==============================================================================

GRANT USAGE ON SCHEMA private TO anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO anon;
