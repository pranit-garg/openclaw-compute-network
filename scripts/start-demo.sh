#!/usr/bin/env bash
# start-demo.sh — Starts coordinator + tunnel + worker for hackathon demo
# Usage: ./scripts/start-demo.sh
#   Then open the printed dashboard URL in your browser.
#   Ctrl+C to stop everything.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $COORD_PID $TUNNEL_PID $WORKER_PID 2>/dev/null
  wait $COORD_PID $TUNNEL_PID $WORKER_PID 2>/dev/null
  echo -e "${GREEN}Done.${NC}"
}
trap cleanup EXIT

# 1. Build
echo -e "${CYAN}Building...${NC}"
pnpm build 2>&1 | tail -1

# 2. Start coordinator
echo -e "${CYAN}Starting Solana coordinator (testnet mode)...${NC}"
TESTNET_MODE=true node apps/coordinator-solana/dist/index.js > /tmp/dispatch-coordinator.log 2>&1 &
COORD_PID=$!
sleep 2

# Verify coordinator
if ! curl -sf http://localhost:4020/v1/health > /dev/null 2>&1; then
  echo "ERROR: Coordinator failed to start. Check /tmp/dispatch-coordinator.log"
  exit 1
fi
echo -e "${GREEN}  Coordinator running on port 4020${NC}"

# 3. Start Cloudflare tunnel
echo -e "${CYAN}Starting Cloudflare tunnel...${NC}"
cloudflared tunnel --url http://localhost:4020 > /tmp/dispatch-tunnel.log 2>&1 &
TUNNEL_PID=$!
sleep 5

TUNNEL_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' /tmp/dispatch-tunnel.log | head -1)
if [ -z "$TUNNEL_URL" ]; then
  echo "ERROR: Tunnel failed to start. Check /tmp/dispatch-tunnel.log"
  exit 1
fi
echo -e "${GREEN}  Tunnel: $TUNNEL_URL${NC}"

# 4. Start desktop worker
echo -e "${CYAN}Starting desktop worker...${NC}"
COORDINATOR_URL=ws://localhost:4020 node apps/worker-desktop/dist/index.js > /tmp/dispatch-worker.log 2>&1 &
WORKER_PID=$!
sleep 2
echo -e "${GREEN}  Desktop worker online${NC}"

# 5. Print summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Dispatch Demo Environment Running${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Dashboard:   ${CYAN}${TUNNEL_URL}/dashboard${NC}"
echo -e "  Health:      ${CYAN}${TUNNEL_URL}/v1/health${NC}"
echo -e "  WebSocket:   ${CYAN}wss://${TUNNEL_URL#https://}${NC}"
echo ""
echo -e "  Submit a job:"
echo -e "    ${YELLOW}COORDINATOR_URL_SOLANA=$TUNNEL_URL node apps/cloudbot-demo/dist/index.js --chain=solana${NC}"
echo ""
echo -e "  Mobile app coordinator URL:"
echo -e "    ${YELLOW}wss://${TUNNEL_URL#https://}${NC}"
echo ""
echo -e "  Press Ctrl+C to stop everything."
echo ""

# Keep alive
wait
