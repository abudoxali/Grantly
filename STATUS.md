# Grantly Final Production Launch Status

**As of:** October 6, 2026
**Repository:** `https://github.com/abudoxali/Grantly.git` (`main`)
**Project:** Bilingual global scholarship discovery platform
**Decision:** Not launch-complete; see verified blockers below.
**Strict launch checklist completion:** 50% (12 of 24 acceptance checks fully verified; partial checks are not counted).

## Source and quality gates

- **Application source SHA:** `54ae83e3b9399752377d38724e4248267968de6c`
- **Deployed application SHA:** `54ae83e3b9399752377d38724e4248267968de6c`
- **Source commit GitHub Actions:** run `37373541594`, completed successfully.
- **Final repository HEAD:** post-record commit on `main`.
- **Secrets committed:** None.

| Gate | Result |
| --- | --- |
| `npm ci` | PASS in clean checkout |
| `npm run preflight` | PASS (7/7) |
| `npx tsc --noEmit` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors) |
| `npm test` | PASS (60/60) |
| `npm run seed -- --dry-run` | PASS (12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides) |
| `npm run build` | PASS (Next.js 16.3.8 standalone) |
| `npm audit --omit=dev --audit-level=high` | PASS (0 production vulnerabilities) |
| GitHub Actions for source commit | PASS (run `37373541594`) |

The dependency tree reports zero production-level vulnerabilities. All quality gates executed and passed cleanly.

## Production runtime and rollback

- **VPS:** `5.189.151.43` (`vmi3595755`); internal application port `3300`.
- **Active release:** `/var/www/grantly/releases/20261005230824`.
- **Release `.source-sha`:** `54ae83e3b9399752377d38724e4248267968de6c`.
- **Protected environment:** `.env.local` links to `/var/www/grantly/shared/.env.production`; file mode `600 root:root`. Keys present: `NODE_ENV`, `PORT`, `PM2_INSTANCES`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_TELEMETRY_DISABLED`. Values are not printed.
- **Shared logs:** `/var/www/grantly/shared/logs` linked after standalone build packaging.
- **Runtime:** Node `v22.23.2`; npm `10.9.8`; PM2 `7.0.4`; exactly two online `grantly` cluster workers (PIDs 180004, 180011), both with verified cwd `/var/www/grantly/releases/20261005230824`.
- **Health:** `GET http://127.0.0.1:3300/api/health` returns HTTP 200 (`status=ok`).
- **Readiness:** `GET http://127.0.0.1:3300/api/ready` returns HTTP 200 (`database=connected`).
- **Runtime log check:** shared Grantly runtime logs show zero `42501`, `backend_unconfigured`, private-admin permission, or mock/seed-fallback errors.
- **Port exposure:** external connection to `5.189.151.43:3300` times out (protected by firewall / loopback binding).
- **Rollback release retained:** `/var/www/grantly/releases/20261005174013` (source `bdd673d2a28b50b2dffbe53d1f8b0a27ffe52c30`).
- **Protected applications:** `mohamy-phone-admin` and all unrelated services on the VPS remain online and completely untouched.

Exact rollback command for the retained release:

```sh
OLD=/var/www/grantly/releases/20261005174013
LINK=/var/www/grantly/.current-rollback-20261005230824
ln -s "$OLD" "$LINK" && mv -Tf "$LINK" /var/www/grantly/current
cd /var/www/grantly/current
pm2 delete grantly
pm2 start ecosystem.config.cjs --env production
curl -fsS http://127.0.0.1:3300/api/health
curl -fsS http://127.0.0.1:3300/api/ready
```

## Supabase, data, Auth, and Storage

- **Project:** Grantly, ref `hyhtgwxmcjrwcucozbov`; PostgreSQL 17.
- **Migration parity:** applied migrations match `supabase/migrations/` (latest `20261005131712_split_public_admin_read_policies.sql`).
- **RLS / Security Advisor:** prior authorized audit recorded least-privilege RLS and 0 Security Advisor lints. No database schema or policy changes made since.
- **Current live database row counts (independently queried via Supabase REST API):**

| Table | Rows visible anonymously |
| --- | ---: |
| `countries` | 0 |
| `fields` | 0 |
| `providers` | 0 |
| `scholarships` | 0 |
| `guides` | 0 |
| `scholarship_fields` | 0 |

- **Live production seed:** NOT EXECUTED. `SUPABASE_SERVICE_ROLE_KEY` is MISSING from the production environment. Anon key is properly rejected by `scripts/seed.ts` for security.
- **Expected seed dataset:** 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides; dry-run validation passed.
- **Live seed idempotency:** NOT VERIFIED; blocked until privileged service-role key is available.
- **Real admin:** NOT CREATED. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are MISSING. No credentials were invented.
- **Admin Golden Path:** NOT RUN; approved admin credentials missing.
- **Student Golden Path:** NOT RUN; controlled QA identity and SMTP delivery verification missing.
- **Storage:** policies enforce admin-only write access. Live CRUD verification awaiting admin bootstrap.
- **Supabase Auth URLs:** NOT CONFIGURED/VERIFIED; awaiting official client domain and Supabase management access.
- **SMTP:** NOT CONFIGURED or waived. SMTP host/user/password missing from environment; Supabase dashboard settings inaccessible.

