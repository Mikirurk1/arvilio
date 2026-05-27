# Wiki index

Catalog of all wiki pages. Updated: 2026-05-16 (full project bootstrap).

## Overview & synthesis

- [[overview]] — monorepo map and quick links
- [[synthesis/product]] — what SoEnglish is, product areas
- [[synthesis/tech-stack]] — Turborepo, Next, Nest, Prisma, integrations
- [[synthesis/architecture]] — layers, data flow, module boundaries

## Entities

- [[entities/user]] — identity, roles, relations
- [[entities/language]] — catalog, native + learning languages
- [[entities/scheduled-lesson]] — 1:1 live lessons, Meet, homework
- [[entities/lesson-material]] — materials on scheduled lessons
- [[entities/lesson]] — catalog curriculum lesson
- [[entities/exercise]] — catalog exercise step
- [[entities/word]] — global dictionary entry
- [[entities/student-word-card]] — per-student vocabulary card
- [[entities/review-queue]] — spaced repetition queue
- [[entities/quiz]] — quiz definition
- [[entities/quiz-assignment]] — quiz assigned to student
- [[entities/quiz-attempt]] — student quiz run
- [[entities/progress]] — catalog lesson completion
- [[entities/google-calendar-connection]] — Google Calendar OAuth
- [[entities/student-lesson-balance]] — prepaid lesson credits per student
- [[entities/lesson-balance-ledger]] — balance audit (purchase, consumption, reversal)

## Concepts

- [[concepts/package-aliases]] — `@pkg/*`, `@be/*`, `@fe/*`, `@app/*` import scopes
- [[concepts/backend-modules]] — `@be/*` folder layout, layers, GraphQL ownership, tests
- [[concepts/auth-rbac]] — cookies, JWT, API vs UI auth, known gaps
- [[concepts/testing]] — Jest unit/integration, Playwright E2E, commands
- [[concepts/transactional-email]] — welcome email, Mailtrap, templates
- [[concepts/profile-notifications]] — profile toggles, cron delivery, teacher messages
- [[concepts/roles-matrix]] — STUDENT / TEACHER / ADMIN / SUPER_ADMIN tables
- [[concepts/graphql-api]] — resolvers and operations
- [[concepts/lessons-calendar]] — scheduling, Meet, calendar UI
- [[concepts/vocabulary]] — words, cards, dictionary API
- [[concepts/quizzes-flashcards]] — quizzes, assignments, attempts
- [[concepts/chat]] — realtime messaging, Socket.IO, visibility rules
- [[concepts/progress-tracking]] — catalog + dashboard progress
- [[concepts/achievements]] — live achievement counters and unlock rules
- [[concepts/daily-goals]] — dashboard daily goals (student)
- [[concepts/web-app]] — Next routes, stores, API clients
- [[concepts/ui-design-system]] — `components/ui` primitives, SCSS tokens
- [[concepts/redesign-plan]] — Preply/Edvibe-style UI refresh; `docs/redesign/plan.md` step IDs
- [[concepts/frontend-packages]] — planned `packages/frontend` migration
- [[concepts/billing-payments]] — lesson balance, Stripe/LiqPay/WayForPay/Lemon Squeezy/Paddle/MonoPay/PayPal, multi-method manual invoice

## Sources

- [[sources/2026-05-16-monorepo-inventory]] — audit: monorepo layout
- [[sources/2026-05-16-rbac]] — audit: roles and permissions

## Filed queries

_(none yet)_
