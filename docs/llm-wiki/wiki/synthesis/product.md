---
tags: [synthesis, product]
updated: 2026-05-16
---

# Product synthesis — SoEnglish

SoEnglish is an **English learning platform** for structured 1:1 teaching: scheduled live lessons (with Google Meet), vocabulary tracking, quizzes/flashcards, homework flow, and curriculum-style lesson catalog.

## Primary users

| Persona | Goal |
|---------|------|
| **Student** | Attend lessons, study vocabulary, complete quizzes/practice, submit homework |
| **Teacher** | Schedule lessons, manage assigned students, review homework, assign quizzes |
| **Admin** | Provision student accounts, oversee platform users (students) |
| **Super admin** | Full user lifecycle including teachers/admins; CLI-only promotion to SUPER_ADMIN |

See [[concepts/roles-matrix]] and [[concepts/auth-rbac]].

## Core product areas

### Scheduled lessons (1:1)

- [[entities/scheduled-lesson]] — calendar events with teacher/student, status, recurrence, materials, homework
- Google Calendar + Meet integration — [[concepts/lessons-calendar]]
- Web: `/calendar`, `/lessons`, lesson modal — [[concepts/web-app]]

### Vocabulary

- Global [[entities/word]] dictionary enriched from external API
- Per-student [[entities/student-word-card]] with mastery status
- Spaced repetition via [[entities/review-queue]]
- Web: `/vocabulary`, `/practice/vocabulary` — [[concepts/vocabulary]]

### Quizzes & practice

- [[entities/quiz]] with questions, assignments, attempts
- Generation from vocabulary or manual — [[concepts/quizzes-flashcards]]
- Web: `/quiz`, `/practice/quiz`, `/practice`

### Curriculum catalog (catalog lessons)

- [[entities/lesson]] + [[entities/exercise]] — slug-based content tree (separate from scheduled 1:1 lessons)
- [[entities/progress]] — completion per user per catalog lesson — [[concepts/progress-tracking]]

### Dashboard & students

- Role-scoped dashboard stats — `module-auth` `DashboardService`
- Teacher/admin student list — GraphQL `students`, REST `GET /users/students`

## What is out of scope (today)

- **Stripe / billing** — not in codebase (wiki mentions only as future)
- **Facebook / Telegram OAuth** — enum in schema; Google is wired
- **Server-side route RBAC on web** — client matrix only — see [[concepts/auth-rbac#Known gaps]]

## Related

- [[overview]]
- [[synthesis/tech-stack]]
- [[synthesis/architecture]]
