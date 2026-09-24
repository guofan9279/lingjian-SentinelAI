#!/usr/bin/env bash
    set -euo pipefail

    ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
    cd "$ROOT_DIR"

    source backend/.venv/bin/activate
    python scripts/lint_python.py
python -m py_compile $(find backend -name '*.py' -type f | tr '\n' ' ')
    PYTHONPATH=backend pytest backend

    cd frontend
    npm run lint
    npm run typecheck
    npm run build
    npm run test
