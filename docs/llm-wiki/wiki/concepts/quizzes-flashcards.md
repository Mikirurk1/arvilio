---
tags: [concept, quizzes]
updated: 2026-05-30
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
- `quizzes` list includes optional `attempt` for the current user (staff self-serve on `/quiz`); **Start Quiz** persists attempts; **Practice** does not

## Web

- `/quiz`, `/practice/quiz` — single play path via `QuizPlaySession`; results via `QuizResultScreen` (score, mistake review, open word details)
- Students see `studentQuizzes` with latest finished `attempt` (score + `finishedAt`); `submitQuizAttempt` refetches lists
- **Generate quiz** — `CreateQuizCard` (teacher/admin); **Student profile → Quiz tab** uses the same components
- Sidebar **Practice** badge: incomplete assigned quizzes + vocab `new` + `mistakes_work` (`usePracticeNavBadge`)
- `QuizAssignmentCards`, `quizzes-store.ts` (`fetchStudentQuizzes`, `deleteQuiz`, `submitQuizAttempt`)
- Legacy mock play flow on `/quiz` removed — quizzes load only from API

## Generation sources (`QuizSource`)

Stored on the quiz record; chosen in `CreateQuizCard` → `generateQuiz`:

| `source` | Pool |
|----------|------|
| `vocabulary` | All `StudentWordCard` rows for the target user |
| `lesson` | Cards with the given `lessonId` (requires `lessonId`) |
| `mixed` | Lesson-linked cards first (weighted order within each group), then other vocabulary; deduped; requires `lessonId` |

Optional **`mistakesOnly`** (DTO + GraphQL `GenerateQuizInput`): pool is limited to cards with status `MISTAKES_WORK`.

Generation uses only the target user's cards (no global dictionary). Pool order weights `mistakes_work` > `new` > `repeated` > `learned`.

**Difficulty** (`easy` | `medium` | `hard`) is chosen at **generate** time in `CreateQuizCard` and stored on the quiz record (badge on cards). It does not change grading during play — only which question templates `templateCycle` in `quiz-generator.helpers.ts` prefers per word:

| Level | Typical question mix |
|-------|-------------------|
| **Easy** | Almost only definition MCQ; occasional past-tense MCQ if irregular-verb drills on and the word is in the irregular list |
| **Medium** | Rotates definition, reverse, cloze (if example), translation (if native gloss), irregular past / past participle when enabled |
| **Hard** | Same pool as medium but rotation favors cloze/reverse/translation/irregular first |

Also depends per word: `example` (cloze), native `translation`, `includeIrregularVerbDrills`, and `resolveVerbForms` (irregular verb list in `@pkg/types`).

**Question templates:** definition MCQ, reverse MCQ, cloze (when `example` exists; multi-word lemmas mask the full phrase), translation MCQ (medium/hard only; when native gloss exists), past tense / past participle MCQ for irregular verbs (`includeIrregularVerbDrills`, default on). Failed templates fall back to definition MCQ.

**Translation MCQ semantics:** prompt shows the student’s native gloss (`word.translation`); **options are four distinct English lemmas** (`word.text` + pool distractors). Options must pass `isEnglishLemmaForQuiz` and must not duplicate the gloss text. Skipped when lemma normalizes to the same string as the gloss.

**Post-generation validation:** `quiz-question-validator.ts` rejects invalid MCQ/fill-in shapes before a template is accepted in `buildQuestionWithFallback` (e.g. native text in English-option slots).

**Semantic distractors:** `QuizDistractorService` calls Datamuse `rel_syn` for target lemmas and prefers synonym rows that also exist in the student distractor pool (`synonymHintsByWordId` passed into `buildQuestions`).

**MCQ quality:** distractors are deduped by **answer text** (not only word id); `buildMcqOptions` requires four unique options. Definitions/translations prefer POS-scoped glosses from `word.definitions`. If the first pass cannot build enough questions, a relaxed distractor pass runs; generation fails with `BadRequestException` when below ~80% of requested count (min 3).

**Grading:** fill-in answers use `normalizeQuizFillAnswer` (trim, collapse spaces, lowercase, strip trailing punctuation) in `quiz-grading.util.ts`; web preview mirrors this via `apps/campus/src/lib/quiz-grading.ts`.

**Learning loop:** on a non-practice submit, wrong answers with `wordId` promote the student's card to `MISTAKES_WORK` (never downgrades `LEARNED`).

## Standalone irregular verbs drill (web)

Separate from teacher-generated quizzes: `/practice/irregular-verbs` runs a client-side **Three Forms Drill** on the global irregular-verb catalog (`listIrregularVerbs` in `@pkg/types`). Uses the same past simple / past participle MCQ idea as quiz generation but does not require words in the student's vocabulary. See [[concepts/web-app#Irregular verbs practice (`/practice/irregular-verbs`)]].

## Related

- [[entities/quiz]]
- [[concepts/vocabulary]]
