#!/usr/bin/env bash
# Wait until Docker Desktop engine responds (used by docker:up / docker:postgres).
set -euo pipefail

yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*"; }

wait_for_docker() {
  local max_wait="${1:-180}"
  local elapsed=0
  while ! docker info >/dev/null 2>&1; do
    if (( elapsed >= max_wait )); then
      return 1
    fi
    sleep 5
    elapsed=$((elapsed + 5))
    yellow "Waiting for Docker engine (${elapsed}s / ${max_wait}s)…"
  done
}

if docker info >/dev/null 2>&1; then
  exit 0
fi

yellow "Docker daemon is not running. Starting Docker Desktop…"
open -a Docker 2>/dev/null || true

if ! wait_for_docker 180; then
  red "Docker engine still not reachable."
  echo ""
  echo "1. Open Docker Desktop from Applications"
  echo "2. Wait until the whale icon is steady"
  echo "3. Docker Desktop → Troubleshoot → Restart"
  echo "4. Run: docker info"
  exit 1
fi
