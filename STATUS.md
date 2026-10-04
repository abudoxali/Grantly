# Grantly Client Production Readiness & Handoff Documentation

**Platform**: Grantly — Bilingual Global Scholarship Discovery Platform  
**Target Architecture**: Next.js 16 (App Router, Standalone) + Supabase PostgreSQL + PM2 + Nginx  
**Date**: October 4, 2026  
**Status**: Client Production Readiness & Handoff Prepared (Release Candidate RC1)  

---

> [!IMPORTANT]
> **DEPLOYMENT POLICY COMPLIANCE CONFIRMATION**:
> **THIS PHASE PRODUCED A CLIENT-OWNED PRODUCTION RELEASE CANDIDATE ONLY.**
> - **NO** VPS servers were accessed or modified via SSH.
> - **NO** production Nginx instances were reconfigured on remote hosts.
> - **NO** DNS records or zones were altered.
> - **NO** production SSL/TLS certificates were requested or issued.
> - **NO** production Supabase projects were created.
> - **NO** real administrator accounts, emails, or passwords were created or invented.
> - **NO** live deployment occurred.
> - **ZERO** reliance on personal developer infrastructure, domains (`abud.fun`), or credentials.
>
> All operational artifacts, configuration templates, database migrations, CI gates, and verification scripts have been packaged, tested, and verified locally for controlled release execution in the subsequent client-authorized deployment phase.

---

## 1. Executive Summary & Client Readiness

Grantly is an authenticated, light-first, bilingual (Arabic & English) scholarship platform connecting scholars and researchers with verified global opportunities. 

In this phase, Grantly was decoupled from developer-specific environments and structured as a **self-contained, client-deliverable production system**. The codebase and infrastructure templates now support:
- Completely domain-agnostic operation driven exclusively by environment variables (`NEXT_PUBLIC_SITE_URL`).
- Complete administrative self-service via the new **Provider Management CMS (`/admin/providers`)**, allowing non-technical client staff to create, modify, and manage universities, foundations, and government providers dynamically.
- Dynamic provider linkage during scholarship creation and editing without touching source code.
- Safe, production-ready **Visual Media Management (`ImageUpload`)** supporting Supabase Storage uploads, MIME validation, file size limits, live previews, and image URL fallbacks.
- Supabase-native **Password Reset and Account Recovery (`/auth/reset-password`)** with token verification and bilingual feedback.
- Immutable **Administrative Audit Logging (`admin_audit_logs`)** tracking all CRUD mutations on scholarships, providers, and user permissions.
- Operational resilience with safe HSTS policies (avoiding premature preloading that could cause permanent client domain lockout), configurable PM2 instance sizing, and defensive validation in administrator bootstrap scripts.

---

## 2. Client Ownership & Decoupling Audit

### 2.1 Complete Eradication of Personal Identifiers
A strict scan across all source files, configuration files, and deployment templates confirmed:
- Personal domain `abud.fun` is completely absent from all code, configuration files, and documentation.
- The developer username `abudoxali` appears strictly in the canonical GitHub remote origin URL (`https://github.com/abudoxali/Grantly.git`).
- All authentication callbacks, password recovery redirects, and canonical links are dynamically generated using `NEXT_PUBLIC_SITE_URL || window.location.origin`.

### 2.2 Environment Configuration Architecture
Environment variables are specified in `.env.example` with empty, documented placeholders. No production secrets or personal API keys exist in git history or tracked files:
- `NEXT_PUBLIC_SUPABASE_URL`: Client's dedicated Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client's Supabase anonymous public key.
- `SUPABASE_SERVICE_ROLE_KEY`: Client's private Supabase service role key (server-only).
- `NEXT_PUBLIC_SITE_URL`: Client's primary production domain (e.g. `https://grantly.org`).
- `PORT`: Server listening port (default: `3000`).
- `PM2_INSTANCES`: Configurable cluster worker count (default: `2`).

---

## 3. Core Modules & Administrative CMS Enhancements

### 3.1 Provider Management Module (`/admin/providers`)
- **Self-Service Provider Administration**: Client administrators can manage scholarship sponsors without developer intervention.
- **Provider Types Supported**: Universities, Government Ministries, Foundations, International Organizations.
- **Relational Integrity Safeguard**: The deletion handler strictly inspects existing scholarship records; if any scholarship is currently linked to a provider, deletion is blocked with a descriptive error message to prevent database orphan records.
- **Dynamic Selectors**: The scholarship creation (`/admin/scholarships/new`) and editing (`/admin/scholarships/[id]/edit`) interfaces now fetch active providers dynamically from the repository instead of static arrays.

