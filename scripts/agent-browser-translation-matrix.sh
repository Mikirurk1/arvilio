#!/usr/bin/env bash
# Translation provider matrix via agent-browser.
# Prereqs: npm run dev, npm run seed:test-users, agent-browser CLI installed.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec npx tsx "$ROOT/scripts/translation-matrix-browser.mjs" "$@"
