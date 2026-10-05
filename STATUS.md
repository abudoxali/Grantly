# Grantly Final Production Launch Status

**As of:** October 5, 2026
**Repository:** `https://github.com/abudoxali/Grantly.git` (`main`)
**Project:** Bilingual global scholarship discovery platform
**Decision:** Not launch-complete; see verified blockers below.
**Strict launch checklist completion:** 42% (10 of 24 acceptance checks fully verified; partial checks are not counted).

## Source and quality gates

- **Application source SHA:** `54ae83e3b9399752377d38724e4248267968de6c`
- **Deployed application SHA:** `54ae83e3b9399752377d38724e4248267968de6c`
- **Source commit GitHub Actions:** run `37373541594`, completed successfully.
- **Final repository HEAD:** the source commit above followed by this `STATUS.md`-only record commit. The exact post-record HEAD is included in the final closure report because a commit cannot embed its own hash.
- **Secrets committed:** None.

| Gate | Result |
| --- | --- |
| `npm ci` | PASS in an isolated clean checkout and fresh VPS release |
| `npm run preflight` | PASS (7/7) |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS (60/60) |
| `npm run seed -- --dry-run` | PASS (12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides) |
| `npm run build` | PASS (Next.js 16.3.8 standalone) |
| `npm audit --omit=dev --audit-level=high` | PASS (0 production vulnerabilities) |
| GitHub Actions for source commit | PASS (run `37373541594`) |

The dependency tree still reports high advisories in development dependencies during installation; the required production-only audit reports zero, and no broad dependency upgrade was made. The deprecated Next.js middleware convention was migrated to `src/proxy.ts`; the final build no longer reports that deprecation.

## Production runtime and rollback

- **VPS:** `5.189.151.43` (`vmi3595755`); internal application port `3300`.
- **Active release:** `/var/www/grantly/releases/20261005230824`.
- **Release `.source-sha`:** `54ae83e3b9399752377d38724e4248267968de6c`.
- **Protected environment:** `.env.local` links to `/var/www/grantly/shared/.env.production`; file mode `600 root:root`. Values were not printed.
- **Shared logs:** `/var/www/grantly/shared/logs` was linked only after the candidate build and standalone packaging.
- **Runtime:** Node `v22.23.2`; PM2 `7.0.4`; exactly two online `grantly` cluster workers, both with cwd `/var/www/grantly/releases/20261005230824`.
- **Health:** `GET http://127.0.0.1:3300/api/health` returns HTTP 200 (`status=ok`).
- **Readiness:** `GET http://127.0.0.1:3300/api/ready` returns HTTP 200 (`database=connected`).
- **Runtime log check:** last 300 shared Grantly log lines contained zero `42501`, `backend_unconfigured`, private-admin permission, or mock/seed-fallback markers.
- **Port exposure:** an external connection attempt to `5.189.151.43:3300` timed out. No firewall rule or port configuration was changed.
- **Candidate verification:** standalone server, `public/`, and `.next/static/` were verified before activation. The production candidate passed health/readiness and bilingual route smoke checks. The unseeded scholarship detail correctly remains 404.
- **Rollback release retained:** `/var/www/grantly/releases/20261005174013` (source `bdd673d2a28b50b2dffbe53d1f8b0a27ffe52c30`). A controlled rollback drill activated it, verified its two PM2 workers/cwd plus health/readiness 200, then restored the new release and verified its two workers/cwd plus health/readiness 200.

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
- **Migration parity:** last authorized check reported applied migration `20261005131712_split_public_admin_read_policies`, matching `supabase/migrations/20261005131712_split_public_admin_read_policies.sql`. No database migrations were changed in this pass; parity was not re-queried because Supabase administration access is unavailable.
- **RLS / Security Advisor:** the prior authorized verification recorded least-privilege RLS and 0 Security Advisor lints. This pass made no database/RLS changes; the Advisor was not re-queried.
- **Current anonymous-visible row counts after deployment:**

| Table | Rows visible anonymously |
| --- | ---: |
| `countries` | 0 |
| `fields` | 0 |
| `providers` | 0 |
| `scholarships` (publicly visible) | 0 |
| `guides` (published/public) | 0 |
| `scholarship_fields` | 0 |

These are read-only anonymous query results; unpublished scholarship/guide totals cannot be independently queried without privileged access. The repository seed data defines no scholarship-to-field association mapping.

