# Grantly Production Hardening Status

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform
**Target architecture**: Next.js 16 standalone + Supabase PostgreSQL + PM2 + Nginx
**Date**: October 5, 2026
**Status**: Source-level RLS and repository fixes pass local quality gates. Live RLS migration and fresh VPS deployment are pending authorized production access. Production seed has not been run.

---

## 1. Source Control

- **Repository**: `https://github.com/abudoxali/Grantly.git`
- **Branch**: `main`
- **Verified remote base HEAD before this hardening pass**: `5c137c0fe824bafceed4df5a1aa85c1a197702c3`
- **Secrets committed**: None
- **Hardening source commit**: `828e5865c8525e0a2c63d5cfe08f8f6dc7032d0e`
- **GitHub Actions CI**: Run `37310810443` completed successfully for the hardening source commit.

---

## 2. Production Supabase

- **Project**: `Grantly` (`hyhtgwxmcjrwcucozbov`), region `eu-central-1`
- **Status last recorded**: `ACTIVE_HEALTHY`
- **Project URL**: `https://hyhtgwxmcjrwcucozbov.supabase.co`
- **Database**: PostgreSQL 17
- **Publishable client key**: Configured; value intentionally omitted.
- **Privileged database access**: Supabase CLI is unavailable locally; no Supabase access token, database URL/password, or service-role credential is configured in this environment. No credentials were invented or used.

### Live migrations

Previously recorded as applied:

1. `20261004224554_initial_schema`
2. `20261004224624_security_hardening`
3. `20261004224839_function_privilege_hardening`
4. `20261004224906_rls_performance_hardening`
5. `20261004224937_move_admin_helper_private`

Repository migration for this pass:

- `supabase/migrations/20261005140000_split_public_admin_read_policies.sql`
- **LIVE RLS MIGRATION = PENDING AUTHORIZED SUPABASE ADMIN EXECUTION**
- The unapplied `20261005140000_grant_anon_execute_admin_helper.sql` approach was replaced. No anonymous grant of `private` schema usage or `private.is_admin()` execution remains in the repository migration sequence.

---

## 3. RLS Finding, Target Design, and Audit

### Root issue

The previously deployed scholarship and guide SELECT policies combined `published = true` with `private.is_admin()`. The helper is intentionally not executable by `anon`; evaluating those policies can therefore return PostgreSQL `42501 permission denied for function is_admin`. The repository previously converted that error into empty/null results, hiding an access-control/configuration failure as absent content.

### Intended final read policies

- **Scholarships**: `anon, authenticated` may SELECT only rows with `published = true`. A separate SELECT policy grants `authenticated` administrators all rows through `private.is_admin()`.
- **Guides**: same independent published-only public SELECT and authenticated-admin SELECT policies.
- **Private helper**: schema and function remain revoked from `PUBLIC` and `anon`; authenticated policies retain only the access required to call the helper.
- **Anonymous access to private schema/helper**: **NO**.

### Other RLS protections reviewed

- `profiles`: authenticated own-profile access; admin access remains helper-protected; role-escalation trigger protection remains.
- `countries`, `fields`, `providers`: public reads do not call the admin helper; writes remain authenticated-admin-only.
- `scholarship_fields`: public reads do not call the admin helper; writes remain authenticated-admin-only.
- `bookmarks`: authenticated SELECT/INSERT/DELETE remain restricted to `(SELECT auth.uid()) = user_id`.
- `admin_audit_logs`: read/insert remain authenticated-admin-only.
- `storage.objects`: public read remains limited to the configured media buckets; insert/update/delete remain authenticated-admin-only.

The consolidated `src/lib/supabase/schema.sql` snapshot was aligned to the same private-helper and split-read design.

---

## 4. Repository Error Semantics and Mock Fallback

`src/lib/db/repository.ts` now distinguishes database outcomes:

- Successful list query with `data = []` and `error = null` returns a genuine empty list (`{ scholarships: [], total: 0 }` or `[]`).
- Legitimate `PGRST116` single-row not-found results continue to return `null`.
- Production `42501` errors now throw an explicit `Database security error [42501] ...`; they are never converted to `[]` or `null`.
- Production catalog errors do not fall back to `SEED_*` or `LocalDataStore`.
- Development-only seed fallback remains available where previously intended.

