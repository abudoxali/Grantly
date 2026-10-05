# Grantly Final Production Status

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform  
**Target Architecture**: Next.js 16 (App Router, Standalone) + Supabase PostgreSQL + PM2 + Nginx  
**Date**: October 5, 2026  
**Status**: Production Supabase Provisioned & Hardened — Final Seed / Domain / Admin / VPS Launch Pending

---

## 1. Source Control

- **Repository**: `https://github.com/abudoxali/Grantly.git`
- **Branch**: `main`
- **MVP Scope**: Closed / feature-complete
- **Supabase production project**: Created and active
- **Live application deployment**: Not performed yet
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

The initial catalog has **not yet been written** to the production database. Core content tables are currently empty.

Reason: the connected Supabase management integration intentionally exposes project management and publishable keys but does not expose the server-side secret/service-role key required by the repository seed script. The secret must be supplied only through a secure runtime environment during the deployment pass.

Expected initial seed after execution:

- 12 countries
- 8 academic fields
- 14 providers
- 14 scholarships
- 5 guides

Canonical command:

```bash
npm run seed
```

Never store or print the secret/service-role key.

---

## 6. Auth / Admin / Email

### Auth

- Supabase Auth backend is available.
- Production Site URL / redirect URLs are still pending the final client domain.
- No localhost URL should remain as the production primary callback after launch.

### Admin

- No real production administrator has been created.
- This is intentional: client-approved admin email/password are still required.
- Production bootstrap remains:

```bash
npm run bootstrap:admin
```

Credentials must be supplied through secure runtime environment variables and must never be committed.

### Email

- Password recovery implementation exists.
- Custom production SMTP is not configured yet.
- SMTP configuration depends on client/domain email decisions.

---

## 7. Application / Deployment State

The application package remains prepared for:

- Next.js standalone output
- PM2 process supervision
- Nginx reverse proxy
- atomic timestamped releases under `/var/www/grantly/releases/`
- `/var/www/grantly/current` symlink
- `/api/health`
- `/api/ready`
- rollback script

The authorized shared production VPS is now known, but **Grantly has not been deployed to it yet**.

Deployment must inspect existing ports and services before selecting `APP_PORT` and must not modify unrelated production applications.

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

---

## 9. Current Completion Assessment

- **MVP feature scope**: 100%
- **Production Supabase schema/security/storage**: ~95%
- **Repository & CI / Runtime hardening**: 100%
- **Production catalog seed**: Pending server-side secret
- **Production Auth URL configuration**: Pending final domain
- **Production admin**: Pending client credentials
- **Production SMTP**: Pending client decision/credentials
- **VPS application deployment**: Pending
- **DNS / TLS**: Pending
- **Overall client-deliverable project**: ~97%

---

## 10. Remaining Blockers

1. Supply the Supabase server-side secret/service-role key securely at runtime and execute the corrected production seed (`npm run seed`).
2. Provide the final client domain.
3. Configure Supabase Auth Site URL / redirects for that domain.
4. Provide client administrator email/password securely and run `bootstrap:admin`.
5. Configure custom SMTP if required for production email reliability.
6. Deploy Grantly to the authorized VPS using an unused internal port.
7. Configure Nginx, DNS, HTTPS, live smoke tests, backup, and client handoff.

---

## 11. Safety Confirmation

- No secret/service-role key was written to Git.
- No administrator password was created or stored.
- No DNS record was changed.
- No SSL certificate was issued.
- No Grantly application deployment to the VPS occurred in this Supabase provisioning pass.
- Existing unrelated production applications were not modified.
