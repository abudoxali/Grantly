# Grantly Production and Brand/UI Status

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform
**Target architecture**: Next.js 16 standalone + Supabase PostgreSQL + PM2 + Nginx
**Date**: October 5, 2026
**Status**: Live RLS migration parity remains verified. The premium pink-led brand/UI milestone is implemented and deployed from application source SHA `bdd673d2a28b50b2dffbe53d1f8b0a27ffe52c30` to fresh VPS release `20261005174013`. Health/readiness and production route smoke checks pass. Production catalog remains intentionally unseeded. Pixel-level review of the full 360–1920px viewport matrix is pending user browser captures.

---

## 1. Source Control

- **Repository**: `https://github.com/abudoxali/Grantly.git`
- **Branch**: `main`
- **GitHub HEAD at start of the UI pass**: `388db9bb67415f3a363b92f881584596203074cb`
- **Application-source GitHub HEAD and deployed SHA**: `bdd673d2a28b50b2dffbe53d1f8b0a27ffe52c30`
- **GitHub Actions for application source**: Run `37348114802` completed successfully.
- **Final repository HEAD**: the application-source commit above plus the later `STATUS.md`-only record commit; the deployed application SHA remains unchanged.
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

Local quality gates on the deployed UI source:

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

The local and VPS production builds emit the existing Next.js middleware-convention deprecation warning but complete successfully. Local preview used `next dev --webpack` because the default Windows Turbopack dev server failed to resolve `@vercel/turbopack/postcss`; no project build configuration was changed. `npm ci` reports five high advisories in the dev-inclusive dependency tree; the existing production-only audit remains at 0 vulnerabilities, and no dependency/security policy changes were made.

The active VPS release also passed `npm ci` (413 packages), preflight, typecheck, lint, 59/59 tests, seed dry-run, production build with the protected environment link, and standalone asset packaging. Shared logs were linked only after `npm run build`.

---

## 5. VPS Deployment and Runtime Verification

- **VPS**: `5.189.151.43` (`vmi3595755`), SSH user `root`
- **Internal application port**: `3300`
- **Fresh active release**: `/var/www/grantly/releases/20261005174013`
- **Deployed source SHA**: `bdd673d2a28b50b2dffbe53d1f8b0a27ffe52c30`
- **Source verification**: The release `.source-sha` matches the deployed source SHA.
- **Environment**: `.env.local` links to `/var/www/grantly/shared/.env.production`; values were not printed.
- **Shared logs**: Linked to `/var/www/grantly/shared/logs` only after the release build and standalone asset packaging completed.
- **Current symlink**: `/var/www/grantly/current` resolves to `/var/www/grantly/releases/20261005174013`.
- **PM2**: Exactly two `grantly` cluster instances are online and run with cwd `/var/www/grantly/releases/20261005174013`. Port 3300 is listening. PM2’s reload path retained the previous cwd on this VPS, so, with explicit approval, only the two `grantly` entries were briefly stopped and recreated from the new release. The unrelated `mohamy-phone-admin` process remained online and was not changed.
- **Health**: `GET /api/health` — HTTP 200.
- **Readiness**: `GET /api/ready` — HTTP 200, database connected.
- **Runtime logs**: Last 300 `grantly` log lines had zero `42501`, `backend_unconfigured`, `permission denied for function is_admin`, mock-fallback, or unhandled-runtime markers.

### Application smoke verification

| Route | Result |
| --- | --- |
| `/en`, `/ar` | HTTP 200 |
| `/en/scholarships`, `/ar/scholarships` | HTTP 200; no production catalog rows seeded |
| `/en/countries`, `/ar/countries` | HTTP 200; bilingual branded empty-state copy rendered |
| `/en/fields`, `/ar/fields` | HTTP 200; bilingual branded empty-state copy rendered |
| `/en/guides`, `/ar/guides` | HTTP 200; bilingual branded empty-state copy rendered |
| `/en/auth/login`, `/ar/auth/login` | HTTP 200 |
| `/en/auth/register`, `/ar/auth/register` | HTTP 200 |
| `/en/auth/forgot-password`, `/ar/auth/reset-password` | HTTP 200 |
| `/en/account/saved`, `/ar/account/profile` | HTTP 200 |
| `/en/admin/login`, `/ar/admin/login` | HTTP 200 |
| `/en/admin` | HTTP 307 to the protected admin login route |
| `/en/scholarships/chevening-scholarships-uk`, `/ar/scholarships/chevening-scholarships-uk` | HTTP 404 |
| `/en/guides/winning-scholarship-motivation-letter` | HTTP 404 |

Production catalog queries remain empty and no fixture records were inserted. The scholarships directory and saved-item empty states are implemented; pixel-level browser verification of those hydrated client states is pending the requested viewport captures.

Candidate release `/var/www/grantly/releases/20261005172832` was left inactive after a raw-HTML smoke assertion did not account for client hydration; the prior release was restored automatically. No old release was modified or pruned. A later candidate `/var/www/grantly/releases/20261005174013` was activated and verified.

