---
tags: [synthesis, product]
updated: 2026-05-28
---

# Product synthesis — SoEnglish

SoEnglish is an **English learning platform** for structured 1:1 teaching: scheduled live lessons (with Google Meet), vocabulary tracking, quizzes/flashcards, homework flow, and curriculum-style lesson catalog.

## Today vs target platform

| | **Today** | **Target (vision)** |
|---|-----------|---------------------|
| Tenants | One school per deployment | Many schools on one platform |
| Who pays whom | Student → school (lesson packages); school configures providers | Same + **school → platform subscription** + **platform commission** on platform-sourced students |
| Student acquisition | School / admin provisions accounts | Optional **platform marketplace**: students register to find a tutor; platform may assign leads to schools |
| Comparison | School product (Edvibe-style ops) | **Hybrid**: school SaaS + marketplace take rate (Preply-like acquisition, not Preply’s tutor-only model) |

Cursor rule: `.cursor/rules/future-multitenant-architecture.mdc` (always apply).

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

- **Multi-tenant schools**, **subscription to open a school**, **student marketplace**, **commission ledger** — vision only; see table above
- **Facebook / Telegram OAuth** — configurable in System → Connections; Google wired for calendar/auth
- Fine-grained **platform vs school** admin surfaces — coarse `scope` / `/platform` seams exist; see [[concepts/auth-rbac]]

## Related

- [[overview]]
- [[synthesis/tech-stack]]
- [[synthesis/architecture]]
