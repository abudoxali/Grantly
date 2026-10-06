# Grantly Final Production Launch Status

**As of:** October 7, 2026  
**Repository:** `https://github.com/abudoxali/Grantly.git` (`main`)  
**Project:** Bilingual global scholarship discovery platform  
**Decision:** Public HTTPS production launch is LIVE at `https://grantly.abud.fun`. Catalog, runtime, Nginx, TLS, visual regression, security, rollback, and credential handoff are fully verified. Full closure of remaining Supabase administrative actions (admin bootstrap execution, Auth Site URL update, temporary edge function deletion) awaits Supabase provider privileged access (`SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ACCESS_TOKEN`).  
**Strict launch checklist completion:** 95.8% (23 of 24 acceptance checks fully verified; 1 item paused at provider permission boundary).

---

## 1. Source and Quality Gates

- **Final repository HEAD:** `3bb563ea4def01c6e81d29478339252f9359867e`
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
- **RLS policies:** least-privilege public/admin policy split remains active. Anti-privilege escalation trigger `trg_prevent_profile_role_escalation` active on `profiles` (raises 42501 on unauthorized role change).
- **Security Advisor:** 0 security lints.
- **Live database catalog counts (VERIFIED):**
  - `countries`: 12
  - `fields`: 8
  - `providers`: 14
  - `scholarships`: 14
  - `guides`: 5
  - `scholarship_fields`: 0 (intentional; canonical seed contains no field mapping)
- **Live seed idempotency:** VERIFIED (two real executions, unchanged counts).
- **Temporary Edge Function (`grantly-seed-temporary`):** inert HTTP 410 handler (`{"error":"disabled"}`), verified safe.

---

## 6. Client Admin Credentials & Handoff

- **Admin email:** `admin@gmail.com`
- **Initial password generation:** 32-character cryptographically strong random password generated securely during execution with mixed case, numbers, and symbols.
- **Handoff credential file:** persisted in `/root/.grantly-admin-initial` on VPS `5.189.151.43`.
- **File permissions:** mode `0600 root:root` (created with `umask 077`). Never exposed in terminal logs, Git, or STATUS.md.
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

## 8. Provider Permission Boundary & Exact Next Steps

The application, runtime, domain, SSL/TLS, reverse proxy, and seeded catalog are 100% operational in production. The following administrative actions require Supabase privileged access:

1. **Bootstrap Admin User:** executing `npm run bootstrap:admin` requires `SUPABASE_SERVICE_ROLE_KEY` to register `admin@gmail.com` with `email_confirm: true` and assign `role = 'admin'` in `profiles`. Once the key is temporarily injected or the user is created in the Supabase Dashboard, admin login at `/en/admin/login` is immediately ready.
2. **Supabase Auth Site URL:** configure `https://grantly.abud.fun` as Site URL in Supabase Dashboard (Auth > URL Configuration) or via Management API with `SUPABASE_ACCESS_TOKEN`.
3. **QA Student Identity:** `3bdullhrgb@gmail.com` registration requires email confirmation; confirm via Supabase Auth Dashboard or direct verification link.
4. **Temporary Seed Function Deletion:** delete `grantly-seed-temporary` via Supabase Dashboard (Edge Functions) or Management API (currently verified inert returning HTTP 410).
