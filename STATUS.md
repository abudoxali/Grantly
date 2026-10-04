# Grantly Release Candidate (RC) Status & Documentation

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform  
**Target Architecture**: Next.js 16 (App Router, Standalone) + Supabase PostgreSQL + PM2 + Nginx  
**Date**: October 4, 2026  
**Status**: Release Candidate 1 (RC1) — Hardened, Reproducible, Deployment-Ready  

---

> [!IMPORTANT]
> **DEPLOYMENT POLICY COMPLIANCE CONFIRMATION**:
> **THIS PHASE PRODUCED A RELEASE CANDIDATE ONLY.**
> - **NO** VPS servers were accessed or modified via SSH.
> - **NO** production Nginx instances were reconfigured on remote hosts.
> - **NO** DNS records or zones were altered.
> - **NO** production SSL/TLS certificates were requested or issued.
> - **NO** production Supabase projects were created.
> - **NO** real administrator accounts, emails, or passwords were created or invented.
> - **NO** live deployment occurred.
>
> All operational artifacts, configuration templates, database migrations, CI gates, and verification scripts have been packaged and verified locally for controlled release execution in the subsequent deployment phase.

---

## 1. Executive Summary & Current State

Grantly is an authenticated, light-first, bilingual (Arabic & English) scholarship platform connecting scholars and researchers with verified global opportunities. 

In this hardening pass, the repository was transitioned into a hardened **Release Candidate (RC1)**. The application runtime, database security layer, deployment automation, and process supervision have been hardened against common operational and security pitfalls:
- Database-level anti-privilege escalation triggers and search path isolation.
- Server-side cryptographic session verification in middleware via `@supabase/ssr`.
- Zero client-cookie trust for administrative privileges.
- Centralized environment validation and operational health monitoring endpoints (`/api/health`, `/api/ready`).
- Standalone container/PM2-ready packaging with modern HTTP security headers.
- Production Nginx reverse proxy template with TLS 1.2/1.3, rate limiting, and immutable asset caching.
- Zero-downtime atomic symlink deployment and automated rollback scripts.
- Automated CI pipeline and local preflight quality gates.

---

## 2. Security Hardening & Authentication Architecture

### 2.1 Canonical Database Migrations (`supabase/migrations/`)

Database migrations are versioned sequentially in `supabase/migrations/`:

1. **`20261004000001_initial_schema.sql`**:
   - PostgreSQL extensions (`uuid-ossp`).
   - Custom enum types (`user_role`).
   - Normalized relational tables: `profiles`, `countries`, `fields`, `providers`, `scholarships`, `scholarship_fields`, `guides`, `bookmarks`.
   - Foreign key integrity constraints (`ON DELETE CASCADE`, `ON DELETE SET NULL`).
   - Strategic B-tree performance indexes on foreign keys, slugs, and status flags.

2. **`20261004000002_security_hardening.sql`**:
   - **Hardened `is_admin()` Function**: Declared as `STABLE SECURITY DEFINER SET search_path = public, pg_temp;` to completely eliminate schema search path hijacking or object shadowing.
   - **Anti-Privilege Escalation Trigger (`trg_prevent_profile_role_escalation`)**: Enforced at the PostgreSQL engine level (`BEFORE UPDATE ON public.profiles`). If a non-admin caller attempts to modify `role`, `id`, `email`, or `created_at`, the transaction is immediately aborted with SQL exception `42501 (Permission Denied)`.
   - **Hardened New User Registration Trigger (`handle_new_user`)**: Unconditionally forces `'user'::public.user_role`. Any `role` parameter supplied in client metadata (`raw_user_meta_data`) is strictly ignored and discarded.
   - **Hardened Profiles RLS Policies**: Updates to `public.profiles` require `role = (SELECT role FROM public.profiles WHERE id = auth.uid())`, preventing unauthorized self-elevation via Supabase REST endpoints.
   - **Automated Timestamps**: Trigger `trg_*_updated_at` attached across all core tables to enforce deterministic audit trails.
   - **Admin Audit Logging Table (`public.admin_audit_logs`)**: Dedicated immutable audit logging for administrative mutations, protected by admin-only RLS policies.
   - **Supabase Storage Production Policies**: Granular bucket size limits and MIME type enforcement for `scholarship-covers`, `provider-logos`, and `guide-images` with public read and authenticated admin-only write permissions.

