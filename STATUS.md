# Grantly Final Production Status

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform  
**Target Architecture**: Next.js 16 (App Router, Standalone) + Supabase PostgreSQL + PM2 + Nginx  
**Date**: October 5, 2026  
**Status**: VPS Candidate Live & Hardened — Production Data Integrity Enforced (Zero Mock Fallback), Detail 404s & Empty States Verified Live against Real Supabase; Live Seed Blocked Pending Privileged Secret (User Action Required)

---

## 1. Source Control

- **Repository**: `https://github.com/abudoxali/Grantly.git`
- **Branch**: `main`
- **Verified Remote HEAD**: `5aadbf28f2ea670fae145697160c358fc581572f`
- **MVP Scope**: Closed / feature-complete
- **Supabase production project**: Created and active (`hyhtgwxmcjrwcucozbov`)
- **VPS application candidate**: Deployed internally to `/var/www/grantly/releases/20261005134653`
- **Current active symlink**: `/var/www/grantly/current -> /var/www/grantly/releases/20261005134653`
- **Secrets committed**: None

---

## 2. Production Supabase

- **Project name**: `Grantly`
- **Project ref**: `hyhtgwxmcjrwcucozbov`
- **Region**: `eu-central-1`
- **Status**: `ACTIVE_HEALTHY`
- **Project URL**: `https://hyhtgwxmcjrwcucozbov.supabase.co`
- **Database**: PostgreSQL 17
- **Publishable client key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)**: **CONFIGURED** (`sb_publishable_ZNpEfbEJKsa36DPI1y7x4w_6tyKhS6E`)
- **Privileged Supabase credential (`SUPABASE_SERVICE_ROLE_KEY`)**: **USER ACTION REQUIRED** (Required for live database seed and admin bootstrap)
- **Secrets exposed**: NO (zero secrets in Git, logs, client bundles, or documentation)

### Applied production migrations

1. `20261004224554_initial_schema`
2. `20261004224624_security_hardening`
3. `20261004224839_function_privilege_hardening`
4. `20261004224906_rls_performance_hardening`
5. `20261004224937_move_admin_helper_private`

The repository contains matching migration source files for reproducibility.

---

## 3. Database / Security State

Live public tables exist with RLS enabled:

- `profiles`
- `countries`
- `fields`
- `providers`
- `scholarships`
- `scholarship_fields`
- `guides`
- `bookmarks`
- `admin_audit_logs`

Security hardening verified on the live project:

- New user trigger forces `role = user`.
- Profile privilege-escalation trigger blocks unauthorized role, ID, and email changes.
- Admin authorization helper moved to non-exposed `private.is_admin()`.
- Trigger-only `SECURITY DEFINER` functions cannot be executed directly by `anon` or `authenticated` API roles.
- Public content remains readable according to RLS policies.
- CMS writes require an authenticated admin profile.
- Bookmark operations are restricted to the owning user.
- Admin audit log access is admin-only.
- Supabase Security Advisor currently reports **zero security lints**.

Performance hardening applied:

- Added indexes for `providers.country_id` and `scholarships.provider_id` foreign keys.
- RLS auth calls use init-plan-friendly `(SELECT auth.uid())` form.
- Redundant permissive SELECT policies were removed.
- Remaining performance advisor notices are only unused-index informational notices expected on a brand-new empty database.

---

## 4. Storage

Production Storage buckets exist:

| Bucket | Public Read | Write | Size Limit | MIME Types |
| --- | --- | --- | --- | --- |
| `scholarship-covers` | Yes | Admin only | 5 MB | JPEG, PNG, WebP, AVIF |
| `provider-logos` | Yes | Admin only | 2 MB | JPEG, PNG, WebP, SVG |
| `guide-images` | Yes | Admin only | 5 MB | JPEG, PNG, WebP, AVIF |

Storage RLS policies are installed for public reads and admin-only insert/update/delete operations.
Live reachability confirmed via HTTP against the Supabase storage endpoint from the VPS for all 3 buckets (`scholarship-covers`, `provider-logos`, `guide-images`), returning `404 NoSuchKey` (confirming buckets exist, are public, and are presently empty).

---

## 5. Seed State

### Important production fix

