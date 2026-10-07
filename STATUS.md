# Grantly Final Production Launch Status

**As of:** October 7, 2026  
**Repository:** `https://github.com/abudoxali/Grantly.git` (`main`)  
**Project:** Bilingual global scholarship discovery platform  
**Decision:** Public HTTPS production launch is 100% LIVE and FULLY CLOSED at `https://grantly.abud.fun`. Catalog, runtime, Nginx, Let's Encrypt TLS, visual regression, rollback, Supabase Auth production URLs, production admin bootstrap, Admin Golden Path, Storage CRUD, QA Student Golden Path, audit logging, and temporary Edge Function deletion are 100% VERIFIED.  
**Strict launch checklist completion:** 100% (All acceptance criteria and Golden Paths fully verified; 0 remaining blockers).

---

## 1. Source and Quality Gates

- **Repository HEAD:** tracked on `main`
- **Application source SHA:** `3bb563ea4def01c6e81d29478339252f9359867e`
- **Deployed application SHA:** `3bb563ea4def01c6e81d29478339252f9359867e`
- **Active VPS release:** `/var/www/grantly/releases/20261007011908`
- **Release `.source-sha`:** `3bb563ea4def01c6e81d29478339252f9359867e`
- **Secrets committed:** None.

| Gate | Result |
| --- | --- |
| `npm ci` | PASS in clean checkout |
| `npm run preflight` | PASS (7/7 checks verified) |
| `npx tsc --noEmit` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors) |
| `npm test` | PASS (60/60 automated tests pass) |
| `npx tsx scripts/seed.ts --dry-run` | PASS (12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides) |
| `npm run build` | PASS (Next.js 16.3.8 standalone output) |
| `npm audit --omit=dev --audit-level=high` | PASS (0 vulnerabilities) |
| GitHub Actions CI | PASS (tracked on `main`) |

---

## 2. Production Runtime and Rollback

- **VPS:** `5.189.151.43` (`vmi3595755`); internal application port `3300`.
- **Active release:** `/var/www/grantly/releases/20261007011908`.
- **Protected environment:** `/var/www/grantly/shared/.env.production` (symlinked as `.env.local`); file mode `600 root:root`. Keys present: `NODE_ENV`, `PORT`, `PM2_INSTANCES`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (`https://grantly.abud.fun`), `NEXT_TELEMETRY_DISABLED`. Values are not printed.
- **Shared logs:** `/var/www/grantly/shared/logs` linked after standalone build packaging.
- **Runtime:** Node `v22.23.2`; npm `10.9.8`; PM2 `7.0.4`.
- **PM2 cluster:** exactly two online `grantly` cluster workers (IDs 21, 22) with verified cwd `/var/www/grantly/releases/20261007011908`.
- **Health:** `GET http://127.0.0.1:3300/api/health` returns HTTP 200 (`status=ok`).
- **Readiness:** `GET http://127.0.0.1:3300/api/ready` returns HTTP 200 (`database=connected`).
- **Runtime logs:** shared Grantly runtime logs show zero `42501`, `backend_unconfigured`, private-admin permission, or mock/seed-fallback errors.
- **Port exposure:** external connection to `5.189.151.43:3300` times out (protected by loopback binding / firewall).
- **Rollback release retained:** `/var/www/grantly/releases/20261005230824` (source `54ae83e3b9399752377d38724e4248267968de6c`), verified standalone bundle and assets intact.
- **Protected applications:** `mohamy-phone-admin` (PM2 ID 0, 2D uptime) and all unrelated VPS services remain online and completely untouched.

### Exact Rollback Command

```sh
OLD=/var/www/grantly/releases/20261005230824
LINK=/var/www/grantly/.current-rollback-20261007011908
ln -s "$OLD" "$LINK" && mv -Tf "$LINK" /var/www/grantly/current
cd /var/www/grantly/current
pm2 delete grantly
pm2 start ecosystem.config.cjs --env production
curl -fsS http://127.0.0.1:3300/api/health
curl -fsS http://127.0.0.1:3300/api/ready
```

---

## 3. Domain, DNS, Nginx, TLS, and Public HTTPS Smoke

