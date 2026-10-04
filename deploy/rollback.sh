#!/usr/bin/env bash
# ==============================================================================
# Grantly Automated Rollback Script
# Swaps 'current' symlink back to previous successful release
# ==============================================================================

set -euo pipefail

BASE_DIR="/var/www/grantly"
RELEASES_DIR="$BASE_DIR/releases"
CURRENT_LINK="$BASE_DIR/current"

echo "=== Grantly Rollback Initiated ==="

if [ ! -L "$CURRENT_LINK" ]; then
    echo "ERROR: Current symlink not found at $CURRENT_LINK"
    exit 1
fi

CURRENT_TARGET="$(readlink -f "$CURRENT_LINK")"
echo "Current active release: $CURRENT_TARGET"

cd "$RELEASES_DIR"
# Find releases sorted newest first, excluding current
PREVIOUS_RELEASE="$(ls -1dt 20* | grep -v "$(basename "$CURRENT_TARGET")" | head -n 1 || true)"

if [ -z "$PREVIOUS_RELEASE" ]; then
    echo "CRITICAL: No previous release found to rollback to!"
    exit 1
fi

echo "Rolling back to release: $PREVIOUS_RELEASE"

# Swap symlink atomically
ln -sfn "$RELEASES_DIR/$PREVIOUS_RELEASE" "$CURRENT_LINK"

# Reload PM2
cd "$CURRENT_LINK"
pm2 reload ecosystem.config.cjs --update-env

# Verify previous release health
echo "Verifying health of rolled-back release..."
sleep 2
if curl -s -f "http://127.0.0.1:3000/api/health" | grep -q '"status":"ok"'; then
    echo "✓ Rollback verified successful. System restored to $PREVIOUS_RELEASE."
else
    echo "CRITICAL: Rolled-back release is also failing health check! Manual intervention required."
    exit 2
fi