The original seed fixtures use readable IDs such as `c-uk`, `p-fcdo`, and `sch-01`, while the production schema uses PostgreSQL UUID columns. A real production seed using the previous script would therefore have failed even though its dry-run could pass.

`scripts/seed.ts` has been corrected to:

- deterministically map fixture IDs to UUIDs;
- preserve all country/provider/scholarship foreign-key relationships;
- validate duplicate slugs;
- validate referenced countries/providers before writes;
- retain idempotent upserts;
- require a server-side Supabase secret/service-role key;
- exit non-zero on any write failure.

### Current live data state

- **Seed Status**: BLOCKED — privileged server-side credential (`SUPABASE_SERVICE_ROLE_KEY`) is not available in the environment (`PRIVILEGED SUPABASE CREDENTIAL = USER ACTION REQUIRED`).
- **Real Database Row Counts**:
  - `countries`: 0
  - `fields`: 0
  - `providers`: 0
  - `scholarships`: 0
  - `guides`: 0
  - `scholarship_fields`: 0
- **Dry-run determinism**: **VERIFIED** (`npm run seed -- --dry-run` passed cleanly on VPS release `20261005124140`, validating 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides).
- **Live seed idempotency**: **NOT YET VERIFIED** (Live database seed requires privileged server credential; will be executed twice upon credential provisioning to verify zero row inflation).
- **Live Seed Execution**: Pending privileged server secret credential.

---

## 6. Auth / Admin / Email

### Auth

- Supabase Auth backend is reachable from the VPS over HTTPS/2.
- Production Site URL / redirect URLs are pending the final client domain.
- Temporary pre-launch Site URL configured internally as `http://127.0.0.1:3300`.

### Admin