---

## 6. Brand Identity and UI/UX Milestone

The frontend redesign is deployed on the existing Next.js/Supabase/PM2 architecture. No Supabase schema, RLS, Auth security, seed behavior, production data, Nginx, DNS, SSL, or unrelated services were changed.

### Design system and brand

- Replaced the green-led visual identity with a rose / berry / plum system. Deep berry is used for accessible primary actions; vivid rose is the editorial accent; blush and white remain supporting surfaces.
- Centralized primary, hover, active, soft, border, accent, surface, text, muted, focus, shadow, success, warning, danger, and info tokens in `src/app/globals.css`. Legacy emerald/teal utilities resolve through the pink token scale; semantic success remains green.
- Preserved and refined the existing arch/pathway scholarship mark, updated the wordmark accent, and added the matching SVG app icon.
- Improved English and Arabic heading weights, line-height, responsive scale, and RTL font handling. Added a localized skip-to-content link.

### Homepage, navigation, search, and cards

- Simplified the hero composition and radial/grid/orbit treatment; the headline and search now lead the hierarchy, stats use a clean responsive grid, and phone layouts omit floating cards.
- Hero scholarship spotlights now use actual published records from the repository; no hard-coded sample scholarship cards were added.
- Reworked desktop navigation spacing and active states. Added a purpose-built mobile drawer with bilingual links, language switching, backdrop/Escape close, focus trapping/restoration, and scroll-lock compensation.
- Standardized primary controls, focus rings, cards, funding/status badges, and scholarship-card scanning order. Cards link directly to official application portals.
- Added branded empty states for scholarships, countries, fields, guides, and saved items without adding seed or fixture production content.

### Auth, admin, and accessibility

- Login, registration, forgot/reset password, profile, admin login, and admin shell use the shared token system. Supabase Auth and route-guard logic were not weakened; the demo credential fill is limited to development.
- Admin remains a neutral, professional workspace; success/verified states use semantic green, while active navigation and focus use the pink brand.
- Added/standardized visible keyboard focus, labels and input IDs, `aria` state for menus/filters/bookmarks, native checkbox controls, 44px minimum sizes for key controls, and reduced-motion handling.

### Localization and responsive QA status

- **English LTR route smoke**: `/en`, scholarships, countries, fields, guides, auth, saved/profile, and admin login returned expected HTTP responses; unknown scholarship and guide details returned 404.
- **Arabic RTL route smoke**: equivalent `/ar` routes returned expected responses; rendered locale containers reported `lang="ar"` and `dir="rtl"`.
- **Production empty states**: countries, fields, and guides empty-state copy was confirmed in both languages. Scholarships and saved empty branches are implemented, but their client-hydrated states were not pixel-captured after deployment.
- **Desktop QA**: route rendering and build verified; no supplied screenshot was present for direct visual comparison.
- **Mobile QA**: purpose-built layout and navigation implemented; manual device/viewport screenshots were not returned through the browser preview.
- **Requested widths**: 360, 390, 430, 768, 1024, 1280, 1440, and 1920px are covered by responsive layout breakpoints, but the full pixel-level overflow/clip/overlap matrix remains pending screenshot review. The browser preview was opened for user-side capture; it does not return screenshots unless the user sends them.

## 7. Seed and Remaining Blockers

- **Live seed**: **NOT EXECUTED**. No production rows were written.
- **Live seed idempotency**: **NOT YET VERIFIED**; seeding remains a separately controlled authorized Supabase administration step.
- No service-role key was invented, requested in chat, or written to Git.
- Remaining product-launch work: authorized production seed when approved; final client domain and Supabase Auth URLs; client-approved admin credentials; SMTP decision/configuration; and DNS/TLS/public Nginx cutover approval.
- Remaining UI signoff: pixel-level review of 360, 390, 430, 768, 1024, 1280, 1440, and 1920px screenshots in both locales; the preview was opened, but no screenshot capture was returned for direct inspection.
- DNS, SSL, Nginx, and unrelated production services were not changed.

---

## 8. Completion and Safety

- **Migration history parity and least-privilege live RLS**: 100% verified.
- **Hardened source deployment and production smoke checks**: 100% verified.
- **Brand/UI milestone**: Source commit `bdd673d2a28b50b2dffbe53d1f8b0a27ffe52c30` is deployed to release `20261005174013`; health/readiness, route smoke checks, PM2 cwd, and GitHub Actions run `37348114802` are verified.
- **Visual signoff**: Responsive styles and bilingual route rendering are implemented; exact screenshot-based viewport QA remains pending user captures as recorded above.
- **Overall client-deliverable project**: Backend hardening remains intact; production seed/domain/Auth/admin/SMTP/public-cutover approvals and screenshot signoff remain.
- No duplicate migration remains.
- No anonymous admin/helper privilege was granted.
- No production seed or admin bootstrap was run.
- No unrelated app, PostgreSQL service, Nginx configuration, DNS record, or SSL certificate was modified.
- No secrets or administrator credentials are recorded in this file.
