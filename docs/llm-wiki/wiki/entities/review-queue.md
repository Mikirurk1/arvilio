---
tags: [entity, vocabulary]
updated: 2026-05-16
---

# Entity: ReviewQueue

Spaced-repetition scheduling for a student's [[entities/word]].

## Fields

- `dueAt`, `intervalDays`, `easeFactor`, `repetitions`
- Unique per `(userId, wordId)`

## Related

- [[concepts/vocabulary]]
- [[entities/student-word-card]]
