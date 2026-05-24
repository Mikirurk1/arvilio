---
tags: [concept, quizzes]
updated: 2026-05-18
---

# Quizzes & flashcards

Despite package name `module-flashcards`, this domain implements **quizzes** (multiple choice, fill-in), assignments, and attempts.

## Backend

- **Module:** `packages/backend/modules/flashcards`
- **QuizGeneratorService** — list, detail, generate (staff only), delete (owner or admin), `listForStudent`, `submitAttempt` (with `practiceMode` for staff preview)

## Data model

- [[entities/quiz]] → questions
- [[entities/quiz-assignment]] — teacher assigns to student
- [[entities/quiz-attempt]] + QuizAnswer

## GraphQL

- `quizzes`, `quiz`, `generateQuiz`, `studentQuizzes`, `deleteQuiz`, `submitQuizAttempt` — see [[concepts/graphql-api]]
- `quizzes` list includes optional `attempt` for the current user (staff self-serve on `/quiz`); **Start Quiz** persists attempts; **Practice** does not

## Web

- `/quiz`, `/practice/quiz` — quiz hub; students see `studentQuizzes` with latest finished `attempt` (score + `finishedAt`); play via `QuizPlaySession` + `submitQuizAttempt` (store refetches + optimistic card patch)
- **Generate quiz** panel + **Create New Quiz** card (calls `generateQuiz`) — teacher/admin/super_admin only
- **Student profile → Quiz tab** — same generate/list/play pattern; staff **Practice** does not persist attempts
- Sidebar **Practice** badge: incomplete assigned quizzes + vocab `new` + `mistakes_work` (`usePracticeNavBadge`)
- `CreateQuizCard.tsx` (generate UI in quiz grid), `StudentQuizTab.tsx` (card grid via `QuizAssignmentCards`), `QuizPlaySession.tsx`
- Quiz generation uses **only** the target user's `StudentWordCard` rows (no global dictionary fallback); MCQ distractors from the same user's vocabulary
- **Student profile → generate:** pass `studentId`; pool is the student's vocabulary; quiz is assigned to them only — it does **not** appear in staff `quizzes` list (`listFor` excludes owner quizzes assigned solely to other students); store skips `fetchList` when `studentId` is set
- Zustand: `quizzes-store.ts` (`fetchStudentQuizzes`, `deleteQuiz`, `submitQuizAttempt`)

## Generation sources (`QuizSource`)

Stored on the quiz record; chosen in `CreateQuizCard` → `generateQuiz`:

| `source` | Pool |
|----------|------|
| `vocabulary` | All `StudentWordCard` rows for the target user |
| `lesson` | Cards with the given `lessonId` (requires `lessonId`) |
| `mixed` | Lesson words first, then other vocabulary (deduped; requires `lessonId`) |

Generation uses only the target user's cards (no global dictionary). MCQ distractors come from the same user's vocabulary. Pool order weights `mistakes_work` > `new` > `repeated` > `learned`.

**Question templates:** definition MCQ, reverse MCQ, cloze (when `example` exists), translation MCQ (when native `lemmaText`/gloss exists), past tense / past participle MCQ for lemmas in the curated irregular-verb list (`includeIrregularVerbDrills`, default on). Failed templates fall back to definition MCQ.

**UI:** `CreateQuizCard` — Source hints, irregular-verb checkbox, lesson/mixed disabled without `lessonId`. Web `generateQuiz` uses REST `POST /quizzes/generate` (full `GenerateQuizRequestDto` including `includeIrregularVerbDrills`); GraphQL `generateQuiz` also exposes the field on `GenerateQuizInput` after API rebuild/restart.

## Related

- [[entities/quiz]]
- [[concepts/vocabulary]]