> [!NOTE]
> `src/lib/supabase/schema.sql` is maintained as a consolidated snapshot mirroring these migrations for one-shot local bootstrapping.

### 2.2 Server-Side Route Guard & Session Verification (`src/middleware.ts`)

- **Elimination of Insecure Cookie Reliance**: Removed trust in plain client cookies (`grantly_session_role`).
- **Cryptographic Server Verification**: For any administrative route (`/:locale/admin/*`, excluding `/login`), the middleware instantiates a server Supabase client using `@supabase/ssr` with request cookies, calls `supabase.auth.getUser()`, and verifies the cryptographic signature with Supabase Auth.
- **Database Role Confirmation**: Checks `role === 'admin'` from `public.profiles`.
- **Fail-Safe Mode**: In production, unconfigured or unreachable backends immediately bounce unauthorized requests with `error=backend_unconfigured`.
- **Defense in Depth**: Client shell in `src/app/[locale]/admin/layout.tsx` maintains active UI role assertion and displays a locked fallback screen if state transitions occur.

### 2.3 Strict Production Fallback Handling (`src/lib/auth/context.tsx`)

- Removed legacy email substring matching (`email.includes('admin')`).
- In production (`process.env.NODE_ENV === 'production'`), mock authentication is disabled; real database credentials are required.
- In development, mock admin accounts are disabled by default and strictly gated behind the explicit development flag `NEXT_PUBLIC_ALLOW_DEV_MOCK_ADMIN === 'true'`.

---

## 3. Operations, Packaging & Release Architecture

### 3.1 Next.js Packaging & Security Headers (`next.config.ts`)

- **Standalone Output**: `output: 'standalone'` generates an optimized, self-contained deployment bundle in `.next/standalone` suitable for PM2 and Docker.
- **Header Hardening**: `poweredByHeader: false` prevents server fingerprinting.
- **HTTP Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (enforced in production)
- **Image Optimization**: Remote image patterns whitelist Supabase storage, Unsplash, and FlagCDN.

### 3.2 Process Supervision with PM2 (`ecosystem.config.cjs`)

- Configured for multi-core Node.js cluster execution: `instances: 'max'`, `exec_mode: 'cluster'`.
- Script targets standalone build entry point `.next/standalone/server.js`.
- Configured with automatic restarts (`autorestart: true`), memory threshold restarts (`max_memory_restart: '512M'`), and exponential backoff retry delays (`exp_backoff_restart_delay: 100`).
- Merged, timestamped error and access log routing to `./logs/`.

### 3.3 Production Nginx Configuration (`deploy/nginx/grantly.conf.template`)

- HTTP to HTTPS 301 redirection.
- Modern TLS protocols (`TLSv1.2 TLSv1.3`) with forward secrecy ciphers and OCSP stapling.
- Rate limiting zones:
  - API zone (`limit_req_zone $binary_remote_addr zone=grantly_api_limit:10m rate=10r/s burst=20 nodelay`).
  - General traffic zone (`rate=50r/s burst=100 nodelay`).
- Next.js static asset caching (`/_next/static/`) configured with `public, max-age=31536000, immutable`.
- WebSocket and HTTP 1.1 keepalive proxy forwarding to PM2 upstream.

### 3.4 Zero-Downtime Deployment & Automated Rollback (`deploy/`)

- **`deploy/deploy.sh`**:
  - Implements the atomic release directory pattern: `/var/www/grantly/releases/<timestamp>` and `/var/www/grantly/current` symlink.
  - Links persistent shared production configuration (`shared/.env.production`) and shared logs.
  - Executes preflight verification and production build prior to traffic cutover.
  - Performs atomic symlink swap: `ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"`.
  - Reloads PM2 cluster with zero dropped connections: `pm2 reload ecosystem.config.cjs --update-env`.
  - Executes post-deployment liveness check against `http://127.0.0.1:3000/api/health`.
  - Automatically triggers `rollback.sh` if health check fails.
  - Automatically prunes older releases, retaining the last 5 versions.
