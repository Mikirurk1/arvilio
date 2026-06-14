#!/usr/bin/env bash
# Redesign agent loop for Cursor.
#
# Modes (REDESIGN_LOOP_MODE):
#   chain   — default: no timer; agent runs ./scripts/redesign-loop-tick.sh after each step (immediate next)
#   interval — fixed sleep between ticks (REDESIGN_LOOP_INTERVAL_SEC, default 600)
#
# Start chain:  REDESIGN_LOOP_MODE=chain ./scripts/redesign-loop.sh
# Start timer:  REDESIGN_LOOP_INTERVAL_SEC=300 REDESIGN_LOOP_MODE=interval ./scripts/redesign-loop.sh
# Stop: kill the interval shell, or tell the agent to stop; chain stops when plan has no todos.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${REDESIGN_LOOP_MODE:-chain}"
INTERVAL_SEC="${REDESIGN_LOOP_INTERVAL_SEC:-600}"
PURPOSE="${REDESIGN_LOOP_PURPOSE:-REDESIGN}"

PROMPT='Execute one SoEnglish redesign step: run ./scripts/redesign-next-step.sh and follow the printed prompt exactly. One plan ID only. Skills: .agents/skills/redesign-existing-projects and .cursor/skills/soenglish-redesign. Mark the step done in docs/redesign/plan.md. When finished (or if blocked with a clear reason), run ./scripts/redesign-loop-tick.sh again to queue the next step immediately — unless there are no todo steps left (then print AGENT_LOOP_STOP redesign complete and do NOT run tick).'

if [[ "$MODE" == "chain" ]]; then
  echo "Redesign loop: chain mode (next step right after the previous one finishes)."
  echo "Each completed step should end with: ./scripts/redesign-loop-tick.sh"
  echo "Firing first tick now…"
  exec "$ROOT/scripts/redesign-loop-tick.sh"
fi

if [[ "$MODE" != "interval" ]]; then
  echo "Unknown REDESIGN_LOOP_MODE=$MODE (use chain or interval)" >&2
  exit 1
fi

echo "Redesign loop: interval mode — every ${INTERVAL_SEC}s (purpose=${PURPOSE})"
echo "First tick after ${INTERVAL_SEC}s; run ./scripts/redesign-loop-tick.sh once now for immediate overlap."

while true; do
  sleep "$INTERVAL_SEC"
  printf 'AGENT_LOOP_TICK_%s {"prompt":"%s"}\n' "$PURPOSE" "$PROMPT"
done