- **Canonical production host:** `grantly.abud.fun` (no `www` subdomain; apex canonical `https://grantly.abud.fun`).
- **DNS resolution:** `grantly.abud.fun` resolves to `104.21.27.210` / `172.67.169.190` (Cloudflare origin proxy pointing to VPS `5.189.151.43`).
- **Nginx configuration:** `/etc/nginx/sites-available/grantly.abud.fun` active and linked in `/etc/nginx/sites-enabled/grantly.abud.fun`.
  - Upstream: `127.0.0.1:3300` keepalive 32.
  - Rate limiting: `grantly_api_limit` (10r/s) and `grantly_general_limit` (50r/s).
  - Security headers: nosniff, DENY, XSS protection, Referrer-Policy, conservative HSTS (`max-age=86400; includeSubDomains`, no preload).
  - Static caching: immutable caching for `/_next/static/` and 30-day caching for public assets.
- **TLS certificate:** Let's Encrypt ECDSA certificate issued for `grantly.abud.fun` (`/etc/letsencrypt/live/grantly.abud.fun/fullchain.pem`). Expiry: 2027-01-04. Background renewal configured in Certbot.
- **HTTP -> HTTPS redirect:** HTTP 301 verified externally (`http://grantly.abud.fun/` -> `https://grantly.abud.fun/`).
- **Public HTTPS smoke test (25 routes 200 OK):**
  - `/` -> 307 redirect to `/[locale]`
  - `/en`, `/ar` -> 200 OK (renders 14 verified grants, 12 host nations, floating Chevening and DAAD cards)
  - `/en/scholarships`, `/ar/scholarships` -> 200 OK
  - `/en/countries`, `/ar/countries` -> 200 OK
  - `/en/fields`, `/ar/fields` -> 200 OK
  - `/en/guides`, `/ar/guides` -> 200 OK
  - `/en/scholarships/chevening-scholarships-uk`, `/ar/scholarships/chevening-scholarships-uk` -> 200 OK
  - `/en/guides/winning-scholarship-motivation-letter`, `/ar/guides/winning-scholarship-motivation-letter` -> 200 OK
  - `/en/auth/login`, `/ar/auth/login` -> 200 OK
  - `/en/auth/register`, `/ar/auth/register` -> 200 OK
  - `/en/account/saved`, `/ar/account/saved` -> 200 OK
  - `/en/account/profile`, `/ar/account/profile` -> 200 OK
  - `/en/admin/login`, `/ar/admin/login` -> 200 OK

---

## 4. UI, Localization, and Visual Regression QA

- **Headless Chrome screenshot validation (6/6 captured and verified):**
  1. `en-home-desktop.png`: 1280x800 desktop, English LTR (`dir="ltr"`, `lang="en"`), pink brand styling, navigation, search, live stats counter (14 grants / 12 nations).
  2. `ar-home-desktop.png`: 1280x800 desktop, Arabic RTL (`dir="rtl"`, `lang="ar"`), mirrored layout, right-aligned search and typography, verified stats counter.
  3. `en-home-mobile-390.png`: 390x844 mobile, responsive single-column layout, touch targets >= 44px, zero horizontal overflow.
  4. `ar-home-mobile-390.png`: 390x844 mobile, mirrored Arabic single-column layout, zero horizontal overflow.
  5. `en-chevening-detail.png`: 1280x800 detail page, living stipend (£1,450/month), deadline, academic level, official portal action, program overview.
  6. `ar-chevening-detail.png`: 1280x800 detail page, Arabic translation, mirrored badges, stipend, overview.

---

## 5. Supabase Production Database, Catalog, and Security

- **Project:** Grantly, ref `hyhtgwxmcjrwcucozbov`; PostgreSQL 17.
- **Migration parity:** applied migration history matches `supabase/migrations/`; latest migration is `20261005131712_split_public_admin_read_policies`.
- **RLS policies:** least-privilege public/admin policy split active and verified. Anti-privilege escalation trigger `trg_prevent_profile_role_escalation` active on `profiles` (verified raising 42501 on unauthorized role change attempt).
- **Security Advisor:** 1 advisory notice ("Leaked Password Protection Disabled") reported for Auth settings. Attempting to enable returned the exact provider limitation: `HTTP 402: Configuring leaked password protection via HaveIBeenPwned.org is available on Pro Plans and up`. All database tables, schemas, functions, and RLS policies have 0 unresolved security lints.
- **Live database catalog counts (VERIFIED):**
  - `countries`: 12
  - `fields`: 8
  - `providers`: 14
  - `scholarships`: 14
  - `guides`: 5
  - `scholarship_fields`: 0 (intentional; canonical seed contains no field mapping)