- **`deploy/rollback.sh`**:
  - Locates the previous successful release directory in `/var/www/grantly/releases/`.
  - Atomically swaps `/var/www/grantly/current` symlink back to the prior release.
  - Reloads PM2 and validates health check.

---

## 4. Diagnostics, Health Monitoring & Tooling

### 4.1 Centralized Environment Validator (`src/lib/env.ts`)

- Validates required production variables without printing or leaking secrets.
- Enforces HTTPS on `NEXT_PUBLIC_SUPABASE_URL` in production.
- Provides typed `envConfig` accessors across the server runtime.

### 4.2 Liveness & Readiness Endpoints

- **`GET /api/health`** (Liveness Check):
  - Returns `200 OK` with JSON `{ status: 'ok', service: 'grantly', version: '0.1.0', uptimeSeconds: number, environment: string }`.
  - Header: `Cache-Control: no-store, max-age=0`.
- **`GET /api/ready`** (Readiness Check):
  - In production: validates environment and tests live PostgreSQL connectivity against `public.countries`.
  - Returns `200 OK` when ready; returns `503 Service Unavailable` with diagnostic status if unconfigured or database is unreachable.

### 4.3 Deterministic Seeding Script (`scripts/seed.ts`)

- Exclusively requires `SUPABASE_SERVICE_ROLE_KEY` (rejects anon key).
- Supports `--dry-run` flag to validate slug uniqueness, foreign key consistency, and schema counts without contacting the database.
- Tracks upsert errors and exits with non-zero exit code (`process.exit(1)`) on any failure.

### 4.4 Automated Testing & Verification Suite

- **`npm test` (`scripts/run-tests.ts`)**: 28-point automated test suite covering migration syntax, trigger definitions, anti-escalation security, auth code logic, seed data integrity, environment validator edge cases, and Next.js security headers.
- **`npm run preflight` (`scripts/preflight.ts`)**: Pre-deployment validation verifying Node >= 20.0.0, `.env.example` placeholder hygiene, migration presence, and configuration integrity.
- **`npm run verify:deployment` (`scripts/verify-deployment.ts`)**: Smoke test verifying liveness, readiness, security headers, bilingual routing, and admin access protection.

---

## 5. Verification & Quality Assurance Results

### 5.1 Test Suite Summary (28/28 Tests Passed)

```text
=== Grantly Automated Test Suite ===

--- 1. Database Migrations & Security Hardening Tests ---
✓ [PASS] Migration 1 (initial_schema.sql) exists
✓ [PASS] Migration 2 (security_hardening.sql) exists
✓ [PASS] is_admin() uses fixed search_path to prevent object shadowing
✓ [PASS] handle_new_user() strictly forces role = user
✓ [PASS] prevent_profile_role_escalation trigger function is defined
✓ [PASS] prevent_profile_role_escalation raises 42501 permission denied on role change
✓ [PASS] admin_audit_logs table is created with RLS enabled

--- 2. Auth & Route Guard Code Audit ---
✓ [PASS] auth context rejects mock authentication in production
✓ [PASS] auth context requires NEXT_PUBLIC_ALLOW_DEV_MOCK_ADMIN for dev admin escalation
✓ [PASS] auth context does NOT automatically escalate any email with substring admin
✓ [PASS] middleware uses Supabase server auth getUser()
✓ [PASS] middleware verifies admin role against profiles table
✓ [PASS] middleware blocks unconfigured backend in production

--- 3. Seed Data Integrity Tests ---
✓ [PASS] Countries seed count > 0
✓ [PASS] Fields seed count > 0
✓ [PASS] Providers seed count > 0
✓ [PASS] Scholarships seed count > 0
✓ [PASS] Guides seed count > 0
✓ [PASS] All country slugs are unique
✓ [PASS] All providers reference existing countries or null
✓ [PASS] All scholarships reference existing countries and providers

--- 4. Environment Validator Tests ---
✓ [PASS] validateEnv(false) executes cleanly
✓ [PASS] validateEnv(true) fails when production variables are missing
✓ [PASS] validateEnv(true) passes when valid HTTPS URL and key are provided

--- 5. Packaging Configuration Tests ---
✓ [PASS] next.config.ts configures standalone output
✓ [PASS] next.config.ts disables powered-by header
✓ [PASS] next.config.ts includes X-Frame-Options DENY security header
✓ [PASS] next.config.ts includes X-Content-Type-Options nosniff header

==================================================
Test Execution Summary:
Total: 28 | Passed: 28 | Failed: 0
==================================================
✓ All tests passed successfully.
```

