---
tags: [entity, vocabulary]
updated: 2026-05-16
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
- Optional `studentId` arg — RBAC gap — [[concepts/auth-rbac#Known gaps]]

## Related

- [[entities/review-queue]]
- [[concepts/vocabulary]]
