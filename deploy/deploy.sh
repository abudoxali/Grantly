#!/usr/bin/env bash
# ==============================================================================
# Grantly Automated Deployment Script
# Zero-Downtime Atomic Symlink Release Pattern
# Target Environment: Ubuntu 22.04+ / Debian 12+ VPS with PM2 and Nginx
# ==============================================================================

set -euo pipefail

BASE_DIR="/var/www/grantly"
RELEASES_DIR="$BASE_DIR/releases"
SHARED_DIR="$BASE_DIR/shared"
CURRENT_LINK="$BASE_DIR/current"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"
KEEP_RELEASES=5

echo "=== Starting Grantly Deployment: release $TIMESTAMP ==="

# 1. Directory Structure Preflight
mkdir -p "$RELEASES_DIR"
mkdir -p "$SHARED_DIR"
mkdir -p "$SHARED_DIR/logs"

if [ ! -f "$SHARED_DIR/.env.production" ]; then
    echo "ERROR: Shared production environment file not found at $SHARED_DIR/.env.production"
    echo "Please create $SHARED_DIR/.env.production with validated credentials before deploying."
    exit 1
fi

# 2. Clone / Copy Source into Release Directory
echo "Preparing release directory at $RELEASE_DIR..."
mkdir -p "$RELEASE_DIR"

# Assuming deployment is triggered from repository root or CI archive
cp -R . "$RELEASE_DIR"

cd "$RELEASE_DIR"

# 3. Symlink Shared Environment & Logs
ln -sfn "$SHARED_DIR/.env.production" "$RELEASE_DIR/.env.local"
ln -sfn "$SHARED_DIR/logs" "$RELEASE_DIR/logs"

# 4. Install Dependencies
echo "Installing dependencies (clean install)..."
npm ci --prefer-offline --no-audit

# 5. Execute Preflight Checks
echo "Running preflight environment & code checks..."
npm run preflight

# 6. Build Next.js Application
echo "Building Next.js application..."
npm run build

# 7. Atomic Symlink Switch
echo "Switching current release symlink..."
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# 8. Reload Application via PM2
echo "Reloading PM2 cluster..."
cd "$CURRENT_LINK"
if pm2 describe grantly > /dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs --update-env
else
    pm2 start ecosystem.config.cjs --env production
fi

# 9. Post-Deployment Health Verification
echo "Verifying service health..."
HEALTH_URL="http://127.0.0.1:3000/api/health"
MAX_ATTEMPTS=15
ATTEMPT=1
SUCCESS=0

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -s -f "$HEALTH_URL" | grep -q '"status":"ok"'; then
        SUCCESS=1
        break
    fi
    echo "Health check attempt $ATTEMPT/$MAX_ATTEMPTS failed, waiting 2s..."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $SUCCESS -eq 1 ]; then
    echo "✓ Liveness health check verified at $HEALTH_URL"
else
    echo "CRITICAL: Health check failed after $MAX_ATTEMPTS attempts! Initiating automated rollback..."
    "$BASE_DIR/rollback.sh"
    exit 1
fi

# 10. Prune Old Releases
echo "Pruning older releases (retaining last $KEEP_RELEASES)..."
cd "$RELEASES_DIR"
ls -1dt 20* | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

echo "=== Deployment Succeeded: release $TIMESTAMP is LIVE ==="
