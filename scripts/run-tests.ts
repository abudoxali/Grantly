/* eslint-disable @typescript-eslint/no-explicit-any */
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

const splitReadPoliciesPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20261005140000_split_public_admin_read_policies.sql'
);
const moveAdminHelperPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20261004224937_move_admin_helper_private.sql'
);
const anonGrantMigrationPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20261005140000_grant_anon_execute_admin_helper.sql'
);
assert('Split public/admin read policies migration exists', fs.existsSync(splitReadPoliciesPath));
assert('Private admin helper migration exists', fs.existsSync(moveAdminHelperPath));
assert('Obsolete anon helper grant migration is absent', !fs.existsSync(anonGrantMigrationPath));

if (fs.existsSync(splitReadPoliciesPath)) {
  const splitPolicies = fs.readFileSync(splitReadPoliciesPath, 'utf8');
  const policy = (name: string) =>
    splitPolicies.match(new RegExp(`CREATE POLICY "${name}"[\\s\\S]*?;`, 'i'))?.[0] || '';
  const publicScholarshipsPolicy = policy('Public can read published scholarships');
  const adminScholarshipsPolicy = policy('Admins can read all scholarships');
  const publicGuidesPolicy = policy('Public can read published guides');
  const adminGuidesPolicy = policy('Admins can read all guides');

  assert(
    'anonymous scholarship policy reads only published rows without private.is_admin()',
    publicScholarshipsPolicy.includes('TO anon, authenticated') &&
    publicScholarshipsPolicy.includes('USING (published = true)') &&
    !publicScholarshipsPolicy.includes('private.is_admin()')
  );
  assert(
    'authenticated admin scholarship read policy uses private.is_admin()',
    adminScholarshipsPolicy.includes('FOR SELECT') &&
    adminScholarshipsPolicy.includes('TO authenticated') &&
    adminScholarshipsPolicy.includes('USING (private.is_admin())')
  );
  assert(
    'anonymous guide policy reads only published rows without private.is_admin()',
    publicGuidesPolicy.includes('TO anon, authenticated') &&
    publicGuidesPolicy.includes('USING (published = true)') &&
    !publicGuidesPolicy.includes('private.is_admin()')
  );
  assert(
    'authenticated admin guide read policy uses private.is_admin()',
    adminGuidesPolicy.includes('FOR SELECT') &&
    adminGuidesPolicy.includes('TO authenticated') &&
    adminGuidesPolicy.includes('USING (private.is_admin())')
  );

  const migrationFiles = fs
    .readdirSync(path.dirname(splitReadPoliciesPath))
    .filter((file) => file.endsWith('.sql'));
  const migrationSource = migrationFiles
    .map((file) => fs.readFileSync(path.join(path.dirname(splitReadPoliciesPath), file), 'utf8'))
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const hasAnonPrivateGrant =
    migrationSource.includes('grant usage on schema private to anon') ||
    migrationSource.includes('grant execute on function private.is_admin() to anon');
  assert('anon is not granted private schema or private.is_admin() access', !hasAnonPrivateGrant);

  if (fs.existsSync(moveAdminHelperPath)) {
    const helperMigration = fs.readFileSync(moveAdminHelperPath, 'utf8');
    assert(
      'private schema and private.is_admin() remain revoked from anon and public',
      helperMigration.includes('REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;') &&
      helperMigration.includes('REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;')
    );

    const helperPolicy = (name: string) =>
      helperMigration.match(new RegExp(`CREATE POLICY "${name}"[\\s\\S]*?;`, 'i'))?.[0] || '';
    const adminWritePolicies = [
      'Admins can insert countries',
      'Admins can update countries',
      'Admins can delete countries',
      'Admins can insert fields',
      'Admins can update fields',
      'Admins can delete fields',
      'Admins can insert providers',
      'Admins can update providers',
      'Admins can delete providers',
      'Admins can insert scholarships',
      'Admins can update scholarships',
      'Admins can delete scholarships',
      'Admins can insert scholarship fields',
      'Admins can update scholarship fields',
      'Admins can delete scholarship fields',
      'Admins can insert guides',
      'Admins can update guides',
      'Admins can delete guides',
      'Admins can read audit logs',
      'Admins can insert audit logs',
      'Admins can upload media',
      'Admins can update media',
      'Admins can delete media',
    ];
    assert(
      'admin CRUD, audit-log, and storage-write policies remain authenticated-only',
      adminWritePolicies.every((name) => {
        const definition = helperPolicy(name);
        return definition.includes('TO authenticated') && definition.includes('private.is_admin()');
      })
    );
    assert(
      'profile role-escalation protection uses the private admin helper and retains 42501',
      helperMigration.includes('IF NOT private.is_admin()') &&
      helperMigration.includes("ERRCODE = '42501'")
    );
  }
}

const bookmarkPolicyPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20261004224906_rls_performance_hardening.sql'
);
assert('Bookmark RLS migration exists', fs.existsSync(bookmarkPolicyPath));
if (fs.existsSync(bookmarkPolicyPath)) {
  const bookmarkPolicies = fs.readFileSync(bookmarkPolicyPath, 'utf8');
  assert(
    'bookmark reads and writes remain authenticated and owner-scoped',
    bookmarkPolicies.includes(
      'CREATE POLICY "Users can read own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);'
    ) &&
    bookmarkPolicies.includes(
      'CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);'
    ) &&
    bookmarkPolicies.includes(
      'CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);'
    )
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
// 6. PRODUCTION SUPABASE REPOSITORY FALLBACK REGRESSION TESTS
// -----------------------------------------------------------------------------
import {
  getScholarships,
  getScholarshipBySlug,
  getCountries,
  getFields,
  getGuides,
  getGuideBySlug,
  getProfile,
  __setSupabaseClientForTesting,
} from '../src/lib/db/repository';

function createMockSupabase(handlers: Record<string, (query: any) => Promise<any>>) {
  return {
    from: (table: string) => {
      const state: any = {
        table,
        filters: [],
        selected: '*',
        isSingle: false,
        isHead: false,
      };

      const chain: any = {
        select: (cols: string, opts?: any) => {
          state.selected = cols;
          if (opts?.head) state.isHead = true;
          return chain;
        },
        eq: (col: string, val: any) => {
          state.filters.push({ type: 'eq', col, val });
          return chain;
        },
        in: (col: string, val: any) => {
          state.filters.push({ type: 'in', col, val });
          return chain;
        },
        order: (col: string, opts?: any) => {
          state.order = { col, opts };
          return chain;
        },
        limit: (n: number) => {
          state.limit = n;
          return chain;
        },
        single: () => {
          state.isSingle = true;
          return chain;
        },
        then: (resolve: any, reject: any) => {
          const handler = handlers[table];
          if (!handler) {
            return Promise.resolve({ data: [], error: null }).then(resolve, reject);
          }
          return handler(state).then(resolve, reject);
        },
      };
      return chain;
    },
  };
}

async function captureError(action: () => Promise<unknown>) {
  try {
    await action();
    return null;
  } catch (error) {
    return error;
  }
}

(async () => {
  console.log('\n--- 6. Production Supabase Repository Fallback Regression Tests ---');

  // 1. production + configured Supabase + database returns zero scholarships => repository returns [] and total 0
  const prevNodeEnv = process.env.NODE_ENV;
  (process.env as any).NODE_ENV = 'production';

  __setSupabaseClientForTesting(
    createMockSupabase({
      scholarships: async () => ({ data: [], count: 0, error: null }),
    })
  );

  const emptyScholarships = await getScholarships();
  assert(
    'production + configured Supabase + 0 DB rows returns [] and total 0',
    emptyScholarships.scholarships.length === 0 && emptyScholarships.total === 0,
    `Got ${emptyScholarships.scholarships.length} scholarships, total ${emptyScholarships.total}`
  );

  // 2. production + configured Supabase + scholarship slug not found => returns null, NOT local seed scholarship
  __setSupabaseClientForTesting(
    createMockSupabase({
      scholarships: async () => ({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' },
      }),
    })
  );

  const notFoundSch = await getScholarshipBySlug('chevening-scholarships-uk');
  assert(
    'production + configured Supabase + slug not found in DB returns null, NOT local seed scholarship',
    notFoundSch === null,
    `Returned seed data: ${JSON.stringify(notFoundSch?.title_en)}`
  );

  // 3. production + configured Supabase query error (e.g. 500) => throws explicit error => must NOT return local seed data
  __setSupabaseClientForTesting(
    createMockSupabase({
      scholarships: async () => ({
        data: null,
        error: { code: '500', message: 'connection failure' },
      }),
    })
  );

  let schQueryThrew = false;
  try {
    const result = await getScholarships();
    if (result.scholarships.length > 0) {
      schQueryThrew = false;
    }
  } catch {
    schQueryThrew = true;
  }
  assert(
    'production + configured Supabase query error throws explicit error and does NOT return seed data',
    schQueryThrew === true,
    'Query failed silently and returned local seed data'
  );

  // 3b. production + 42501 RLS permission error => throws a security error without seed fallback
  __setSupabaseClientForTesting(
    createMockSupabase({
      scholarships: async () => ({
        data: null,
        error: { code: '42501', message: 'permission denied for function is_admin' },
      }),
    })
  );
  const scholarshipRlsError = await captureError(() => getScholarships());
  assert(
    'production + Supabase scholarship 42501 throws an explicit database security error',
    scholarshipRlsError instanceof Error &&
    scholarshipRlsError.message.includes('[42501]') &&
    scholarshipRlsError.message.includes('security error')
  );
  assert(
    'production scholarship query never falls back to SEED_SCHOLARSHIPS after 42501',
    scholarshipRlsError !== null
  );

  const scholarshipDetailRlsError = await captureError(() =>
    getScholarshipBySlug('chevening-scholarships-uk')
  );
  assert(
    'production scholarship slug lookup throws on 42501 instead of returning null',
    scholarshipDetailRlsError instanceof Error &&
    scholarshipDetailRlsError.message.includes('[42501]')
  );

  // 4. production country query returning [] => returns []
  __setSupabaseClientForTesting(
    createMockSupabase({
      countries: async () => ({ data: [], error: null }),
    })
  );
  const emptyCountries = await getCountries();
  assert(
    'production country query returning [] returns []',
    Array.isArray(emptyCountries) && emptyCountries.length === 0,
    `Got length ${emptyCountries.length}`
  );

  // 4b. production country query error => throws and does NOT return seed countries
  __setSupabaseClientForTesting(
    createMockSupabase({
      countries: async () => ({ data: null, error: { code: '500', message: 'DB error' } }),
    })
  );
  let countriesThrew = false;
  try {
    const c = await getCountries();
    if (c.length > 0) countriesThrew = false;
  } catch {
    countriesThrew = true;
  }
  assert(
    'production country query error throws and does NOT return seed countries',
    countriesThrew === true,
    'Fell back to local seed countries'
  );

  // 5. production field query returning [] => returns []
  __setSupabaseClientForTesting(
    createMockSupabase({
      fields: async () => ({ data: [], error: null }),
    })
  );
  const emptyFields = await getFields();
  assert(
    'production field query returning [] returns []',
    Array.isArray(emptyFields) && emptyFields.length === 0,
    `Got length ${emptyFields.length}`
  );

  // 5b. production field query error => throws and does NOT return seed fields
  __setSupabaseClientForTesting(
    createMockSupabase({
      fields: async () => ({ data: null, error: { code: '500', message: 'DB error' } }),
    })
  );
  let fieldsThrew = false;
  try {
    const f = await getFields();
    if (f.length > 0) fieldsThrew = false;
  } catch {
    fieldsThrew = true;
  }
  assert(
    'production field query error throws and does NOT return seed fields',
    fieldsThrew === true,
    'Fell back to local seed fields'
  );

  // 6. production providers/guides equivalent behavior
  __setSupabaseClientForTesting(
    createMockSupabase({
      guides: async () => ({ data: [], error: null }),
    })
  );
  const emptyGuides = await getGuides(true);
  assert(
    'production guides query returning [] returns []',
    Array.isArray(emptyGuides) && emptyGuides.length === 0,
    `Got length ${emptyGuides.length}`
  );

  __setSupabaseClientForTesting(
    createMockSupabase({
      guides: async () => ({
        data: null,
        error: { code: '42501', message: 'permission denied for function is_admin' },
      }),
    })
  );
  const guideRlsError = await captureError(() => getGuides(true));
  assert(
    'production + Supabase guide 42501 throws an explicit database security error',
    guideRlsError instanceof Error &&
    guideRlsError.message.includes('[42501]') &&
    guideRlsError.message.includes('security error')
  );
  assert(
    'production guide query never falls back to SEED_GUIDES after 42501',
    guideRlsError !== null
  );

  __setSupabaseClientForTesting(
    createMockSupabase({
      guides: async () => ({ data: null, error: { code: 'PGRST116', message: 'Row not found' } }),
    })
  );
  const missingGuide = await getGuideBySlug('how-to-win-chevening-scholarship');
  assert(
    'production guide slug not found in DB returns null, NOT local seed guide',
    missingGuide === null,
    `Returned seed guide: ${JSON.stringify(missingGuide?.title_en)}`
  );

  __setSupabaseClientForTesting(
    createMockSupabase({
      guides: async () => ({
        data: null,
        error: { code: '42501', message: 'permission denied for function is_admin' },
      }),
    })
  );
  const guideDetailRlsError = await captureError(() =>
    getGuideBySlug('how-to-win-chevening-scholarship')
  );
  assert(
    'production guide slug lookup throws on 42501 instead of returning null',
    guideDetailRlsError instanceof Error &&
    guideDetailRlsError.message.includes('[42501]')
  );

  // 6b. production profile query does NOT return admin-seed-id or demo profiles
  __setSupabaseClientForTesting(
    createMockSupabase({
      profiles: async () => ({ data: null, error: { code: 'PGRST116', message: 'Not found' } }),
    })
  );
  const missingProfile = await getProfile('admin-seed-id');
  assert(
    'production getProfile does NOT return admin-seed-id demo profile',
    missingProfile === null,
    `Returned fake profile: ${JSON.stringify(missingProfile?.email)}`
  );

  // 7. local development mode can still use seed fallback where explicitly intended
  (process.env as any).NODE_ENV = 'development';
  __setSupabaseClientForTesting(null);

  const devScholarships = await getScholarships();
  assert(
    'local development mode can still use seed fallback where explicitly intended',
    devScholarships.scholarships.length > 0 &&
    devScholarships.scholarships.some((s) => s.slug === 'chevening-scholarships-uk')
  );

  const devChevening = await getScholarshipBySlug('chevening-scholarships-uk');
  assert(
    'local development mode returns seed scholarship for getScholarshipBySlug',
    devChevening !== null && devChevening.slug === 'chevening-scholarships-uk'
  );

  // Restore environment
  (process.env as any).NODE_ENV = prevNodeEnv;
  __setSupabaseClientForTesting(undefined);

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
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