The active VPS release has not been replaced in this pass, so the source correction is not yet live. The previously deployed application had already eliminated production mock-data fallback, but it still contained the 42501-as-empty behavior until a fresh release is deployed.

---

## 5. Production Data and Seed State

- **Live seed**: Not run; production data was not modified.
- **Last recorded real row counts**: `countries` 0, `fields` 0, `providers` 0, `scholarships` 0, `guides` 0, `scholarship_fields` 0. These counts were not re-queried in this pass; anonymous catalog results are not accepted as proof while the RLS migration is pending.
- **Seed dry run**: Passed during this pass; validated 12 countries, 8 fields, 14 providers, 14 scholarships, and 5 guides.
- **Live seed idempotency**: Not verified; requires authorized privileged credentials. No production seed will run until authorized.

---

## 6. VPS and Live Verification

- **VPS**: `5.189.151.43`; internal application port `3300`.
- **Active release reported at the start of this pass**: `/var/www/grantly/releases/20261005134653`.
- **Fresh release**: Not created. No files in the existing release were changed.
- **Deployment access**: The configured SSH alias points to `161.35.54.6`, not this VPS. No target-specific authorized SSH login is configured, so deployment, PM2 reload, packaging, and live post-deploy verification were not attempted.
- **PM2 `grantly`**: Previously reported online on port 3300; not rechecked in this pass.
- **`/api/health` and `/api/ready`**: Both were reported HTTP 200 at the start of this pass; neither was rechecked because authorized VPS access is unavailable.
- **Anonymous live scholarship/guide queries**: Not run. Since the migration is pending, empty responses would not be accepted as proof of correct RLS.
- **Nginx, DNS, SSL, and public exposure**: Not changed.
- **Unrelated production apps**: No VPS operations were performed; existing apps remain untouched by this pass.

---

## 7. Quality Gates and CI

Local checks completed for this source state:

| Gate | Result |
| --- | --- |
| `npm ci` | PASS (530 packages installed; no lockfile changes) |
| `npm run preflight` | PASS (7/7 checks) |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS (59/59) |
| `npm run seed -- --dry-run` | PASS (12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides) |
| `npm run build` | PASS (Next.js 16.3.8 standalone build) |
| `npm audit --omit=dev --audit-level=high` | PASS (0 production dependency vulnerabilities) |

The build reports the existing Next.js middleware-convention deprecation warning; the production build succeeds. The full `npm ci` install also reported high advisories in the dev-inclusive dependency tree; no automatic dependency changes were made.

**GitHub Actions for the hardening commit**: Run `37310810443` completed successfully. The status-only follow-up commit `f1e9ec3` also passed run `37311222806`.

---

## 8. Completion and Remaining Blockers

- **Source RLS/repository hardening**: 100% implemented and locally verified.
- **Requested hardening phase**: Approximately 75%; live RLS application and fresh VPS release/verification remain blocked by authorized access.
- **Overall client-deliverable project**: Approximately 90%; domain, Auth URL, administrator, SMTP, and public cutover decisions remain outstanding.

Remaining blockers:

1. Authorized Supabase administration access to apply `20261005140000_split_public_admin_read_policies.sql` and verify anonymous published-content queries.
2. Authorized SSH access targeting `5.189.151.43` to create a fresh release, package it, atomically switch `current`, reload only `grantly`, and verify health/readiness.
3. Authorized `SUPABASE_SERVICE_ROLE_KEY` for the separately approved production seed; seeding remains disabled in this pass.
4. Official client domain and Supabase Auth Site URL/redirect configuration.
5. Client-approved administrator credentials and SMTP configuration if required.
6. Domain/DNS/TLS approval before public Nginx cutover.

---

## 9. Safety Confirmation

- No live RLS migration was marked applied.
- No anonymous admin privileges were granted.
- No production seed or admin bootstrap was run.
- No production release was modified in place; no fresh release was created without target access.
- No secrets, service-role keys, or administrator credentials were written to Git or this file.
- No DNS, SSL, public Nginx, or unrelated production application changes were made.
