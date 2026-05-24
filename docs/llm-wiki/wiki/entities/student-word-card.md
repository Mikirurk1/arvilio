---
tags: [entity, vocabulary]
updated: 2026-05-18
---

# Entity: StudentWordCard

Per-student vocabulary card linking a [[entities/user]] to a [[entities/word]].

## Fields

- `status`: NEW, REPEATED, MISTAKES_WORK, LEARNED
- `masteryLevel`, review timestamps (`firstSeenAt`, `nextReviewAt`, `knownAt`)
- `lessonId` optional — word introduced in a [[entities/scheduled-lesson]]
- `knownByTeacherId` — teacher marked known

## API

- GraphQL: `studentVocabulary`, `addStudentWordCard`, `updateCardStatus`
- Web `STUDENT_VOCABULARY` / card mutations must request `firstSeenAt` and `knownAt` — live statistics (`buildLiveStatisticsDashboard`) bucket added/known by those timestamps.
- Optional `studentId` arg — RBAC gap — [[concepts/auth-rbac#Known gaps]]

## Related

- [[entities/review-queue]]
- [[concepts/vocabulary]]
