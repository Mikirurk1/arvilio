# Wiki index

Catalog of all wiki pages. Updated: 2026-07-11.

## Overview & synthesis

- [[overview]] — monorepo map and quick links
- [[synthesis/product]] — Arvilio ecosystem: Campus (now) + Connect (later) + Control Plane
- [[synthesis/tech-stack]] — Turborepo, Next, Nest, Prisma, integrations
- [[synthesis/architecture]] — layers, data flow, module boundaries

## Entities

- [[entities/user]] — identity, roles, relations
- [[entities/language]] — catalog, native + learning languages
- [[entities/scheduled-lesson]] — live lessons (1:1 or group), Meet, homework
- [[entities/student-group]] — admin learning groups (billing template, members)
- [[entities/lesson-material]] — materials on scheduled lessons
- [[entities/library-material]] — school materials library (boards, books, assets)
- [[entities/library-file-user-annotation]] — per-user PDF book annotations (vector JSON)
- [[entities/library-file-caption-track]] — auto STT/translation WebVTT tracks for audio/video
- [[entities/lesson]] — catalog curriculum lesson
- [[entities/exercise]] — catalog exercise step
- [[entities/word]] — global dictionary entry
- [[entities/student-word-card]] — per-student vocabulary card
- [[entities/review-queue]] — spaced repetition queue
- [[entities/quiz]] — quiz definition
- [[entities/quiz-assignment]] — quiz assigned to student
- [[entities/speaking-topic]] — speaking discussion topic + assignment + submission
- [[entities/quiz-attempt]] — student quiz run
- [[entities/progress]] — catalog lesson completion
- [[entities/google-calendar-connection]] — Google Calendar OAuth
- [[entities/zoom-connection]] — Zoom OAuth tokens for video lessons
- [[entities/student-lesson-balance]] — prepaid lesson credits per student
- [[entities/lesson-balance-ledger]] — balance audit (purchase, consumption, reversal)
- [[entities/staff-payout]] — manual staff compensation payout record

## Concepts

- [[concepts/package-aliases]] — `@pkg/*`, `@be/*`, `@fe/*`, `@app/*` import scopes
- [[concepts/backend-modules]] — `@be/*` folder layout, layers, GraphQL ownership, tests
- [[concepts/auth-rbac]] — cookies, JWT, API vs UI auth, known gaps
- [[concepts/testing]] — Jest unit/integration, Playwright E2E, commands
- [[concepts/transactional-email]] — welcome email, SMTP (Resend/Brevo/SES/Mailtrap), Platform Settings
- [[concepts/profile-notifications]] — profile toggles, cron delivery, teacher messages
- [[concepts/unified-profile-form]] — shared profile tab UI (`UnifiedProfilePanel`) for self, student, staff
- [[concepts/roles-matrix]] — STUDENT / TEACHER / ADMIN / SUPER_ADMIN tables
- [[concepts/graphql-api]] — resolvers and operations
- [[concepts/lessons-calendar]] — scheduling, video meetings, calendar UI
- [[concepts/video-meeting-providers]] — Google Meet / Zoom / LiveKit resolver, configuration
- [[concepts/group-lessons]] — multi-student lessons, billing modes, participants
- [[concepts/materials-library]] — school library tab, assets, lesson attach
- [[concepts/vocabulary]] — words, cards, dictionary API
- [[concepts/quizzes-flashcards]] — quizzes, assignments, attempts
- [[concepts/chat]] — realtime messaging, Socket.IO, visibility rules
- [[concepts/progress-tracking]] — catalog + dashboard progress
- [[concepts/achievements]] — live achievement counters and unlock rules
- [[concepts/daily-goals]] — dashboard daily goals (student)
- [[concepts/statistics-dashboard]] — period statistics API + profile/student UI
- [[concepts/staff-payouts]] — staff compensation accrual, payouts, finance UI
- [[concepts/web-app]] — Next routes, stores, API clients
- [[concepts/payload-cms]] — Company CMS (`apps/cms`); Campus + Hub read over HTTP; SEO catalog + [roadmap](../../../arvilio-seo-roadmap.md)
- [[concepts/campus-i18n]] — Campus UI chrome uk/en via CMS + code fallbacks
- [[concepts/arvi]] — Arvi mascot poses, `useArvi` / `ArviSlot`, presence map (B7); Tour v3 chapter hub + soft scenarios
- [[concepts/arvi-assistant]] — clickable Arvi help chat, LLM providers, role-scoped corpus, academic refusal
- [[concepts/onboarding]] — school wizard (`/onboarding`) + product tour seam; profile/invite/sample side-effects
- [[concepts/ui-design-system]] — `components/ui` primitives, SCSS tokens
- [[concepts/redesign-plan]] — Preply/Edvibe-style UI refresh; `docs/redesign/plan.md` step IDs
- [[concepts/frontend-packages]] — planned `packages/frontend` migration
- [[concepts/billing-payments]] — lesson balance, Stripe/LiqPay/WayForPay/Lemon Squeezy/Paddle/MonoPay/PayPal, multi-method manual invoice
- [[concepts/security]] — HTTP headers, rate limiting, MIME filter, CVE status, attack surface
- [[concepts/multi-tenancy]] — planned SaaS transition: tenant isolation, subdomains/custom domains, platform admin, 3-layer billing (ADR-005…009)

## Sources

- [[sources/2026-05-16-monorepo-inventory]] — audit: monorepo layout
- [[sources/2026-05-16-rbac]] — audit: roles and permissions

## Filed queries

_(none yet)_
