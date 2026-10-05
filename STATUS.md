# Grantly Final Production Synchronization Status

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform
**Target architecture**: Next.js 16 standalone + Supabase PostgreSQL + PM2 + Nginx
**Date**: October 5, 2026
**Status**: Live RLS migration version parity is restored. Hardened source SHA `891c5363902c177f325ab7bcd6d5eeee097369e4` is active on the VPS. Health, readiness, anonymous counts, empty catalogs, detail 404s, and PM2 were verified. Production seed remains intentionally unexecuted.

---

## 1. Source Control

- **Repository**: `https://github.com/abudoxali/Grantly.git`
- **Branch**: `main`
- **Expected remote HEAD at start of this pass**: `0c668003d2646d22b8c74ed3a567e67cc0ca3901`
- **Deployed source SHA**: `891c5363902c177f325ab7bcd6d5eeee097369e4`
- **GitHub Actions for deployed source**: Run `37317318093` completed successfully.
- **Secrets committed**: None

---

## 2. Live Supabase and Migration Parity

- **Project**: `Grantly` (`hyhtgwxmcjrwcucozbov`), region `eu-central-1`
- **Database**: PostgreSQL 17
- **LIVE RLS MIGRATION = APPLIED**
- **Live migration version**: `20261005131712_split_public_admin_read_policies`
- **Repository migration**: `supabase/migrations/20261005131712_split_public_admin_read_policies.sql`
- **Migration parity**: **PASS** — the repository filename matches the live migration-history version. The old `20261005140000_...` filename and duplicate migration are absent.
- **Security Advisor**: 0 security lints after the live RLS change, per authorized Supabase administration verification.

### Verified live privileges and anonymous query results

- `anon` private schema USAGE: **false**
- `anon` `private.is_admin()` EXECUTE: **false**
- `authenticated` private schema USAGE: **true**
- `authenticated` `private.is_admin()` EXECUTE: **true**

Anonymous published-content queries succeeded without 42501:

| Table | Anonymous result |
| --- | ---: |
| `scholarships` (`published = true`) | 0 rows |
| `guides` (`published = true`) | 0 rows |
| `countries` | 0 rows |
| `fields` | 0 rows |
| `providers` | 0 rows |
| `scholarship_fields` | 0 rows |

### RLS policy design

- Scholarships and guides each have a public SELECT policy for `anon, authenticated` using only `published = true`.
- Each has a separate authenticated-admin SELECT policy using `private.is_admin()`.
- Admin CRUD, profile role-escalation protection, bookmark ownership, audit-log protection, and Storage write protections remain intact.
- Public policies do not invoke the private admin helper; no anonymous private-schema/helper privilege was granted.

---

## 3. Production Repository Behavior

`src/lib/db/repository.ts` preserves strict production behavior:

- Successful empty list queries (`data = []`, `error = null`) return genuine empty lists.
- Legitimate `PGRST116` single-row not-found results return `null`.
- Production `42501` errors throw `Database security error [42501] ...`; they do not become `[]` or `null`.
- Production queries do not fall back to `LocalDataStore` or `SEED_*`.
- Development-only fixture behavior remains restricted to development.

---

## 4. Quality Gates

Local checks on the migration-parity source:

| Gate | Result |
| --- | --- |
| `npm ci` | PASS |
| `npm run preflight` | PASS (7/7) |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS (59/59) |
| `npm run seed -- --dry-run` | PASS (12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides) |
| `npm run build` | PASS (Next.js 16.3.8 standalone) |
| `npm audit --omit=dev --audit-level=high` | PASS (0 production dependency vulnerabilities) |

The local and VPS builds emit the existing Next.js middleware-convention deprecation warning but complete successfully. `npm ci` also reports five high advisories across the dev-inclusive dependency tree; no broad dependency changes were made.

VPS release quality gates also passed: `npm ci` (413 packages), preflight, typecheck, lint, 59/59 tests, seed dry-run, build with the protected production environment link, and standalone asset packaging.

---

## 5. VPS Deployment and Runtime Verification

- **VPS**: `5.189.151.43` (`vmi3595755`), SSH user `root`
- **Internal application port**: `3300`
- **Fresh active release**: `/var/www/grantly/releases/20261005153731`
- **Deployed SHA**: `891c5363902c177f325ab7bcd6d5eeee097369e4`
- **Source verification**: The release `.source-sha` matches the deployed SHA.
- **Environment**: Candidate release links `.env.local` to `/var/www/grantly/shared/.env.production`; values were not printed.
- **Current symlink**: `/var/www/grantly/current` resolves to `/var/www/grantly/releases/20261005153731`.
- **PM2**: `grantly` has two cluster instances, both online with 0 restarts after launch; both run from the new release’s `.next/standalone` directory. Port 3300 is listening. Only `grantly` was reconfigured; unrelated PM2 apps were not changed.
- **Health**: `GET /api/health` — HTTP 200.
- **Readiness**: `GET /api/ready` — HTTP 200, database connected.

### Application smoke verification

| Route | Result |
| --- | --- |
| `/en` | HTTP 200; no fixture content |
| `/en/scholarships` | HTTP 200; “No scholarships found”; 0 scholarship cards |
| `/en/guides` | HTTP 200; 0 guide cards |
| `/en/countries` | HTTP 200; 0 country cards |
| `/en/fields` | HTTP 200; 0 field cards |
| `/en/scholarships/chevening-scholarships-uk` | HTTP 404 |
| `/en/guides/winning-scholarship-motivation-letter` | HTTP 404 |

Anonymous Supabase counts and application pages showed zero catalog records and no fixture content. PM2 logs were checked after these requests: no `permission denied for function is_admin`, `42501`, `backend_unconfigured`, mock fallback, or unhandled database errors were found.

An earlier inactive candidate release `/var/www/grantly/releases/20261005153146` encountered a Turbopack root-escape panic because its shared logs symlink was placed before build. It was never activated. The successful release builds first and links shared logs afterward. No existing release was modified in place or deleted.

---

## 6. Seed and Remaining Blockers

- **Live seed**: **NOT EXECUTED**. No production rows were written.
- **Live seed idempotency**: **NOT YET VERIFIED**; seeding remains a separately controlled authorized Supabase administration step.
- No service-role key was invented, requested in chat, or written to Git.
- Remaining product-launch work: authorized production seed when approved; final client domain and Supabase Auth URLs; client-approved admin credentials; SMTP decision/configuration; and DNS/TLS/public Nginx cutover approval.
- DNS, SSL, Nginx, and unrelated production services were not changed.

---

## 7. Completion and Safety

- **Migration history parity and least-privilege live RLS**: 100% verified.
- **Hardened source deployment and production smoke checks**: 100% verified.
- **This synchronization pass**: Source, migration parity, deployment, and production acceptance checks completed; final push-triggered CI status is reported in the completion record.
- **Overall client-deliverable project**: Approximately 90%; separate seed and domain/auth/admin/SMTP/public-cutover work remains.
- No duplicate migration remains.
- No anonymous admin/helper privilege was granted.
- No production seed or admin bootstrap was run.
- No unrelated app, PostgreSQL service, Nginx configuration, DNS record, or SSL certificate was modified.
- No secrets or administrator credentials are recorded in this file.