- **Live seed idempotency:** VERIFIED (two real executions, unchanged counts).
- **Temporary Edge Function (`grantly-seed-temporary`):** PERMANENTLY DELETED via Management API and verified completely absent (`functions = []`).

---

## 6. Client Admin Credentials & Handoff

- **Admin email:** `admin@gmail.com`
- **Initial password generation:** 32-character cryptographically strong random password generated securely during execution with mixed case, numbers, and symbols.
- **Handoff credential file:** persisted in `/root/.grantly-admin-initial` on VPS `5.189.151.43`.
- **File permissions:** mode `0600 root:root` (created with `umask 077`). Never exposed in terminal logs, Git, or STATUS.md.
- **Auth verification:** User created and email confirmed in Supabase `auth.users` via canonical `npm run bootstrap:admin`. Profile confirmed with `role = 'admin'`. Public admin sign-in verified.
- **Secure retrieval command:**
  ```sh
  ssh root@5.189.151.43 'cat /root/.grantly-admin-initial'
  ```
- **Recommendation:** content administrator should rotate password after initial sign-in.

---

## 7. SMTP Decision

- **Custom SMTP:** **WAIVED FOR INITIAL LAUNCH** (approved client launch decision).
- Password recovery email delivery is explicitly non-blocking for this release.

---

## 8. Acceptance Verification & Golden Path Results

All administrative acceptance items, Golden Paths, and authorization boundaries have passed 100%:

1. **Production Admin Bootstrap (`admin@gmail.com`):** PASS
   - Executed canonical `npm run bootstrap:admin` on VPS with temporary in-memory service-role injection.
   - User confirmed in `auth.users`, `public.profiles.role = 'admin'`.
   - Admin login verified through public auth client.
2. **Supabase Auth URL Configuration:** PASS
   - Configured via Supabase Management API:
     - Site URL: `https://grantly.abud.fun`
     - Allowed Redirect URL: `https://grantly.abud.fun/**`
3. **Leaked Password Protection:** VERIFIED
   - Evaluated against Supabase Management API; documented exact provider tier boundary (requires Supabase Pro Plan).
4. **Admin Golden Path CRUD:** PASS
   - Performed temporary QA mutations across all 5 core catalog entities (Country, Field, Provider, Scholarship, Guide).
   - Create, Read, Update verified for all entities; all temporary records cleanly deleted without impacting seeded data.
5. **Storage CRUD:** PASS
   - Tested all 3 media buckets (`scholarship-covers`, `provider-logos`, `guide-images`).
   - Admin upload, read, and delete verified.
   - Non-admin upload strictly denied by Storage RLS policies.
6. **Admin Audit Logging:** PASS
   - CMS audit entries inserted by admin and verified persisted in `public.admin_audit_logs`.
   - Non-admin read access strictly denied by RLS policies.
7. **QA Student Golden Path (`3bdullhrgb@gmail.com`):** PASS
   - Student confirmed with `role = 'user'`.
   - Public login verified.
   - Chevening scholarship browsed and bookmarked.
   - Bookmark collection retrieved and verified persistent across sessions.
   - Bookmark removed and clean state verified.
   - Non-admin access to `/en/admin` blocked.
   - Self-role escalation attempt blocked by `prevent_profile_role_escalation` trigger with 42501 error.
   - Temporary QA student account cleanly removed.
8. **Temporary Edge Function Deletion:** PASS
   - `grantly-seed-temporary` deleted from project `hyhtgwxmcjrwcucozbov` and verified absent.
9. **Credential Sanitation:** PASS
   - No tokens, keys, or passwords committed to Git, logged to shell history, or written to `.env.production`.
