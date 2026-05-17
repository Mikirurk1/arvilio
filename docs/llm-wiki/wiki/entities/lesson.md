---
tags: [entity, curriculum]
updated: 2026-05-16
---

# Entity: Lesson (catalog)

Structured **curriculum** lesson (content catalog), not a scheduled 1:1 session.

## Fields

- `slug`, `title`, `description`, `level`, `order`
- `exercises` → [[entities/exercise]] (via relation)

## Distinction

| Model | Purpose |
|-------|---------|
| **Lesson** (this) | Static course content + exercises |
| **ScheduledLesson** | Live booked session with teacher/student |

## Progress

- [[entities/progress]] links `userId` + `lessonId`

## Related

- [[concepts/progress-tracking]]