## Domain, Nginx, DNS, TLS, and public smoke

- **Official client domain:** CLIENT INPUT REQUIRED. `NEXT_PUBLIC_SITE_URL` remains `http://127.0.0.1:3300`; no fake hostname was created.
- **Nginx:** template `/etc/nginx/sites-available/grantly.conf.disabled` is present with placeholders. `nginx -t` passes. No Grantly configuration was activated or reloaded; unrelated sites (`mohamy.abud.fun`, `elhabak`, `abud-platform`) are protected and untouched.
- **DNS:** NOT CONFIGURED; awaiting client domain and DNS delegation.
- **HTTPS/TLS:** NOT ACTIVE; awaiting DNS resolution.
- **Public smoke test:** internal production route checks pass 100%:
  - `/` -> 307 redirect to `/[locale]`
  - `/en`, `/ar` -> 200 OK
  - `/en/scholarships`, `/ar/scholarships` -> 200 OK
  - `/en/countries`, `/ar/countries` -> 200 OK
  - `/en/fields`, `/ar/fields` -> 200 OK
  - `/en/guides`, `/ar/guides` -> 200 OK
  - `/en/auth/login`, `/ar/auth/login` -> 200 OK
  - `/en/auth/register`, `/ar/auth/register` -> 200 OK
  - `/en/auth/forgot-password`, `/ar/auth/forgot-password` -> 200 OK
  - `/en/auth/reset-password`, `/ar/auth/reset-password` -> 200 OK
  - `/en/account/saved`, `/ar/account/saved` -> 200 OK
  - `/en/account/profile`, `/ar/account/profile` -> 200 OK
  - `/en/admin/login`, `/ar/admin/login` -> 200 OK
  - `/en/admin`, `/ar/admin` -> 307 redirect to `/admin/login?next=...` (protected route boundary verified)
  - Unseeded scholarship detail `/en/scholarships/chevening-scholarships-uk` -> 404 (proper empty-state behavior; zero mock fallback)

## UI, localization, accessibility, and responsive visual QA

- **Rendered visual QA:** VERIFIED across 360, 390, 430, 768, 1024, 1280, 1440, and 1920px viewports for both Arabic RTL (`dir="rtl"`, `lang="ar"`) and English LTR (`dir="ltr"`, `lang="en"`) using headless Chrome with CDP device metrics emulation.
- **Overflow & layout:** zero horizontal overflow across all viewports (`document.documentElement.scrollWidth <= window.innerWidth`).
- **Typography & RTL:** Arabic headings, search bar, chips, and statistics cards properly aligned to the right; directional arrows mirror correctly (`<-` in RTL, `->` in LTR). English aligns to the left.
- **Brand palette:** feminine pink-led palette (`#d81b60` / `#ad1457`) applied consistently across CTAs, badges, highlights, and borders.
- **Navigation drawer:** mobile menu trigger and navigation drawer functioning properly with keyboard escape, focus trap, and safe area padding.
- **Accessibility:** skip-to-main links, ARIA labels, focus-visible outlines, contrast ratios, and touch target sizes (min 44px) intact.

## Client handoff readiness

- **Repository:** `https://github.com/abudoxali/Grantly.git` (`main`)
- **Active VPS release:** `/var/www/grantly/releases/20261005230824`
- **Application port:** 3300 (PM2 cluster, 2 instances)
- **Database:** Supabase project `Grantly` (`hyhtgwxmcjrwcucozbov`), PostgreSQL 17
- **Admin CMS workflow:** Once bootstrap credentials are provided and `npm run bootstrap:admin` is executed, content managers can log into `/admin` to create and update scholarships, countries, fields, and application guides with real-time audit logging.

## Exact remaining blockers

1. **Supabase Privileged Access:** `SUPABASE_SERVICE_ROLE_KEY` or Supabase Management API access is required to execute the real production seed (`npm run seed`), verify seed idempotency, and run administrative advisor checks.
2. **Production Admin Credentials:** Client-approved `ADMIN_EMAIL` and `ADMIN_PASSWORD` (minimum 8 characters, non-weak) are required to execute `npm run bootstrap:admin` and run the Admin Golden Path.
3. **Official Client Domain & DNS:** Official production domain (with canonical apex vs. www decision) and DNS records pointing to VPS `5.189.151.43` are required to configure Nginx, issue Let's Encrypt TLS certificates, set `NEXT_PUBLIC_SITE_URL`, and configure Supabase Auth redirect URLs.
4. **SMTP Provider Credentials:** SMTP host, port, user, and password (or an explicit client waiver) are required for transactional auth emails (password recovery, email verification).
5. **QA Student Identity:** Controlled test account credentials for end-to-end Student Golden Path verification.

## Completion summary

- **Strict acceptance checklist:** 12 of 24 checks verified (50%).
- **Internal application & runtime readiness:** 100% verified.
- **Public cutover status:** Paused awaiting external client inputs above.
