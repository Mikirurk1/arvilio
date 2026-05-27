#!/usr/bin/env bash
# Agent-browser smoke tour: public auth pages + app routes per role.
# Prereqs: npm run dev (web :4200, API :3000), npm run seed:test-users
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE="${AGENT_BROWSER_BASE_URL:-http://localhost:4200}"
BASE="${BASE%/}"
OUT="${AGENT_BROWSER_OUT:-$ROOT/tmp/agent-browser-tour}"
PASS="${PLAYWRIGHT_TEST_PASSWORD:-TestPass123!}"
STUDENT="${PLAYWRIGHT_TEST_EMAIL:-jest-student@soenglish.test}"
TEACHER="${PLAYWRIGHT_TEACHER_EMAIL:-jest-teacher@soenglish.test}"
ADMIN="${PLAYWRIGHT_ADMIN_EMAIL:-jest-admin@soenglish.test}"
SUPER="${PLAYWRIGHT_SUPER_ADMIN_EMAIL:-jest-super-admin@soenglish.test}"

mkdir -p "$OUT/screenshots"
REPORT="$OUT/report.md"
: >"$REPORT"

log() {
  echo "$*" | tee -a "$REPORT"
}

slugify() {
  echo "$1" | sed 's#^/##' | sed 's#/#-#g' | sed 's#[^a-zA-Z0-9._-]#_#g'
}

ab_login() {
  local email="$1"
  agent-browser open "$BASE/login" >/dev/null
  agent-browser find label Email fill "$email" >/dev/null
  agent-browser find label Password fill "$PASS" >/dev/null
  agent-browser snapshot -i >/dev/null
  agent-browser click @e5 >/dev/null
  agent-browser wait 3000 >/dev/null
  local url
  url="$(agent-browser get url 2>/dev/null || true)"
  if [[ "$url" != *"/dashboard"* ]]; then
    log "- **LOGIN FAILED** \`$email\` — still at \`$url\` (run \`npm run seed:test-users\`)"
    return 1
  fi
  log "- Logged in as \`$email\`"
}

ab_logout() {
  agent-browser cookies clear >/dev/null 2>&1 || true
}

visit() {
  local role="$1"
  local path="$2"
  local note="${3:-}"
  local url="$BASE$path"
  local slug
  slug="$(slugify "$path")"
  local shot="$OUT/screenshots/${role}__${slug}.png"

  agent-browser open "$url" >/dev/null
  agent-browser wait 1500 >/dev/null
  local title final_url status
  final_url="$(agent-browser get url 2>/dev/null || echo "$url")"
  title="$(agent-browser get title 2>/dev/null || echo "")"
  agent-browser screenshot "$shot" >/dev/null 2>&1 || true

  status="ok"
  if [[ "$final_url" == *"/login"* ]] && [[ "$path" != "/login" ]] && [[ "$path" != "/register" ]] && [[ "$path" != "/forgot-password" ]] && [[ "$path" != "/reset-password" ]]; then
    status="redirected-to-login"
  elif [[ "$final_url" == *"/dashboard"* ]] && [[ "$path" != "/dashboard"* ]]; then
    case "$path" in
      /admin|/system|/students|/students/*|/payment) status="denied-or-redirect" ;;
    esac
  elif [[ "$final_url" != *"$path"* ]]; then
    status="url-mismatch"
  fi

  log "| \`$path\` | $role | $status | \`$final_url\` | $title | screenshots/${role}__${slug}.png | ${note} |"
}

log "# SoEnglish agent-browser tour"
log ""
log "- **Base:** $BASE"
log "- **Output:** \`$OUT\`"
log "- **Started:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
log ""

# --- Public (no auth) ---
log "## Public auth pages"
log ""
log "| Path | Role | Status | Final URL | Title | Screenshot | Notes |"
log "|------|------|--------|-----------|-------|------------|-------|"

ab_logout
for path in /login /register /forgot-password /reset-password; do
  visit public "$path"
done

# --- Student ---
log ""
log "## Student (\`$STUDENT\`)"
log ""
agent-browser close --all >/dev/null 2>&1 || true
ab_logout
if ab_login "$STUDENT"; then
  log ""
  log "| Path | Role | Status | Final URL | Title | Screenshot | Notes |"
  log "|------|------|--------|-----------|-------|------------|-------|"
  for path in \
    /dashboard \
    /practice \
    /practice/speaking \
    /practice/quiz \
    /practice/vocabulary \
    /chat \
    /lessons \
    /calendar \
    /payment \
    /profile \
    /vocabulary \
    /quiz; do
    visit student "$path"
  done
fi

# --- Teacher ---
log ""
log "## Teacher (\`$TEACHER\`)"
log ""
agent-browser close --all >/dev/null 2>&1 || true
ab_logout
if ab_login "$TEACHER"; then
  log ""
  log "| Path | Role | Status | Final URL | Title | Screenshot | Notes |"
  log "|------|------|--------|-----------|-------|------------|-------|"
  for path in \
    /dashboard \
    /practice \
    /chat \
    /lessons \
    /calendar \
    /students \
    /profile \
    /vocabulary \
    /quiz; do
    visit teacher "$path"
  done

  agent-browser open "$BASE/students" >/dev/null
  agent-browser wait 2000 >/dev/null
  student_href="$(agent-browser eval "
    const a = document.querySelector('a[href^=\"/students/\"]');
    a ? a.getAttribute('href') : '';
  " 2>/dev/null | tr -d '"' || true)"
  if [[ -n "$student_href" && "$student_href" != "/" ]]; then
    visit teacher "$student_href" "first student from list"
  else
    log "| \`/students/:id\` | teacher | skip | — | — | — | no student link on /students |"
  fi

  agent-browser open "$BASE/lessons" >/dev/null
  agent-browser wait 2000 >/dev/null
  lesson_href="$(agent-browser eval "
    const a = document.querySelector('a[href^=\"/lessons/\"]');
    a ? a.getAttribute('href') : '';
  " 2>/dev/null | tr -d '"' || true)"
  if [[ -n "$lesson_href" && "$lesson_href" != "/lessons" ]]; then
    visit teacher "$lesson_href" "first lesson from list"
  else
    log "| \`/lessons/:id\` | teacher | skip | — | — | — | no lesson link on /lessons |"
  fi
fi

# --- Admin ---
log ""
log "## Admin (\`$ADMIN\`)"
log ""
agent-browser close --all >/dev/null 2>&1 || true
ab_logout
if ab_login "$ADMIN"; then
  log ""
  log "| Path | Role | Status | Final URL | Title | Screenshot | Notes |"
  log "|------|------|--------|-----------|-------|------------|-------|"
  for path in /dashboard /admin /students /calendar /profile; do
    visit admin "$path"
  done
fi

# --- Super admin ---
log ""
log "## Super admin (\`$SUPER\`)"
log ""
agent-browser close --all >/dev/null 2>&1 || true
ab_logout
if ab_login "$SUPER"; then
  log ""
  log "| Path | Role | Status | Final URL | Title | Screenshot | Notes |"
  log "|------|------|--------|-----------|-------|------------|-------|"
  for path in /dashboard /system /admin /students /profile; do
    visit super "$path"
  done
fi

log ""
log "- **Finished:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
agent-browser close --all >/dev/null 2>&1 || true

echo ""
echo "Report: $REPORT"
echo "Screenshots: $OUT/screenshots/"
