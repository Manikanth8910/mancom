#!/usr/bin/env bash
# =============================================================================
# Mancom - ONE COMMAND to start everything
# Starts: Auth Service, API Gateway, Metro Bundler, iOS Simulator
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/apps/mancom-frontend"

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║        Mancom — Starting Everything      ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${RESET}"
echo ""

# ─── Check PostgreSQL ────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/5]${RESET} Checking PostgreSQL..."
if pg_isready -q 2>/dev/null; then
  echo -e "      ${GREEN}✓ PostgreSQL is running${RESET}"
else
  echo -e "      ${RED}✗ PostgreSQL not running. Starting it...${RESET}"
  brew services start postgresql@14 2>/dev/null || \
  brew services start postgresql 2>/dev/null || \
  (echo -e "      ${RED}Could not start PostgreSQL. Please start it manually.${RESET}" && exit 1)
  sleep 2
fi

# ─── Kill old processes on ports ─────────────────────────────────────────────
echo -e "${YELLOW}[2/5]${RESET} Clearing ports 3000, 3001, 3002..."
for PORT in 3000 3001 3002 8081; do
  PID=$(lsof -ti tcp:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null || true
    echo -e "      ${GREEN}✓ Freed port $PORT${RESET}"
  fi
done

# ─── Build auth-service (always rebuild fresh to pick up code changes) ────────
echo -e "${YELLOW}[3/5]${RESET} Building auth-service..."
echo -e "      ${YELLOW}⚙ Building...${RESET}"
cd "$ROOT/services/auth-service" && pnpm run build 2>&1 | tail -3
echo -e "      ${GREEN}✓ Ready${RESET}"

# ─── Start Backend Services ──────────────────────────────────────────────────
echo -e "${YELLOW}[4/5]${RESET} Starting backend services..."

cd "$ROOT/services/auth-service"
PORT=3001 pnpm exec nest start > /tmp/mancom-auth.log 2>&1 &
AUTH_PID=$!
echo -e "      ${CYAN}▶ Auth Service    → http://localhost:3001 (pid $AUTH_PID)${RESET}"

sleep 1

cd "$ROOT/services/parking-service"
PORT=3005 node server.js > /tmp/mancom-parking.log 2>&1 &
PARKING_PID=$!
echo -e "      ${CYAN}▶ Parking Service → http://localhost:3005 (pid $PARKING_PID)${RESET}"

sleep 1

cd "$ROOT/services/api-gateway"
node index.js > /tmp/mancom-gateway.log 2>&1 &
GW_PID=$!
echo -e "      ${CYAN}▶ API Gateway     → http://localhost:3000 (pid $GW_PID)${RESET}"

sleep 1

# Health check
GW_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
if [ "$GW_OK" = "200" ]; then
  echo -e "      ${GREEN}✓ Backend is healthy${RESET}"
else
  echo -e "      ${RED}✗ Gateway health check failed. Check /tmp/mancom-gateway.log${RESET}"
fi

# ─── Start React Native Metro + iOS ─────────────────────────────────────────
echo -e "${YELLOW}[5/5]${RESET} Starting React Native app (iOS)..."
echo ""

# Open a new macOS Terminal window for Metro bundler
osascript <<EOF
tell application "Terminal"
  do script "cd '$FRONTEND' && pnpm start --reset-cache"
  activate
end tell
EOF
echo -e "      ${CYAN}▶ Metro Bundler   → opened in new Terminal window${RESET}"

sleep 3

# Open another Terminal window for iOS simulator
osascript <<EOF
tell application "Terminal"
  do script "cd '$FRONTEND' && pnpm ios"
  activate
end tell
EOF
echo -e "      ${CYAN}▶ iOS Simulator   → opened in new Terminal window${RESET}"

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║  🚀 Everything is starting!                 ║${RESET}"
echo -e "${BOLD}${GREEN}║                                              ║${RESET}"
echo -e "${BOLD}${GREEN}║  API Gateway  → localhost:3000              ║${RESET}"
echo -e "${BOLD}${GREEN}║  Auth Service → localhost:3001              ║${RESET}"
echo -e "${BOLD}${GREEN}║  Parking Svc  → localhost:3005              ║${RESET}"
echo -e "${BOLD}${GREEN}║  iOS app opening in Simulator...            ║${RESET}"
echo -e "${BOLD}${GREEN}║                                              ║${RESET}"
echo -e "${BOLD}${GREEN}║  OTP codes will appear below ↓              ║${RESET}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop all backend services."
echo ""

# ─── Stream backend logs here (OTP will show up) ─────────────────────────────
trap "echo ''; echo 'Stopping Mancom backend...'; kill $AUTH_PID $GW_PID $PARKING_PID 2>/dev/null; exit 0" INT TERM

tail -f /tmp/mancom-auth.log /tmp/mancom-parking.log /tmp/mancom-gateway.log