### 3.2 Media & Image Management (`ImageUpload`)
- **Unified Upload Component**: Designed for scholarship cover images, provider logos, and guide banners.
- **Validation**: Enforces strict MIME whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/svg+xml`) and maximum file size (5MB).
- **Dual Mode**: Direct upload to Supabase Storage buckets with automatic public URL generation, with immediate fallback to manual image URL input.
- **Integrated UX**: Live image preview, error notification, replace button, and remove action.

### 3.3 Account Recovery & Password Reset (`/auth/reset-password`)
- **Supabase Auth Integration**: Full compliance with Supabase Auth recovery tokens (`type=recovery`).
- **Validation & Security**: Enforces minimum 8-character complexity, client-side confirmation match check, and automatic session cleanup upon success.
- **Bilingual Experience**: Arabic and English status alerts and instructions.

### 3.4 Administrative Audit Logging
- **Immutable Table**: `public.admin_audit_logs` captures administrative activity.
- **Logged Events**: Creation, updating, deletion, publishing, unpublishing of scholarships, providers, and user role updates.
- **Recorded Data**: Timestamp, admin user ID, action type, entity ID, and operational metadata.

---

## 4. Security Hardening & Authentication Architecture

### 4.1 Canonical Database Migrations (`supabase/migrations/`)

1. **`20261004000001_initial_schema.sql`**:
   - PostgreSQL extensions (`uuid-ossp`).
   - Custom enum types (`user_role`, `funding_type`, `scholarship_status`, `degree_level`, `provider_type`).
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

### 4.2 Server-Side Route Guard & Session Verification (`src/middleware.ts`)
- **Cryptographic Server Verification**: For any administrative route (`/:locale/admin/*`, excluding `/login`), the middleware instantiates a server Supabase client using `@supabase/ssr` with request cookies, calls `supabase.auth.getUser()`, and verifies the cryptographic signature with Supabase Auth.
- **Database Role Confirmation**: Checks `role === 'admin'` from `public.profiles`.
- **Fail-Safe Mode**: In production, unconfigured or unreachable backends immediately bounce unauthorized requests with `error=backend_unconfigured`.
- **Defense in Depth**: Client shell in `src/app/[locale]/admin/layout.tsx` maintains active UI role assertion and displays a locked fallback screen if state transitions occur.

### 4.3 Administrator Provisioning Guard (`scripts/bootstrap-admin.ts`)
- **Weak Credential Rejection**: Enforces minimum 10-character password complexity, requires upper, lower, and digit/symbol characters. Rejects placeholder passwords (`password`, `admin123`, `changeme`).
- **Placeholder Email Rejection**: Rejects example domain emails (`example.com`, `test.com`, `admin@grantly.org`).
- **Idempotency**: Creates admin user in Supabase Auth if missing, updates role to `admin` in `public.profiles`, and updates password if user already exists.

---

## 5. Operations, Packaging & Release Architecture

### 5.1 Next.js Packaging & Security Headers (`next.config.ts`)
- **Standalone Output**: `output: 'standalone'` generates an optimized, self-contained deployment bundle in `.next/standalone`.
- **Header Hardening**: `poweredByHeader: false` prevents server fingerprinting.
- **HTTP Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - `Strict-Transport-Security`: Set to conservative `max-age=86400` during launch phase to prevent irreversible browser caching issues while DNS or SSL certificates are finalized.
- **Image Optimization**: Whitelisted domains include Supabase storage, Unsplash, and FlagCDN.

### 5.2 Process Supervision with PM2 (`ecosystem.config.cjs`)
- Configurable cluster execution: `instances: process.env.PM2_INSTANCES || 2`, `exec_mode: 'cluster'`.
- Memory limits per worker: `max_memory_restart: '500M'`.
- Structured log paths: `/var/www/grantly/shared/logs/pm2-*.log`.

### 5.3 Production Nginx Configuration Template (`deploy/nginx/grantly.conf.template`)
- Rate limiting zones (`req_zone` 30r/m for general traffic, 10r/m for `/auth/` endpoints).
- Modern TLS cipher suites (TLSv1.2 & TLSv1.3 only).
- Immutable static asset caching with 1-year cache control headers for `/_next/static/`.
- Safe HSTS initial header (`max-age=86400`) without premature preload.

### 5.4 Deployment & Rollback Scripts (`deploy/`)
- `deploy.sh`: Atomic symlink release deployment (`releases/<timestamp>` -> `current`).
- `rollback.sh`: Instant zero-downtime rollback to previous release.

---

## 6. Verification & Quality Gates Results

All quality gates have been executed and verified clean:

| Gate / Command | Scope | Result | Status |
| :--- | :--- | :---: | :---: |
| `npx tsc --noEmit` | Strict TypeScript compilation | **0 errors** | Passed |
| `npm run lint` | ESLint rules check | **0 errors, 0 warnings** | Passed |
| `npm test` | Automated test suite | **28 / 28 passed** | Passed |
| `npm run preflight` | Operational release preflight | **7 / 7 checks passed** | Passed |
| `npm run build` | Next.js Turbopack Standalone Build | **11 static / 23 dynamic routes** | Passed |

---

## 7. Client Infrastructure, Cost & Backup Architecture

### 7.1 Estimated Operational Infrastructure Costs

| Service Component | Recommended Provider | Tier / Spec | Estimated Cost |
| :--- | :--- | :--- | :--- |
| **Application Server (VPS)** | Hetzner Cloud / DigitalOcean / Vultr | 2 vCPU, 4GB RAM, Ubuntu 22.04 LTS | **$6 - $12 / month** |
| **Database & Auth (PostgreSQL)** | Supabase Managed Cloud | Free Tier (up to 500MB DB, 50k MAU) or Pro ($25/mo) | **$0 - $25 / month** |
| **Storage & CDN (Images)** | Supabase Storage (1GB free) | Included with Supabase | **$0 / month** |
| **DNS & DDoS Protection** | Cloudflare | Free Tier (Universal SSL, CDN, DDoS mitigation) | **$0 / month** |
| **Domain Registration** | Porkbun / Namecheap / Cloudflare | Standard `.com` / `.org` registration | **~$10 - $14 / year** |
| **Total Estimated Run Cost** | | | **~$6 - $37 / month** |

### 7.2 Backup & Disaster Recovery Architecture
- **Automated PostgreSQL Snapshots**: Supabase provides automated daily backups on the Pro tier.
- **Manual Point-in-Time Backup**:
  ```bash
  # Dump complete schema and relational data
  pg_dump --clean --if-exists --no-owner --no-privileges -d "$SUPABASE_DB_URL" > grantly_backup_$(date +%Y%m%d).sql
  ```
- **Restore Procedure**:
  ```bash
  psql -d "$SUPABASE_DB_URL" < grantly_backup_YYYYMMDD.sql
  ```
- **Storage Backups**: Assets in Supabase Storage buckets (`scholarship-covers`, `provider-logos`, `guide-images`) can be mirrored locally via Supabase S3-compatible API or rclone.

---

## 8. Client Handover & Launch Checklist

When client infrastructure is ready, complete the following handoff checklist:

### Step 1: Client Account Setup
- [ ] Client creates Supabase account and organization.
- [ ] Client creates a new Supabase project (e.g. `grantly-prod`).
- [ ] Client obtains `Project URL`, `Anon Key`, and `Service Role Key` from Project Settings > API.

### Step 2: Database Migration & Initial Data
- [ ] Apply `supabase/migrations/20261004000001_initial_schema.sql` via Supabase SQL Editor.
- [ ] Apply `supabase/migrations/20261004000002_security_hardening.sql` via Supabase SQL Editor.
- [ ] Execute `npm run seed` to load the initial verified directory of countries, fields, and initial providers.

### Step 3: Client Admin Bootstrap
- [ ] Execute `bootstrap:admin` with the client's official email address:
  ```bash
  ADMIN_EMAIL="admin@clientdomain.com" ADMIN_PASSWORD="<ClientSecurePassword>" npm run bootstrap:admin
  ```
- [ ] Verify administrative login at `https://clientdomain.com/en/admin/login`.

### Step 4: Storage Buckets & Policies
- [ ] Verify that public buckets `scholarship-covers`, `provider-logos`, and `guide-images` exist in Supabase Storage with size limits (5MB) and MIME restrictions applied.

### Step 5: VPS & Domain Configuration
- [ ] Provision Ubuntu 22.04 LTS VPS with Node.js 20 LTS and PM2.
- [ ] Configure DNS A/AAAA records pointing `clientdomain.com` to VPS IP.
- [ ] Configure Nginx using `deploy/nginx/grantly.conf.template` and obtain Certbot SSL certificates.
- [ ] Configure `NEXT_PUBLIC_SITE_URL=https://clientdomain.com` in `/var/www/grantly/shared/.env.production`.
- [ ] Set Site URL in Supabase Auth Settings to `https://clientdomain.com` and configure redirect URLs (`https://clientdomain.com/**`).

---

## 9. Source Control & Repository State

- **Canonical Repository**: `https://github.com/abudoxali/Grantly.git`
- **Canonical Branch**: `main`
- **Current Phase**: Client Production Readiness & Handoff Preparation
- **Verified Remote HEAD**: `2698798b4127a070baa6905f5ce0594deb3e2426` (`2698798`)
- **Quality Gates State**: All 5 quality gates verified cleanly (TypeScript, ESLint, Unit Tests, Preflight, Next Standalone Build).
