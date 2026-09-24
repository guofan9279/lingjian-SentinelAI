#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

source backend/.venv/bin/activate
mkdir -p backend/data/uploads

uvicorn app.main:app       --app-dir backend       --host "${BACKEND_HOST:-0.0.0.0}"       --port "${BACKEND_PORT:-8000}"       $( [ "${BACKEND_RELOAD:-true}" = "true" ] && printf '%s' '--reload' ) &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

cd frontend
npm run dev -- --hostname "${FRONTEND_HOST:-0.0.0.0}" --port "${FRONTEND_PORT:-3000}"
