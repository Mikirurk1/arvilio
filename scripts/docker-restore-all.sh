#!/usr/bin/env bash
# Restore SoEnglish Docker stack + discover other compose projects on this machine.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

WITH_STACK=0
for arg in "$@"; do
  if [[ "$arg" == "--stack" ]]; then
    WITH_STACK=1
  fi
done

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

wait_for_docker() {
  local max_wait="${1:-120}"
  local elapsed=0
  while ! docker info >/dev/null 2>&1; do
    if (( elapsed >= max_wait )); then
      return 1
    fi
    sleep 5
    elapsed=$((elapsed + 5))
    yellow "  … waiting for Docker engine (${elapsed}s / ${max_wait}s)"
  done
  return 0
}

if ! docker info >/dev/null 2>&1; then
  yellow "Docker CLI cannot reach the engine (socket exists but daemon is not responding)."
  yellow "Starting Docker Desktop…"
  open -a Docker 2>/dev/null || true
  if ! wait_for_docker 180; then
    red "Docker engine still not reachable."
    echo ""
    echo "Try manually:"
    echo "  1. Open Docker Desktop from Applications"
    echo "  2. Wait until the whale icon is steady (not animating)"
    echo "  3. Docker Desktop → Troubleshoot → Restart Docker Desktop"
    echo "  4. Run: docker info"
    echo ""
    echo "Context: $(docker context show 2>/dev/null || echo unknown)"
    echo "Socket:  ${HOME}/.docker/run/docker.sock ($(
      test -S "${HOME}/.docker/run/docker.sock" && echo present || echo missing
    ))"
    exit 1
  fi
fi

green "Docker engine is running."

echo ""
yellow "=== Volumes (data may survive after container delete) ==="
docker volume ls

echo ""
yellow "=== Images (can recreate containers with same image) ==="
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.ID}}"

echo ""
yellow "=== docker-compose files under ~/Programming (excluding node_modules) ==="
SEARCH_ROOT="${SEARCH_ROOT:-$HOME/Programming}"
if [[ -d "$SEARCH_ROOT" ]]; then
  while IFS= read -r f; do
    echo "  $f"
  done < <(
    find "$SEARCH_ROOT" \( -path '*/node_modules/*' -o -path '*/.git/*' \) -prune -o \
      \( -name 'docker-compose.yml' -o -name 'docker-compose.yaml' -o -name 'compose.yml' -o -name 'compose.yaml' \) \
      -print 2>/dev/null | sort
  )
else
  echo "  (no $SEARCH_ROOT)"
fi

if (( WITH_STACK )); then
  green "=== Restoring SoEnglish (postgres + api + web in Docker) ==="
else
  green "=== Restoring SoEnglish (postgres only; use npm run dev for api/web) ==="
  yellow "Full Docker stack: npm run docker:restore:stack"
fi

if [[ ! -f .env ]]; then
  yellow "Missing .env — copy from .env.example before API will work."
fi

if (( WITH_STACK )); then
  node scripts/free-dev-ports.cjs
  docker compose -f infra/docker/docker-compose.yml --profile stack up -d --build
else
  npm run docker:stack:down >/dev/null 2>&1 || true
  docker compose -f infra/docker/docker-compose.yml up -d
fi

echo ""
yellow "Waiting for postgres (healthy)…"
for _ in $(seq 1 30); do
  if docker inspect -f '{{.State.Health.Status}}' soenglish-postgres 2>/dev/null | grep -q healthy; then
    green "postgres is healthy."
    break
  fi
  sleep 2
done

if (( WITH_STACK )); then
  echo ""
  yellow "API first start compiles TypeScript (1–3 min). Tail logs: npm run docker:logs"
fi

sleep 2
docker compose -f infra/docker/docker-compose.yml ps -a

if (( WITH_STACK )); then
  if docker inspect -f '{{.State.Running}}' soenglish-api 2>/dev/null | grep -q true; then
    green "soenglish-api is running."
  else
    yellow "soenglish-api not running yet — check: docker logs soenglish-api --tail 40"
  fi
fi

echo ""
yellow "Applying Prisma migrations (host → postgres:5432)…"
npm run prisma:migrate:deploy

echo ""
if (( WITH_STACK )); then
  green "SoEnglish Docker stack restore finished."
  echo "  Web:  http://localhost:4200"
  echo "  API:  http://localhost:3000/api"
else
  green "Postgres restore finished. Start app on host:"
  echo "  npm run dev"
  echo "  Web:  http://localhost:4200"
  echo "  API:  http://localhost:3000/api"
fi
echo ""
yellow "Other projects: cd to a compose folder from the list above and run:"
echo "  docker compose up -d"
echo ""
yellow "To restore a container from an image only (no compose file):"
echo "  docker run -d --name <name> -p <host>:<container> <image>:<tag>"
echo "  docker volume ls   # match volume names to old services"
