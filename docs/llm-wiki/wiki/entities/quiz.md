---
tags: [entity, quizzes]
updated: 2026-05-16
---

# Entity: Quiz

Quiz definition owned by a user, optionally tied to a [[entities/scheduled-lesson]].

## Fields

- `title`, `category`, `difficulty` (EASY/MEDIUM/HARD)
- `source`: MANUAL, VOCABULARY, LESSON, MIXED
- `ownerId`, optional `lessonId`

## Relations

- `questions` → QuizQuestion
- `assignments` → [[entities/quiz-assignment]]
- `attempts` → [[entities/quiz-attempt]]

## API

- GraphQL: `quizzes`, `quiz`, `generateQuiz`
- Service: `QuizGeneratorService` in `module-flashcards`

## Related

- [[concepts/quizzes-flashcards]]
