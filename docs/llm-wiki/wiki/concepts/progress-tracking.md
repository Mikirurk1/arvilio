---
tags: [concept, curriculum]
updated: 2026-05-16
---

# Progress tracking

Two progress concepts in SoEnglish:

## 1. Catalog lesson progress

- Models: [[entities/lesson]], [[entities/exercise]], [[entities/progress]]
- Tracks completion/score per user per catalog lesson
- Module: `module-progress`

## 2. Live lesson / calendar progress

- Dashboard and calendar aggregate [[entities/scheduled-lesson]] stats
- `DashboardService` in `module-auth` — role-scoped (student vs teacher lesson filters)

## Web

- Dashboard widgets — `apps/web/src/app/dashboard/`
- Statistics components — `components/statistics/` (may blend mocks)

## Related

- [[entities/progress]]
- [[entities/lesson]]
- [[concepts/lessons-calendar]]
