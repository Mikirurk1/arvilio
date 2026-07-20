# P0.17 /profile

**Role verified:** teacher (`jest-teacher@arvilio.test`) on `/uk/profile` — all tabs UK chrome OK.
**Student preferred** in plan; teacher session was already logged in (same chrome keys).

## Wired
- Hero: tabs, stats (Слова/Уроки/Серія), role badges, change-avatar aria, recent achievements heading
- Profile tab: sections, fields, save, summary terms, intro, bio placeholders
- Notifications / Connections / Appearance / Achievements / Account panels + password/avatar modals
- Catalog: `profile.*` (+ bio placeholders); seed `npm run seed:campus-ui -w @app/cms`

## Ignored (content / global)
- User PII, TZ display names, proficiency `B1 — Intermediate` / badge Intermediate
- Achievement titles (`Welcome Aboard`)
- Brand: Arvilio / Campus; provider names (Google/Facebook/Zoom)
- Global leftover: header `Arvilio — go to dashboard`, sidebar `Collapse sidebar` (not profile scope)

## Status
Done 2026-07-13. P0 wave complete (P0.18/19 aliases skipped).