### 5.2 Build & Smoke Test Verification Matrix

| Check / Command | Target / Scope | Result | Details |
| :--- | :--- | :---: | :--- |
| `npx tsc --noEmit` | Full TypeScript type check | **Passed (0 errors)** | Strict mode adherence across all modules |
| `npm run lint` | ESLint rules check | **Passed (0 errors)** | Zero linting errors or warnings |
| `npm run preflight` | Preflight operational gate | **Passed (7/7 checks)** | Node version, migrations, config, env clean |
| `npx tsx scripts/seed.ts --dry-run` | Seed data integrity | **Passed** | 12 countries, 8 fields, 14 providers, 14 scholarships, 5 guides verified |
| `npm run build` | Next.js standalone build | **Passed** | Compiled in 19.4s, standalone bundle generated in `.next/standalone` |
| `scripts/verify-deployment.ts` | Local standalone smoke test | **Passed (5/5 checks)** | Liveness (200), Readiness (503 staging), Security Headers, Bilingual rendering, Admin Guard |

---

## 6. Git & Release Candidate Source Control

- **Canonical Repository**: `https://github.com/abudoxali/Grantly.git`
- **Canonical Branch**: `main`
- **Release Candidate Commit**: `9d4b109` (`9d4b109f2be13876e5309605333f07a721d7b055`)
- **Target Release Candidate**: `RC1` (Release Candidate 1)

---

## 7. Production Deployment Runbook (For Subsequent Authorized Phase)

When real infrastructure credentials and server access are provisioned in the next phase, execute the following controlled procedure:

### Step 1: Remote Host Preparation
1. Ensure Ubuntu 22.04+ or Debian 12+ host with Node.js `20.18.0` LTS and PM2 installed:
   ```bash
   node -v  # Must report v20.x
   npm install -g pm2
   ```
2. Create standard directory structure:
   ```bash
   sudo mkdir -p /var/www/grantly/{releases,shared/logs}
   sudo chown -R deploy:deploy /var/www/grantly
   ```
3. Provision `/var/www/grantly/shared/.env.production` with real production secrets:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
   NEXT_PUBLIC_SITE_URL=https://grantly.org
   ```

### Step 2: Supabase Database Migration & Seeding
1. Apply canonical migrations in order via Supabase CLI or SQL Editor:
   - `supabase/migrations/20261004000001_initial_schema.sql`
   - `supabase/migrations/20261004000002_security_hardening.sql`
2. Seed verified scholarship directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key \
   npm run seed
   ```
3. Bootstrap primary administrator:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key \
   ADMIN_EMAIL=admin@grantly.org \
   ADMIN_PASSWORD=your-super-secure-password \
   npm run bootstrap:admin
   ```

### Step 3: Nginx & SSL Setup
1. Copy `deploy/nginx/grantly.conf.template` to `/etc/nginx/sites-available/grantly.conf`.
2. Substitute `${DOMAIN_NAME}`, `${SSL_CERT_PATH}`, and `${SSL_KEY_PATH}`.
3. Test and reload Nginx:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Step 4: Deploy & Verify Release
1. Run deployment script:
   ```bash
   ./deploy/deploy.sh
   ```
2. Verify production release:
   ```bash
   TARGET_URL=https://grantly.org npm run verify:deployment
   ```
