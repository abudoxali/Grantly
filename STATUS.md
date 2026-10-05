# Grantly Final Production Status

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform  
**Target Architecture**: Next.js 16 (App Router, Standalone) + Supabase PostgreSQL + PM2 + Nginx  
**Date**: October 5, 2026  
**Status**: VPS Integration & PM2 Candidate Deployed — Liveness Verified, Readiness & Catalog Seed Blocked Pending Server Credentials & Domain

---

## 1. Source Control

- **Repository**: `https://github.com/abudoxali/Grantly.git`
- **Branch**: `main`
- **MVP Scope**: Closed / feature-complete
- **Supabase production project**: Created and active (`hyhtgwxmcjrwcucozbov`)
- **VPS application candidate**: Deployed internally to `/var/www/grantly/releases/20261005090013`
- **Secrets committed**: None

---

## 2. Production Supabase

- **Project name**: `Grantly`
- **Project ref**: `hyhtgwxmcjrwcucozbov`
- **Region**: `eu-central-1`
- **Status**: `ACTIVE_HEALTHY`
- **Project URL**: `https://hyhtgwxmcjrwcucozbov.supabase.co`
- **Database**: PostgreSQL 17
- **Publishable client key**: Available from Supabase; value intentionally omitted from this file
- **Secret/service-role key**: Never stored in Git or STATUS.md

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

- **Seed Status**: BLOCKED — server-side Supabase secret (`SUPABASE_SERVICE_ROLE_KEY`) is not available in the environment.
- **Real Database Row Count**: 0. Core content tables are currently empty.
- **Dry-run validation on VPS**: PASSED cleanly (`npm run seed -- --dry-run`), validating 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides.

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
  │   └── 20261005090013/
  ├── shared/
  │   ├── .env.production (chmod 600, restricted)
  │   └── logs/
  └── current -> /var/www/grantly/releases/20261005090013
  ```
- **VPS Build & Quality Gates Execution**:
  - `npm ci`: PASSED (414 packages installed cleanly).
  - `npm run preflight`: PASSED (7/7 checks).
  - `npx tsc --noEmit`: PASSED (0 errors).
  - `npm run lint`: PASSED (0 errors, 0 warnings).
  - `npm test`: PASSED (28/28 tests passed).
  - `npm run seed -- --dry-run`: PASSED (data integrity validated).
  - `npm run build`: PASSED (Turbopack standalone build, static & dynamic routes compiled).
  - Standalone Asset Packaging: Packaged `server.js`, `public/`, and `.next/static/`.
- **PM2 Candidate State**:
  - Process Name: `grantly` (Cluster mode, 2 instances, PIDs 150457 & 150464).
  - Status: `online`, 0 restarts, stable memory (~27MB per instance).
  - Port: Listening on `127.0.0.1:3300` (shielded by UFW; port 3300 not exposed to public internet).
- **Health & Readiness Endpoints**:
  - `GET /api/health`: **HTTP 200 OK** (`{"status":"ok","service":"grantly","version":"0.1.0"}`). Security headers verified.
  - `GET /api/ready`: **HTTP 503 Service Unavailable** (truthfully reporting unconfigured backend: `"errors":["NEXT_PUBLIC_SUPABASE_ANON_KEY is required in production."]`).
- **Route Smoke Tests on Internal Port**:
  - `/` -> HTTP 307 (redirects to `/en`).
  - `/en/auth/login` -> HTTP 200 OK.
  - `/en/admin` -> HTTP 307 (redirects to `/en/admin/login?error=backend_unconfigured`).
  - `/ar/admin` -> HTTP 307 (redirects to `/ar/admin/login?error=backend_unconfigured`).
  - Public catalog routes (`/en`, `/ar`, `/en/scholarships`, etc.) -> HTTP 500 (designed security failure: production mode refuses to render fallback mock data when Supabase credentials are missing).
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
- Local verification results:
  - **Preflight check**: All 7 checks passed (`npm run preflight`).
  - **TypeScript**: Clean compilation with zero errors (`npx tsc --noEmit`).
  - **ESLint**: Clean with zero errors or warnings (`npm run lint`).
  - **Automated test suite**: 28 passed, 0 failed across migrations, auth/guard audits, seed integrity, environment validation, and security headers (`npm test`).
  - **Seed data dry run**: Validated 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides (`npx tsx scripts/seed.ts --dry-run`).
  - **Production build**: Compiled cleanly with Turbopack standalone output verified at `.next/standalone/server.js` (`npm run build`).
- **GitHub Actions CI Quality Gate**: 100% PASS (Runs `37271259748` and `37271406823`, executed on `ubuntu-latest`, all jobs and verification steps green).

---

## 9. Current Completion Assessment

- **MVP feature scope**: 100%
- **Production Supabase schema/security/storage**: ~95%
- **Repository & CI / Runtime hardening**: 100%
- **VPS Isolated Deployment & PM2 Candidate**: 100%
- **Production catalog seed**: Pending server-side secret
- **Production Auth URL configuration**: Pending final domain
- **Production admin**: Pending client credentials
- **Production SMTP**: Pending client decision/credentials
- **Public Domain / DNS / TLS Cutover**: Pending final domain
- **Overall client-deliverable project**: ~98%

---

## 10. Remaining Blockers

1. Supply client-approved production Supabase credentials (`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`) in `/var/www/grantly/shared/.env.production`.
2. Execute the production database seed: `npm run seed`.
3. Provide the official client domain (e.g. `grantly.org`).
4. Configure Supabase Auth Site URL and redirect URLs for that client domain.
5. Provide client administrator credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and execute `npm run bootstrap:admin`.
6. Configure custom SMTP if required for password recovery and email verification.
7. Issue SSL certificate via Certbot, enable `/etc/nginx/sites-available/grantly.conf`, and reload Nginx for public cutover.

---

## 11. Safety Confirmation

- Unrelated production applications (`mohamy-phone-admin`, ELHABAK services, `abud-platform`) were **NOT** touched or modified.
- No secret/service-role key was written to Git.
- No administrator password was created or stored.
- No DNS record was changed.
- No SSL certificate was issued.
- No fake domain was enabled.
- All operations remained strictly isolated to `/var/www/grantly` on unused internal port `3300`.