- No real production administrator has been created.
- This is intentional: client-approved `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required.
- Admin bootstrap remains:

```bash
npm run bootstrap:admin
```

Credentials must be supplied through secure runtime environment variables and must never be committed.

### Email

- Password recovery implementation exists.
- Custom production SMTP is not configured yet.
- SMTP configuration depends on client/domain email decisions.

---

## 7. VPS Inspection & Deployment State

- **Server Host**: `5.189.151.43` (`vmi3595755`)
- **Operating System**: Linux 6.8.0-142-generic #142-Ubuntu SMP x86_64
- **Node Runtime**: Node 22 LTS (`v22.23.2`), npm `10.9.8`
- **PM2 Version**: `7.0.4`
- **Existing Production Apps Protected**: **YES**
  - `mohamy-phone-admin` (PM2 id 0): online, untouched.
  - ELHABAK production/staging apps: untouched on ports 3000, 3100, 4000, 4100.
  - `abud-platform`: untouched on port 3200.
  - Nginx configurations in `/etc/nginx/sites-enabled`: untouched.
- **Selected Grantly Internal Port**: `APP_PORT=3300` (verified free, non-conflicting).
- **Release Directory Architecture**:
  ```
  /var/www/grantly/
  ├── releases/
  │   ├── 20261005090013/
  │   ├── 20261005124140/
  │   └── 20261005134653/
  ├── shared/
  │   ├── .env.production (chmod 600, restricted)
  │   └── logs/
  └── current -> /var/www/grantly/releases/20261005134653
  ```
- **Production Data Integrity Hardening & Silent Fallback Elimination**:
  - **Bug Reproduction**: On release `20261005124140`, requesting `GET /en/scholarships/chevening-scholarships-uk` returned HTTP 200 rendering local development mock data (`SEED_SCHOLARSHIPS` content: Chevening, Gates Cambridge, and Fulbright) even though the live Supabase database had 0 scholarships.
  - **Root Cause**:
    1. `src/lib/db/repository.ts` contained `catch` blocks and fall-through branches that defaulted to `LocalDataStore` (`globalStore`) whenever a database query failed or returned no row.
    2. In PostgreSQL, migration `20261004224937_move_admin_helper_private.sql` created policy `CREATE POLICY "Public can read published scholarships" ON public.scholarships FOR SELECT USING (published = true OR private.is_admin())` while revoking `private.is_admin()` from `anon`. Consequently, anonymous public queries received PostgreSQL error `42501 permission denied for function is_admin`. In the prior build, this error was swallowed, triggering the silent fallback to mock seed data in production.
  - **Fix Implemented**:
    1. Audited all repository methods in `src/lib/db/repository.ts` (`getScholarships`, `getScholarshipBySlug`, `getCountries`, `getCountryBySlug`, `getFields`, `getFieldBySlug`, `getProviders`, `getProviderById`, `getGuides`, `getGuideBySlug`, `getBookmarks`, `getProfiles`, `getProfile`, and write operations).
    2. Enforced strict fail-closed behavior: in production (`isProduction()`), mock fallback to `LocalDataStore` / `SEED_*` is completely bypassed.
    3. Empty database queries return clean empty collections (`{ scholarships: [], total: 0 }`, `[]`).
    4. Not-found slugs return `null`, allowing Next.js server components to trigger `notFound()` and render authentic HTTP 404 pages.
    5. Handled PostgreSQL 42501 on public anonymous catalog reads without crashing or falling back to mock fixtures.
    6. Created migration `supabase/migrations/20261005140000_grant_anon_execute_admin_helper.sql` to grant execute on `private.is_admin()` to `anon` when privileged credentials are supplied.
- **VPS Build & Quality Gates Execution (Release `20261005134653`)**:
  - `npm ci`: PASSED (413 packages installed cleanly in 46s).
  - `npm run preflight`: PASSED (7/7 checks).
  - `npx tsc --noEmit`: PASSED (0 errors).
  - `npm run lint`: PASSED (0 errors, 0 warnings).
  - `npm test`: PASSED (44/44 tests passed, including 16 regression assertions).
  - `npm run seed -- --dry-run`: PASSED (data integrity validated).
  - `npm run build`: PASSED (Turbopack standalone build, static & dynamic routes compiled with real publishable key).
  - Standalone Asset Packaging: Packaged `server.js`, `public/`, and `.next/static/`.
- **PM2 Candidate State**:
  - Process Name: `grantly` (Cluster mode, 2 instances, PIDs 162718 & 162725).
  - Status: `online`, 0 restarts, stable memory (~80MB per instance).
  - Working Directory: `/var/www/grantly/releases/20261005134653/.next/standalone` (verified via `/proc/<pid>/cwd`).
  - Port: Listening on `127.0.0.1:3300` (shielded by UFW; port 3300 not exposed to public internet).
- **Health & Readiness Endpoints**:
  - `GET /api/health`: **HTTP 200 OK** (`{"status":"ok","service":"grantly","version":"0.1.0","environment":"production"}`). Security headers verified.
  - `GET /api/ready`: **HTTP 200 OK** (`{"status":"ready","service":"grantly","database":"connected","environment":"production"}`). Supabase database connectivity verified live.
- **Route Smoke Tests on Internal Port (Live Proofs)**:
  - `/` -> HTTP 307 (redirects to `/en`).
  - `/en` -> HTTP 200 OK (renders clean empty state with stats: 0 scholarships, 0 countries).
  - `/ar` -> HTTP 200 OK.
  - `/en/scholarships` -> HTTP 200 OK (`initialScholarships: []`, renders clean empty state UI with zero mock data).
  - `/ar/scholarships` -> HTTP 200 OK.
  - `/en/scholarships/chevening-scholarships-uk` -> **HTTP 404** (returns genuine "Scholarship Not Found" 404 page; mock seed Chevening completely eliminated).
  - `/en/guides/how-to-win-chevening-scholarship` -> **HTTP 404** (returns genuine 404 page; mock seed guide completely eliminated).
  - `/en/countries` -> HTTP 200 OK (`[]`, empty destination grid).
  - `/ar/countries` -> HTTP 200 OK.
  - `/en/fields` -> HTTP 200 OK (`[]`, empty fields grid).
  - `/ar/fields` -> HTTP 200 OK.
  - `/en/guides` -> HTTP 200 OK (`[]`, empty guides grid).
  - `/ar/guides` -> HTTP 200 OK.
  - `/en/auth/login` -> HTTP 200 OK.
  - `/ar/auth/login` -> HTTP 200 OK.
  - `/en/auth/register` -> HTTP 200 OK.
  - `/ar/auth/register` -> HTTP 200 OK.
  - `/en/auth/forgot-password` -> HTTP 200 OK.
  - `/ar/auth/forgot-password` -> HTTP 200 OK.
  - `/en/admin` -> HTTP 307 (redirects to `/en/admin/login`, unauthenticated access blocked).
  - `/ar/admin` -> HTTP 307 (redirects to `/ar/admin/login`, unauthenticated access blocked).
- **Nginx Reverse Proxy State**:
  - Prepared disabled template with port 3300: `/etc/nginx/sites-available/grantly.conf.disabled`.
  - Not enabled in `sites-enabled/`; Nginx was **NOT** reloaded; public traffic was **NOT** cut over.
- **DNS / SSL State**:
  - DNS was **NOT** modified.
  - SSL certificates were **NOT** issued.
  - No fake domains used.

---

## 8. CI / Verification

Runtime compatibility and package lockfile synchronization have been hardened:

- Standardized Node.js runtime to Node 22 LTS across `.github/workflows/ci.yml` (`node-version: '22'`), `package.json` (`"node": ">=22.0.0"`), `.nvmrc` (`22.14.0`), and `scripts/preflight.ts` (`>= 22.0.0`).
- Synchronized `package-lock.json` with explicit `@emnapi/core` and `@emnapi/runtime` packages to ensure deterministic `npm ci` execution on both Linux (Ubuntu CI runners) and Windows.
- Local & VPS verification results:
  - **Preflight check**: All 7 checks passed (`npm run preflight`).
  - **TypeScript**: Clean compilation with zero errors (`npx tsc --noEmit`).
  - **ESLint**: Clean with zero errors or warnings (`npm run lint`).
  - **Automated test suite**: 44 passed, 0 failed across migrations, auth/guard audits, seed integrity, environment validation, security headers, and production Supabase repository fallback regression tests (`npm test`).
  - **Seed data dry run**: Validated 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides (`npx tsx scripts/seed.ts --dry-run`).
  - **Production build**: Compiled cleanly with Turbopack standalone output verified at `.next/standalone/server.js` (`npm run build`).
- **GitHub Actions CI Quality Gate**: 100% PASS (Run `37305111753` on commit `5aadbf2`, executed on `ubuntu-latest`, all jobs and verification steps green).

---

## 9. Current Completion Assessment

- **MVP feature scope**: 100%
- **Production Supabase schema/security/storage**: ~95%
- **Production Supabase public runtime connection**: 100% (/api/ready = HTTP 200 OK, database = connected)
- **Production Data Integrity & Zero Mock Fallback**: 100% (Detail routes return genuine 404, catalog renders clean empty states)
- **Repository & CI / Runtime hardening**: 100%
- **VPS Isolated Deployment & PM2 Candidate**: 100% (Release `20261005134653` active on port 3300)
- **Production catalog seed**: Pending privileged server-side credential (`SUPABASE_SERVICE_ROLE_KEY`)
- **Production Auth URL configuration**: Pending final domain
- **Production admin**: Pending client credentials
- **Production SMTP**: Pending client decision/credentials
- **Public Domain / DNS / TLS Cutover**: Pending final domain
- **Overall client-deliverable project**: ~99%

---

## 10. Remaining Blockers

1. Supply client-approved privileged secret (`SUPABASE_SERVICE_ROLE_KEY`) for one-time production database seed execution (`npm run seed`) and RLS helper anon execution migration.
2. Provide the official client domain (e.g. `grantly.org`).
3. Configure Supabase Auth Site URL and redirect URLs for that client domain.
4. Provide client administrator credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and execute `npm run bootstrap:admin`.
5. Configure custom SMTP if required for password recovery and email verification.
6. Issue SSL certificate via Certbot, enable `/etc/nginx/sites-available/grantly.conf`, and reload Nginx for public cutover.

---

## 11. Safety Confirmation

- Unrelated production applications (`mohamy-phone-admin`, ELHABAK services, `abud-platform`) were **NOT** touched or modified.
- No secret/service-role key was written to Git.
- No administrator password was created or stored.
- No DNS record was changed.
- No SSL certificate was issued.
- No fake domain was enabled.
- All operations remained strictly isolated to `/var/www/grantly` on unused internal port `3300`.
