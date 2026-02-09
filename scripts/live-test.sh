#!/usr/bin/env bash
#
# Live E2E test — submit jobs to the Railway-deployed coordinator.
#
# Prerequisites:
#   1. Coordinator deployed on Railway (TESTNET_MODE=true)
#   2. Desktop worker running: COORDINATOR_URL=wss://dispatch-solana.up.railway.app pnpm worker:desktop
#   3. Mobile app connected to Railway URL
#
# Usage:
#   ./scripts/live-test.sh                          # Uses default Railway URL
#   RAILWAY_URL=https://your-url.up.railway.app ./scripts/live-test.sh

set -euo pipefail

RAILWAY_URL="${RAILWAY_URL:-https://dispatch-solana.up.railway.app}"

echo "══════════════════════════════════════════"
echo "  Dispatch Live E2E Test"
echo "  Coordinator: $RAILWAY_URL"
echo "══════════════════════════════════════════"

# Step 1: Health check
echo ""
echo "Step 1: Health check..."
HEALTH=$(curl -s "$RAILWAY_URL/v1/health" || echo "FAILED")
echo "  Response: $HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "  ✓ Coordinator is online"
else
  echo "  ✗ Coordinator is not reachable. Deploy first."
  exit 1
fi

# Step 2: Check worker count
WORKERS=$(echo "$HEALTH" | grep -o '"workers_online":[0-9]*' | cut -d: -f2)
echo "  Workers online: ${WORKERS:-0}"

if [ "${WORKERS:-0}" -eq 0 ]; then
  echo ""
  echo "  ⚠ No workers connected. Start a worker first:"
  echo "    COORDINATOR_URL=$RAILWAY_URL pnpm worker:desktop"
  echo "    — or connect via mobile app"
  echo ""
  echo "  Continuing anyway (jobs will wait for workers)..."
fi

# Step 3: Submit test jobs via cloudbot-demo
echo ""
echo "Step 3: Submitting test jobs..."
COORDINATOR_URL_SOLANA="$RAILWAY_URL" DEMO_CHAIN=solana npx tsx apps/cloudbot-demo/src/index.ts

echo ""
echo "══════════════════════════════════════════"
echo "  Live test complete!"
echo "══════════════════════════════════════════"