- **Live production seed:** NOT EXECUTED. `SUPABASE_SERVICE_ROLE_KEY`/Supabase secret key are absent from the protected app environment. No production rows were written.
- **Expected seed dataset:** 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides; source dry-run passed.
- **Live seed idempotency:** NOT VERIFIED; no live seed executions occurred.
- **Real admin:** NOT CREATED. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are absent. No credentials were invented or exposed.
- **Admin Golden Path:** NOT RUN; approved admin credentials are missing.
- **Student Golden Path:** NOT RUN; no controlled QA account credentials/test identity were provided.
- **Storage:** source policy tests continue to require admin-only writes. Live upload/read/update/delete QA was not run because no real admin/service-role access is available.
- **Supabase Auth URLs:** NOT CONFIGURED/VERIFIED; official domain and Supabase administration access are missing.
- **SMTP:** NOT VERIFIED or waived. SMTP host/user/password are absent from the app environment; Supabase dashboard delivery settings were not accessible.

## Domain, Nginx, DNS, TLS, and public smoke

- **Official client domain:** NOT PROVIDED. `NEXT_PUBLIC_SITE_URL` currently resolves to `127.0.0.1:3300`; it was not replaced with an invented domain.
- **Nginx:** no Grantly site is enabled. `nginx -t` passed; it reported a pre-existing protocol-options warning in the unrelated `mohamy.abud.fun` site. No Nginx configuration was added, changed, or reloaded.
- **DNS:** NOT CONFIGURED/VERIFIED; no approved domain or DNS authorization was supplied.
- **HTTPS/TLS:** NOT ACTIVE for Grantly; certificate issuance and redirects await the official domain.
- **Public HTTPS smoke:** NOT RUN because no official domain/TLS endpoint exists. Internal production route checks passed; the internal port remains externally unreachable in the observed test.

## UI, localization, accessibility, and performance

- **Final source-level polish:** tightened hero vertical rhythm and headline scale, widened the desktop composition, reduced floating-card scale and orbit/grid dominance, improved chip contrast, adjusted tablet spotlight breakpoint, expanded wide-screen header spacing, and added drawer safe-area padding.
- **Semantics:** removed nested link/button controls from the header, homepage CTAs, scholarship portal CTA, admin create links, and not-found action. Existing protected navigation/auth behavior was preserved.
- **English LTR and Arabic RTL route smoke:** both locales returned expected responses across home, scholarships, countries, fields, guides, login, register, forgot-password, saved, profile, and admin login. Rendered locale containers reported `lang="en"/dir="ltr"` and `lang="ar"/dir="rtl"`; unauthenticated admin routes returned the protected login redirect.
- **Empty production catalog:** anonymous queries are empty; public directories serve the real empty-state paths. No production fixture fallback was observed; the unseeded Chevening detail route returns 404.
- **Pixel-level responsive signoff:** NOT COMPLETE. No screenshot review was performed at 360, 390, 430, 768, 1024, 1280, 1440, or 1920px in both locales. The live production preview was opened through a loopback-only SSH tunnel for user-side capture. Chrome DevTools MCP is unavailable, and no captures were returned to this session.
- **Accessibility:** source review confirms focus-visible styles, keyboard drawer handling (Escape/focus trap/restoration), ARIA expanded state, labels, reduced-motion handling, and 44px key targets. Screenshot/keyboard/contrast-tree validation was not performed; do not treat this as full visual accessibility signoff.
- **Performance:** production builds completed without the middleware deprecation warning. No browser performance trace/Core Web Vitals were recorded because Chrome DevTools MCP is unavailable; no material bundle/image regression was observed from the source/build review.

## Safety, backup, and remaining blockers

- Only the two Grantly PM2 workers were removed/recreated during activation/rollback checks. `mohamy-phone-admin` remained online; no other PM2 app, PostgreSQL, Docker, unrelated `/var/www` project, Nginx site, DNS record, firewall rule, or SSL certificate was changed.
- No Supabase backup/point-in-time recovery status is claimed; account/plan administration access was unavailable.
- **Exact external inputs still required:**
  1. Supabase administrative/service-role or Management API access through an approved secure channel, for seed, exact privileged counts, current Advisor/backup checks, Auth/Storage verification, and admin bootstrap.
  2. Client-approved `ADMIN_EMAIL` and `ADMIN_PASSWORD`, injected securely (not in chat or Git).
  3. Official client domain, canonical `www` policy, and authorized DNS control.
  4. Supabase Auth Site/Redirect URLs for the approved domain and subdomains.
  5. SMTP provider/configuration and a controlled delivery-test recipient, or an explicit client SMTP waiver.
  6. Controlled QA student identity/account credentials for the production Golden Path.
  7. Screenshot captures or a configured Chrome DevTools MCP for final responsive/visual/performance signoff.
- **Completion:** 42% of the 24 strict launch acceptance checks are fully verified. This is not 100%; seed/idempotency/admin/golden paths/domain/Auth/SMTP/Nginx/DNS/HTTPS and screenshot signoff remain incomplete.
- **STATUS files:** this root `STATUS.md` is the only status document; no secrets are recorded here.
