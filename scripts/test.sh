#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

source backend/.venv/bin/activate
PYTHONPATH=backend pytest backend

cd frontend
npm run test
