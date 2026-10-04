import * as fs from 'fs';
import * as path from 'path';
import { validateEnv } from '../src/lib/env';
import {
  SEED_COUNTRIES,
  SEED_FIELDS,
  SEED_PROVIDERS,
  SEED_SCHOLARSHIPS,
  SEED_GUIDES,
} from '../src/lib/data/seed-data';

console.log('=== Grantly Automated Test Suite ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(description: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ [PASS] ${description}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] ${description}${details ? `: ${details}` : ''}`);
  }
}

// -----------------------------------------------------------------------------
// 1. MIGRATION & SQL HARDENING TESTS
// -----------------------------------------------------------------------------
console.log('--- 1. Database Migrations & Security Hardening Tests ---');

const migration1Path = path.resolve(
  process.cwd(),
  'supabase/migrations/20261004000001_initial_schema.sql'
);
const migration2Path = path.resolve(
  process.cwd(),
  'supabase/migrations/20261004000002_security_hardening.sql'
);

assert('Migration 1 (initial_schema.sql) exists', fs.existsSync(migration1Path));
assert('Migration 2 (security_hardening.sql) exists', fs.existsSync(migration2Path));

if (fs.existsSync(migration2Path)) {
  const m2Content = fs.readFileSync(migration2Path, 'utf8');

  assert(
    'is_admin() uses fixed search_path to prevent object shadowing',
    m2Content.includes('SET search_path = public, pg_temp')
  );

  assert(
    'handle_new_user() strictly forces role = user',
    m2Content.includes("'user'::public.user_role") &&
      !m2Content.includes("COALESCE((NEW.raw_user_meta_data->>'role')::user_role")
  );

  assert(
    'prevent_profile_role_escalation trigger function is defined',
    m2Content.includes('FUNCTION public.prevent_profile_role_escalation()')
  );

  assert(
    'prevent_profile_role_escalation raises 42501 permission denied on role change',
    m2Content.includes("RAISE EXCEPTION 'Permission denied: cannot modify user role'") &&
      m2Content.includes("ERRCODE = '42501'")
  );

  assert(
    'admin_audit_logs table is created with RLS enabled',
    m2Content.includes('CREATE TABLE IF NOT EXISTS public.admin_audit_logs') &&
      m2Content.includes('ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY')
  );
}

// -----------------------------------------------------------------------------
// 2. AUTHENTICATION & ROUTE GUARDS CODE AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 2. Auth & Route Guard Code Audit ---');

const authContextPath = path.resolve(process.cwd(), 'src/lib/auth/context.tsx');
if (fs.existsSync(authContextPath)) {
  const authContent = fs.readFileSync(authContextPath, 'utf8');

  assert(
    'auth context rejects mock authentication in production',
    authContent.includes("if (process.env.NODE_ENV === 'production')")
  );

  assert(
    'auth context requires NEXT_PUBLIC_ALLOW_DEV_MOCK_ADMIN for dev admin escalation',
    authContent.includes('NEXT_PUBLIC_ALLOW_DEV_MOCK_ADMIN')
  );

  assert(
    'auth context does NOT automatically escalate any email with substring admin',
    !authContent.includes("email.toLowerCase().includes('admin') ? 'admin' : 'user'")
  );
}

const middlewarePath = path.resolve(process.cwd(), 'src/middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const mwContent = fs.readFileSync(middlewarePath, 'utf8');

  assert(
    'middleware uses Supabase server auth getUser()',
    mwContent.includes('supabase.auth.getUser()')
  );

  assert(
    'middleware verifies admin role against profiles table',
    mwContent.includes("from('profiles')") && mwContent.includes("role")
  );

  assert(
    'middleware blocks unconfigured backend in production',
    mwContent.includes('backend_unconfigured')
  );
}

// -----------------------------------------------------------------------------
// 3. SEED DATA INTEGRITY TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 3. Seed Data Integrity Tests ---');

assert('Countries seed count > 0', SEED_COUNTRIES.length > 0);
assert('Fields seed count > 0', SEED_FIELDS.length > 0);
assert('Providers seed count > 0', SEED_PROVIDERS.length > 0);
assert('Scholarships seed count > 0', SEED_SCHOLARSHIPS.length > 0);
assert('Guides seed count > 0', SEED_GUIDES.length > 0);

// Validate Country codes and slugs
const countryIds = new Set(SEED_COUNTRIES.map((c) => c.id));
const countrySlugs = new Set(SEED_COUNTRIES.map((c) => c.slug));
assert('All country slugs are unique', countrySlugs.size === SEED_COUNTRIES.length);

// Validate Provider foreign keys to country
const validCountryRefs = SEED_PROVIDERS.every(
  (p) => !p.country_id || countryIds.has(p.country_id)
);
assert('All providers reference existing countries or null', validCountryRefs);

// Validate Scholarship foreign keys
const providerIds = new Set(SEED_PROVIDERS.map((p) => p.id));
const validScholarshipRefs = SEED_SCHOLARSHIPS.every(
  (s) =>
    (!s.country_id || countryIds.has(s.country_id)) &&
    (!s.provider_id || providerIds.has(s.provider_id))
);
assert('All scholarships reference existing countries and providers', validScholarshipRefs);

// -----------------------------------------------------------------------------
// 4. ENVIRONMENT VALIDATOR TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 4. Environment Validator Tests ---');

// In dev mode without prod enforcement
const devRes = validateEnv(false);
assert('validateEnv(false) executes cleanly', typeof devRes.valid === 'boolean');

// In strict prod mode without env set
const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const savedAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const strictProdMissingRes = validateEnv(true);
assert(
  'validateEnv(true) fails when production variables are missing',
  strictProdMissingRes.valid === false && strictProdMissingRes.errors.length > 0
);

// Restore and test with valid dummy prod credentials
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://grantly-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_test_purposes_only';

const strictProdValidRes = validateEnv(true);
assert(
  'validateEnv(true) passes when valid HTTPS URL and key are provided',
  strictProdValidRes.valid === true && strictProdValidRes.errors.length === 0
);

// Cleanup restored environment
if (savedUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
if (savedAnon) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedAnon;
else delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// -----------------------------------------------------------------------------
// 5. PACKAGING CONFIGURATION TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 5. Packaging Configuration Tests ---');

const nextConfigPath = path.resolve(process.cwd(), 'next.config.ts');
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

assert(
  'next.config.ts configures standalone output',
  nextConfigContent.includes("output: 'standalone'")
);

assert(
  'next.config.ts disables powered-by header',
  nextConfigContent.includes('poweredByHeader: false')
);

assert(
  'next.config.ts includes X-Frame-Options DENY security header',
  nextConfigContent.includes("'X-Frame-Options'") && nextConfigContent.includes("'DENY'")
);

assert(
  'next.config.ts includes X-Content-Type-Options nosniff header',
  nextConfigContent.includes("'X-Content-Type-Options'") && nextConfigContent.includes("'nosniff'")
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log(`\n==================================================`);
console.log(`Test Execution Summary:`);
console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log(`==================================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✓ All tests passed successfully.\n');
  process.exit(0);
}
