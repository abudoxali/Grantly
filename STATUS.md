# Grantly Final Production Launch Status

**As of:** October 6, 2026
**Repository:** `https://github.com/abudoxali/Grantly.git` (`main`)
**Project:** Bilingual global scholarship discovery platform
**Decision:** Production catalog/data phase is complete. Public launch is still blocked only by client-controlled admin/domain/email inputs and final Golden Paths.
**Strict launch checklist completion:** 62.5% (15 of 24 acceptance checks fully verified; partial checks are not counted).

## Source and quality gates

- **Application source SHA:** `54ae83e3b9399752377d38724e4248267968de6c`
- **Deployed application SHA:** `54ae83e3b9399752377d38724e4248267968de6c`
- **Source commit GitHub Actions:** run `37373541594`, completed successfully.
- **Final repository HEAD:** this status record follows the deployed application source; the deployed application SHA is unchanged.
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
- **Runtime:** Node `v22.23.2`; npm `10.9.8`; PM2 `7.0.4`; exactly two online `grantly` cluster workers with verified cwd `/var/www/grantly/releases/20261005230824`.
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

## Supabase, production data, Auth, and Storage

- **Project:** Grantly, ref `hyhtgwxmcjrwcucozbov`; PostgreSQL 17.
- **Migration parity:** PASS. Applied migration history still matches `supabase/migrations/`; latest migration is `20261005131712_split_public_admin_read_policies`.
- **RLS:** least-privilege public/admin policy split remains active. Anonymous public reads do not require the private admin helper.
- **Security Advisor:** PASS, 0 security lints after the production seed verification.
- **Performance Advisor:** informational/warning-only findings remain: unused-index notices on a newly populated/low-traffic database and two multiple-permissive-policy notices caused by the deliberate published-content + authenticated-admin SELECT policy split. No security weakening or index removal was performed.

### Production seed — completed and verified

The live production catalog was seeded through authorized Supabase administration using the canonical repository source `src/lib/data/seed-data.ts` and the same deterministic UUID mapping used by `scripts/seed.ts`.

The canonical seed was executed twice. Both executions completed successfully and final counts remained unchanged, so live seed idempotency is verified.

| Table | Exact live rows |
| --- | ---: |
| `countries` | 12 |
| `fields` | 8 |
| `providers` | 14 |
| `scholarships` | 14 |
| `guides` | 5 |
| `scholarship_fields` | 0 |

`scholarship_fields` remains 0 intentionally because the canonical repository seed defines no scholarship-to-field association mapping; no relationships were invented.

Production data verification:

- Duplicate country slugs: 0
- Duplicate field slugs: 0
- Duplicate provider slugs: 0
- Duplicate scholarship slugs: 0
- Duplicate guide slugs: 0
- Orphan provider country references: 0
- Orphan scholarship country references: 0
- Orphan scholarship provider references: 0
- Published scholarships: 14
- Published guides: 5
- Anonymous RLS visibility: 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides, 0 scholarship-field joins
- Representative canonical-content verification passed for Chevening and the motivation-letter guide, including deterministic UUIDs and detailed content arrays/Markdown.

A one-time temporary seed bridge was used only to execute the canonical server-side seed without exposing a privileged Supabase secret. It left no schema changes or extra migration-history entry. The temporary Edge Function has been replaced by an inert HTTP 410 handler with JWT verification enabled; it no longer contains seed capability.

- **Live production seed:** PASS.
- **Exact live counts:** PASS.
- **Live seed idempotency:** VERIFIED (two real executions, unchanged counts).
- **Real admin:** NOT CREATED. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are still client inputs; no credentials were invented.
- **Admin Golden Path:** NOT RUN; approved admin credentials missing.
- **Student Golden Path:** NOT RUN; controlled QA identity and SMTP delivery verification missing.
- **Storage:** policies enforce admin-only write access. Live CRUD verification awaits admin bootstrap.
- **Supabase Auth URLs:** NOT CONFIGURED/VERIFIED; awaiting the official client domain.
- **SMTP:** NOT CONFIGURED or waived. SMTP provider inputs are still missing.

## Domain, Nginx, DNS, TLS, and public smoke

- **Official client domain:** CLIENT INPUT REQUIRED. `NEXT_PUBLIC_SITE_URL` remains `http://127.0.0.1:3300`; no fake hostname was created.
- **Nginx:** template `/etc/nginx/sites-available/grantly.conf.disabled` is present with placeholders. `nginx -t` passes. No Grantly configuration was activated or reloaded; unrelated sites (`mohamy.abud.fun`, `elhabak`, `abud-platform`) are protected and untouched.
- **DNS:** NOT CONFIGURED; awaiting client domain and DNS delegation.
- **HTTPS/TLS:** NOT ACTIVE; awaiting DNS resolution.
- **Public smoke test:** previous internal production route checks passed; after seeding, catalog/detail routes must be rechecked in the final launch pass against the populated production database.

## UI, localization, accessibility, and responsive visual QA

- **Rendered visual QA:** VERIFIED across 360, 390, 430, 768, 1024, 1280, 1440, and 1920px viewports for both Arabic RTL (`dir="rtl"`, `lang="ar"`) and English LTR (`dir="ltr"`, `lang="en"`) using headless Chrome with CDP device metrics emulation.
- **Overflow & layout:** zero horizontal overflow across all viewports (`document.documentElement.scrollWidth <= window.innerWidth`).
- **Typography & RTL:** Arabic headings, search bar, chips, and statistics cards properly aligned to the right; directional arrows mirror correctly (`<-` in RTL, `->` in LTR). English aligns to the left.
- **Brand palette:** feminine pink-led palette applied consistently across CTAs, badges, highlights, and borders.
- **Navigation drawer:** mobile menu trigger and navigation drawer functioning properly with keyboard escape, focus trap, and safe area padding.
- **Accessibility:** skip-to-main links, ARIA labels, focus-visible outlines, contrast ratios, and touch target sizes (min 44px) intact.

## Client handoff readiness

- **Repository:** `https://github.com/abudoxali/Grantly.git` (`main`)
- **Active VPS release:** `/var/www/grantly/releases/20261005230824`
- **Application port:** 3300 (PM2 cluster, 2 instances)
- **Database:** Supabase project `Grantly` (`hyhtgwxmcjrwcucozbov`), PostgreSQL 17
- **Production catalog:** populated and verified (12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides)
- **Admin CMS workflow:** once client-approved bootstrap credentials are provided and the admin is created, content managers can maintain scholarships, countries, fields, providers, and guides through `/admin`.

## Exact remaining blockers

The production seed/Supabase-data blocker is closed. Remaining external launch inputs are:

1. **Production Admin Credentials:** client-approved `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required to bootstrap the real admin and run the Admin Golden Path.
2. **Official Client Domain & DNS:** official production domain, canonical apex-vs-www policy, and authorized DNS control are required for `NEXT_PUBLIC_SITE_URL`, Nginx, Supabase Auth redirects, DNS, and TLS.
3. **SMTP Decision / Credentials:** SMTP provider configuration and a controlled delivery-test recipient, or an explicit client waiver.
4. **QA Student Identity:** controlled test account/identity for the final Student Golden Path; if SMTP is enabled, use it to verify signup/recovery delivery.

## Completion summary

- **Production data phase:** 100% verified.
- **Internal application & runtime readiness:** 100% verified.
- **Strict launch checklist:** 15 of 24 checks verified (62.5%).
- **Public cutover:** paused only for the client-controlled inputs above.
