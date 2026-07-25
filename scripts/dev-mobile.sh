#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ELLA_DIR="$ROOT_DIR/ella"
PORT="${PORT:-3000}"
COMPOSE="${COMPOSE:-docker compose}"

get_local_ip() {
  if [ -n "${LAN_IP:-}" ]; then
    echo "$LAN_IP"
    return 0
  fi

  local ip=""
  for iface in en0 en1 en2; do
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [ -n "$ip" ]; then
      echo "$ip"
      return 0
    fi
  done

  if command -v hostname >/dev/null 2>&1; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
    if [ -n "$ip" ]; then
      echo "$ip"
      return 0
    fi
  fi

  return 1
}

wait_for_backend() {
  local url="http://127.0.0.1:${PORT}/api/categories"
  echo "Waiting for backend at ${url} ..."
  for _ in $(seq 1 60); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "Backend is ready."
      return 0
    fi
    sleep 1
  done

  echo "Backend did not become ready in time. Check: cd backend && ${COMPOSE} logs backend" >&2
  return 1
}

LOCAL_IP="$(get_local_ip)" || {
  echo "Could not detect LAN IP. Set it manually: LAN_IP=192.168.x.x make dev-mobile" >&2
  exit 1
}

API_URL="http://${LOCAL_IP}:${PORT}/api"

echo "========================================"
echo " Stempo mobile dev"
echo " Laptop IP:  ${LOCAL_IP}"
echo " API URL:    ${API_URL}"
echo "========================================"

if [ "${SKIP_DOCKER:-}" != "1" ]; then
  echo "Starting backend (Docker) ..."
  (cd "$BACKEND_DIR" && $COMPOSE up -d --build)
  wait_for_backend
else
  echo "Skipping Docker (SKIP_DOCKER=1). Assuming backend is already running."
  wait_for_backend
fi

echo "Starting Expo (LAN mode) ..."
cd "$ELLA_DIR"
export EXPO_PUBLIC_API_URL="$API_URL"
exec npx expo start --lan
