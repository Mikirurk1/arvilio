---
tags: [concept, quizzes]
updated: 2026-05-17
---

# Quizzes & flashcards

Despite package name `module-flashcards`, this domain implements **quizzes** (multiple choice, fill-in), assignments, and attempts.

## Backend

- **Module:** `packages/backend/modules/module-flashcards`
- **QuizGeneratorService** — list, detail, generate (staff only), delete (owner or admin), `listForStudent`, `submitAttempt` (with `practiceMode` for staff preview)

## Data model

- [[entities/quiz]] → questions
- [[entities/quiz-assignment]] — teacher assigns to student
- [[entities/quiz-attempt]] + QuizAnswer

## GraphQL

- `quizzes`, `quiz`, `generateQuiz`, `studentQuizzes`, `deleteQuiz`, `submitQuizAttempt` — see [[concepts/graphql-api]]

## Web

- `/quiz`, `/practice/quiz` — quiz hub; students see `studentQuizzes` with `attempt` score; play via `QuizPlaySession` + `submitQuizAttempt`
- **Generate quiz** panel + **Create New Quiz** card (calls `generateQuiz`) — teacher/admin/super_admin only
- **Student profile → Quiz tab** — same generate/list/play pattern; staff **Practice** does not persist attempts
- Sidebar **Practice** badge: incomplete assigned quizzes + vocab `new` + `mistakes_work` (`usePracticeNavBadge`)
- `GenerateQuizPanel.tsx`, `StudentQuizTab.tsx`, `QuizPlaySession.tsx`
- Zustand: `quizzes-store.ts` (`fetchStudentQuizzes`, `deleteQuiz`, `submitQuizAttempt`)

## Generation sources (`QuizSource`)

MANUAL, VOCABULARY, LESSON, MIXED — ties to [[entities/word]] or [[entities/scheduled-lesson]].

## Related

- [[entities/quiz]]
- [[concepts/vocabulary]]
