---
tags: [concept, frontend]
updated: 2026-05-16
---

# Web application

Next.js App Router client at `apps/web` (dev port **4200**).

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing / redirect |
| `/login` | Auth (no shell); `/register` redirects to `/login` |
| `/system` | Super-admin: SMTP status, test welcome email |
| `/dashboard` | Role-scoped home — live GraphQL data (see below) |
| `/practice`, `/practice/vocabulary`, `/practice/quiz` | Practice hub |
| `/lessons`, `/lessons/[lessonId]` | Lesson lists/detail |
| `/calendar` | Schedule board |
| `/vocabulary` | Word cards |
| `/quiz` | Quizzes |
| `/students`, `/students/[studentId]` | Staff student list + profile (teacher+); route id is **backend UUID** |
| `/admin` | User management (admin+) |
| `/profile` | Profile & settings |

## Auth & layout

- `AppShell` + `AuthGate` — unauthenticated users → `/login`
- **No** `middleware.ts` role checks — [[concepts/auth-rbac#Known gaps]]
- `auth-context.tsx` — session from `GET /api/auth/me`
- `active-user.ts` — maps API user → numeric role for `canView` etc.

## API clients

| Client | File | Usage |
|--------|------|-------|
| REST | `lib/api.ts` | Auth, fetch with `credentials: 'include'` |
| GraphQL | `lib/graphql-client.ts` | Domain queries/mutations |
| Proxy | `next.config.mjs` | `/api/*` → backend for same-origin cookies |

## Dashboard (`/dashboard`)

`fetchDashboard(isStudent)` in `dashboard-store` loads in parallel:

| Block | Source | Student | Teacher / admin |
|-------|--------|---------|-----------------|
| Stat tiles | `dashboardSummary` | ✓ | ✓ |
| Hero banner | `lib/dashboard-hero.ts` — lesson today → vocab review → `/practice` | ✓ | lessons or practice CTA |
| Subtitle | `learningStreak` + locale date | ✓ | date only |
| Today's lessons | `scheduledLessons` (today, max 4) | ✓ | ✓ |
| Review words | `studentVocabulary` (`new` / `repeated` / `mistakes_work`) | ✓ | hidden |
| Daily goals | [[concepts/daily-goals]] | ✓ | hidden |
| Word of the day | `wordOfDay` (deterministic pick from deck) | ✓ | hidden |
| Streak calendar | `learningStreak` (`activeDays` for current month) | ✓ | hidden |

No mock lessons/vocab on this page.

## State (Zustand)

`apps/web/src/stores/` — e.g. `dashboard-store`, `lessons-store`, `quizzes-store`, `vocabulary-store`, `students-store`, `notifications-store` (toasts), `ui-store` (theme/font size on `<html>`).

Per `packages/frontend/ARCHITECTURE.md`: prefer server data; Zustand for ephemeral UI only — partially followed.

## Toasts (in-app notifications)

Ported from `materials/addax_assessment/.../features/notifications` (Redux → Zustand).

- `features/notifications/ToastViewport.tsx` — fixed top-right stack (max 5)
- `features/notifications/toast.ts` — `toast.success()`, `toast.error()`, etc.
- Mounted in `app/providers.tsx` (global)
- Variant colors use `--toast-*` tokens in `styles/tokens/_theme.scss` (light + `[data-theme='dark']`)

## Lesson detail save (`/lessons/[lessonId]`)

- Save builds payload via `fromLessonFormState` + `toUpdateScheduledLessonBody({ includeLessonContent: true })` (materials, homework, student response always sent).
- `mergeLessonDisplayNames` keeps the saved candidate content over empty API echoes.
- `ScheduledLessonsProvider` merges refetched lessons into local state (not one-time replace only).
- Draft init runs once per `lesson.id` so a successful save is not overwritten by a stale `lesson` reference.

## Practice session tracking

Prisma `PracticeSession` (kind, source, `startedAt`/`endedAt`, `durationSec`). GraphQL: `recordPracticeSession`, `practiceWeekSummary` (last 7 days UTC).

Vocabulary **Play** and quiz runs use `usePracticeSessionTracker` → `practice-store.recordSession` (min 30s client-side). `/practice` **Practice this week** loads `practiceWeekSummary` from API.

Profile **Notifications** tab = five email preference toggles persisted via `myProfile` / `updateMyProfile` (`notificationPrefs`). Debounced auto-save when logged in; mock prefs only without auth. See [[concepts/profile-notifications]] — not the toast UI.

## Feature modules

- `features/lesson-modal/` — lesson editor modal
- `features/calendar/` — calendar DnD, adapters

## Role gating

- Sidebar hides `/students`, `/admin`, `/system` (super-admin only)
- Pages use `canView` / `canSchedule` from `mocks/roles.ts` (re-exported `lib/roles.ts`)

## Students list → profile (API-backed)

- **List:** `students-store` → GraphQL `students` → `StudentSummaryCard` links to `/students/{id}` with backend **UUID** (`row.id`).
- **Detail:** `apps/web/src/app/students/[studentId]/page.tsx` resolves the student via `lib/student-profile.ts` (`resolveStudentProfile`) from the same store — **not** `getProfileByUserId` mock lookup.
- Legacy numeric mock URLs (`/students/3`) still work if that id exists in mock seed.
- **Vocabulary tab** passes `resolved.backendId` (UUID) to `StudentVocabularyTab` / GraphQL `studentVocabulary`.
- Profile/lessons/stats tabs still use mock overlays where not migrated; saving profile on API-created students only mutates mock if a matching mock user exists.
- **Profile → Statistics:** `ProfileLiveStatistics` — real data only (`dashboardSummary`, `vocabularyOverview` for students, `scheduledLessons` for lesson hours). No mock `StatisticsDashboard` / fake 3.7h.
- **Profile hero** Words/Lessons from same live stats; Streak shows `—` until backend exposes it.
- **Student detail → Statistics:** placeholder (no per-student analytics API yet).

## Related

- [[concepts/ui-design-system]]
- [[concepts/roles-matrix]]
- [[concepts/graphql-api]]
