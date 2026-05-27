---
tags: [entity, billing]
updated: 2026-05-25
---

# Entity: LessonBalanceLedger

Append-only ledger for lesson balance changes.

## Kinds

| Kind | Meaning |
|------|---------|
| `PURCHASE` | Online payment succeeded (+N) |
| `MANUAL_CREDIT` | Admin manual top-up (+N) |
| `CONSUMPTION` | Lesson charged (−1) |
| `REVERSAL` | Consumption undone (+1) |

Unique `(scheduledLessonId, kind)` prevents double charge per lesson.

## Consumption rules

- `COMPLETED` (including auto-complete of past `PLANNED`)
- `CANCELLED` with `credited = true`

Otherwise an existing `CONSUMPTION` is reversed.

## Code

- `LessonBalanceService.syncLessonCharge` — called from `LessonsService` after update / auto-complete
