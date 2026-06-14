#!/usr/bin/env bash
# Emit one agent wake — call after each redesign step completes (chain mode).
# Usage: ./scripts/redesign-loop-tick.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PURPOSE="${REDESIGN_LOOP_PURPOSE:-REDESIGN}"

PROMPT='Execute one SoEnglish redesign step: run ./scripts/redesign-next-step.sh and follow the printed prompt exactly. One plan ID only. Skills: .agents/skills/redesign-existing-projects and .cursor/skills/soenglish-redesign. Mark the step done in docs/redesign/plan.md. When finished (or if blocked with a clear reason), run ./scripts/redesign-loop-tick.sh again to queue the next step immediately — unless there are no todo steps left (then print AGENT_LOOP_STOP redesign complete and do NOT run tick).'

NEXT_OUT="$("$ROOT/scripts/redesign-next-step.sh" 2>&1)" || true

if echo "$NEXT_OUT" | grep -q "No steps with status 'todo'"; then
  echo "AGENT_LOOP_STOP redesign complete — no todo steps in plan."
  exit 0
fi

STEP_ID="$(echo "$NEXT_OUT" | sed -n 's/^ID:[[:space:]]*//p' | head -1)"
SURFACE="$(echo "$NEXT_OUT" | sed -n 's/^Surface:[[:space:]]*//p' | head -1)"

echo "── Redesign chain tick ──"
echo "Next: ${STEP_ID:-?} ${SURFACE:-}"
echo "(Cursor does not auto-start from terminal — paste prompt below into Agent, or use /loop with monitored shell.)"
echo ""

printf 'AGENT_LOOP_WAKE_%s {"prompt":"%s"}\n' "$PURPOSE" "$PROMPT"
