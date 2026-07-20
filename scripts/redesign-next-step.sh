#!/usr/bin/env bash
# Print the next redesign plan step (first | todo | in docs/redesign/plan.md) and a ready agent prompt.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLAN="${REDESIGN_PLAN:-$ROOT/docs/redesign/plan.md}"

if [[ ! -f "$PLAN" ]]; then
  echo "Plan not found: $PLAN" >&2
  exit 1
fi

# Table rows: | R-xx | ... | todo |
line="$(awk -F'|' '
  NF >= 2 {
    id = $2; gsub(/^[ \t]+|[ \t]+$/, "", id)
    if (id ~ /^R-[0-9]/) {
      status = $(NF-1); gsub(/^[ \t]+|[ \t]+$/, "", status)
      if (status == "todo") {
        print $0
        exit
      }
    }
  }
' "$PLAN")"

if [[ -z "${line:-}" ]]; then
  echo "No steps with status 'todo' in $PLAN"
  exit 0
fi

id="$(echo "$line" | awk -F'|' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
surface="$(echo "$line" | awk -F'|' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
files="$(echo "$line" | awk -F'|' '{print $4}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

echo "=== Next redesign step ==="
echo "ID:      $id"
echo "Surface: $surface"
echo "Files:   $files"
echo ""
echo "=== Agent prompt (copy or use with /loop) ==="
cat <<EOF
Виконай крок $id з docs/redesign/plan.md.

Surface: $surface
Primary files: $files

Skills: .agents/skills/redesign-existing-projects, .cursor/skills/soenglish-redesign.
Reuse: plan.md §1.4 — components/ui і feature blocks; не переписуй сторінку з нуля.
Scope: лише файли цього кроку.

Після змін:
- typecheck/lint для @app/campus якщо чіпав TS/SCSS
- agent-browser або ./scripts/agent-browser-all-pages.sh за потреби
- у docs/redesign/plan.md зміни Status для $id на done

Якщо крок заблокований — напиши чому і не позначай done.

Після успішного done (ланцюг loop): ./scripts/redesign-loop-tick.sh
EOF
