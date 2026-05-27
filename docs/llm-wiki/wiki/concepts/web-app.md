---
tags: [concept, frontend]
updated: 2026-05-27
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
| `/practice`, `/practice/vocabulary`, `/practice/quiz`, `/practice/speaking` | Practice hub |
| `/lessons`, `/lessons/[lessonId]` | Lesson lists/detail |
| `/calendar` | Schedule board — month/week grid; sidebar stacks below calendar on tablet/mobile; week view horizontal scroll |
| `/vocabulary` | Word cards |
| `/quiz` | Quizzes |
| `/students`, `/students/[studentId]` | Staff student list + profile (teacher+); route id is **backend UUID** |
| `/admin` | User management (admin+) |
| `/profile` | Profile & settings |

## Auth & layout

- `AppShell` wraps app routes with `LessonEditorHost` (`ScheduledLessonsProvider` + global create modal). Header/dashboard “Create lesson” calls `useOpenCreateLesson()` — opens the modal in place, no URL change and no redirect to `/lessons`.
- `src/proxy.ts` owns request-time public/protected route redirects before render; `AppShell` reflects the route shell variant from proxy/auth headers. Anonymous public pages skip the `web-session` roundtrip; protected navigations call same-origin `/api/auth/web-session`.
- No root `app/loading.tsx` — a global segment loading boundary conflicted with persistent `AppShell` and client navigations (React Suspense cleanup warnings). Auth/shell selection is inlined in async root `app/layout.tsx` (reads proxy headers via `readRequestAuthState`); no extra layout `<Suspense>` wrapper.

### Navigation perf (dev)

1. Set `DEBUG_PROXY_TIMING=1` in `.env` and restart web dev server.
2. Click `/dashboard` → `/students` → `/lessons` in the app shell.
3. In the browser network tab for each RSC/document request, expect **one** response with `x-soenglish-proxy-ms` and a unique `x-soenglish-proxy-hit` (`/pathname@timestamp`). Two hits with the same pathname in one click → investigate matcher/prefetch.
4. Open `/login` logged out: server log should show `skip-session` (no `web-session` roundtrip).
5. Revisit `/dashboard` twice: second visit should reuse warm Zustand slices (no duplicate `scheduledLessons` GraphQL unless forced).
- Local CLI baseline (unauthenticated redirects): `/students` first hit ~0.20s then ~0.01-0.03s; `/students/[id]` ~0.007-0.02s. Use this only as transport baseline; authenticated browser nav includes RSC + client hydration.
- **Proxy session cache:** `fetchWebRequestSession` caches by access/refresh cookie fingerprint (`WEB_SESSION_CACHE_TTL_MS`, default 8s) so rapid navigations skip repeated `/api/auth/web-session` + Prisma reads. Use `DEBUG_PROXY_TIMING=1` to compare first vs second hop.
- **Route loading UI:** no `loading.tsx` on student detail (segment Suspense + client `AppShell` caused React cleanup warnings). Thin server `page.tsx` renders client `StudentDetailsPage.tsx`; in-page `StudentPageSkeleton` while list cache is cold.
- Chunk split sanity check (Turbopack dev): `.next/dev/static/chunks` now has separate student details chunks (page + sections + vocabulary tab + quiz tab) instead of a single static import chain.
- **Responsive shell:** mobile drawer nav (`MobileNavDrawer`), tablet collapsed sidebar rail, responsive main padding — see [[concepts/ui-design-system#Responsive layout]]
- Coarse role/scope route checks happen in `src/proxy.ts` — see [[concepts/auth-rbac]]
- `auth-context.tsx` — session from `GET /api/auth/me`
- `active-user.ts` — maps API user → numeric role for `canView` etc.

## API clients

| Client | File | Usage |
|--------|------|-------|
| REST | `lib/api.ts` | Auth, fetch with `credentials: 'include'` |
| GraphQL | `lib/graphql-client.ts` | Domain queries/mutations |
| Proxy | `next.config.mjs` | `/api/*` → backend for same-origin cookies |

## Dashboard (`/dashboard`)

`fetchDashboard(isStudent)` in `dashboard-store` loads in parallel (reuses warm Zustand slices when already fetched — no forced refetch on every visit):

| Block | Source | Student | Teacher / admin |
|-------|--------|---------|-----------------|
| Stat tiles | `dashboardSummary` | ✓ | ✓ |
| Hero banner | `lib/dashboard-hero.ts` — lesson today → vocab review → `/practice` | ✓ | lessons or practice CTA |
| Quick actions | Calendar, Practice, Vocabulary, Chat (+ Students / New lesson for staff) | ✓ | same |
| Coming up this week | `pickUpcomingWeekLessons` from scheduled lessons | ✓ | ✓ |
| Right column (staff) | Homework to review, My students, Lessons this month glance | — | ✓ |
| Stat tiles (staff) | Students count, lessons today, homework pending | — | ✓ |
| Subtitle | `learningStreak` + locale date | ✓ | date only |
| Today's lessons | `scheduledLessons` (today, max 4) | ✓ | ✓ |
| Review words | `studentVocabulary` (`new` / `repeated` / `mistakes_work`) | ✓ | hidden |
| Daily goals | [[concepts/daily-goals]] | ✓ | hidden |
| Word of the day | `wordOfDay` (deterministic pick from deck) | ✓ | hidden |
| Streak calendar | `learningStreak` (`activeDays` for current month) | ✓ | hidden |

No mock lessons/vocab on this page.

## State (Zustand)

`apps/web/src/stores/` — e.g. `dashboard-store`, `lessons-store`, `quizzes-store`, `vocabulary-store`, `students-store`, `notifications-store` (toasts), `ui-store` (theme/font size on `<html>`).

- `ui-store` persists appearance prefs in `localStorage` under `soenglish.ui`.
- `app/layout.tsx` injects a tiny pre-hydration script in `<head>` that reads `soenglish.ui` and sets `data-theme`, `data-font-size`, and `color-scheme` on `<html>` before React mounts, which removes the dark-theme flash on refresh.

Per `packages/frontend/ARCHITECTURE.md`: prefer server data; Zustand for ephemeral UI only — partially followed.

## Toasts (in-app notifications)

Ported from `materials/addax_assessment/.../features/notifications` (Redux → Zustand).

- `features/notifications/ToastViewport.tsx` — fixed top-right stack (max 5)
- `features/notifications/toast.ts` — `toast.success()`, `toast.error()`, etc.
- Mounted in `app/providers.tsx` (global)
- Variant colors use `--toast-*` tokens in `styles/tokens/_theme.scss` (light + `[data-theme='dark']`)

## Lesson content (modal + `/lessons/[lessonId]`)

- **Create:** `toCreateScheduledLessonBody` sends `lessonPlan` + content when non-empty; GraphQL `createScheduledLesson` and REST create apply `materials`/`homework`; `persistCreate` may follow with `PATCH` when content was present.
- **Update:** `toUpdateScheduledLessonBody({ includeLessonContent: true })` — materials, homework, student response (schedule-only updates use `includeLessonContent: false`).
- **Modal → list:** `syncLessonFormChange` (`lesson-form-sync.ts`) upserts the open lesson into `ScheduledLessonsProvider` on every content-tab edit so `/lessons/[id]` sees materials before the next explicit save.
- `mergeLessonDisplayNames` keeps the saved candidate content over empty API echoes.
- `ScheduledLessonsProvider` merges refetched lessons into local state (not one-time replace only).
- Lesson page draft init runs once per `lesson.id` so a successful save is not overwritten by a stale `lesson` reference.

## Practice session tracking

Prisma `PracticeSession` (kind, source, `startedAt`/`endedAt`, `durationSec`). GraphQL: `recordPracticeSession`, `practiceWeekSummary` (last 7 days UTC).

Vocabulary **Play**, quiz runs, and `/practice/speaking` use `usePracticeSessionTracker` → `practice-store.recordSession` (min 30s client-side). `/practice` **Practice this week** loads `practiceWeekSummary` from API.

Profile **Notifications** tab = five email preference toggles persisted via `myProfile` / `updateMyProfile` (`notificationPrefs`). Debounced auto-save when logged in; mock prefs only without auth. See [[concepts/profile-notifications]] — not the toast UI.

Profile **Account** tab — **Session** row: **Log out** calls `POST /api/auth/logout` via `useAuth().logout()` and redirects to `/login` (shown only when `auth.user` is set).

## Feature modules

- `features/lesson-modal/` — lesson editor modal
- `features/calendar/` — calendar DnD, adapters

## Role gating

- Sidebar hides `/students`, `/admin`, `/system` (super-admin only)
- Pages use `canView` / `canSchedule` from `mocks/roles.ts` (re-exported `lib/roles.ts`)

## Students list → profile (API-backed)

- **List:** `students-store` → GraphQL `students` → `StudentSummaryCard` links to `/students/{id}` with backend **UUID** (`row.id`).
- **Detail:** `apps/web/src/app/students/[studentId]/page.tsx` resolves the student via `lib/student-profile.ts` (`resolveStudentProfile`) from the same store — **not** `getProfileByUserId` mock lookup.
- **Perf on details mount:** `useStudentLiveStats` avoids forced refetch when warm cache exists (`fetchScheduledLessons(false)` / `fetchCards(studentId, false)`); duplicate lessons fetch was removed from page-level `useEffect`.
- **Code-splitting:** student tabs are loaded via `next/dynamic` in `page.tsx`; route fallback in `app/students/[studentId]/loading.tsx` (hero + tab bar only).
- **Tab switch UX:** student profile sets `keepMountedTabs={false}`; heavy tabs lazy-load on first visit (`visitedTabs`) via `createLazyPanel` (`lib/client/lazy-panel.ts`) — `import()` + `useEffect`, not `next/dynamic` / `React.lazy`, so leaving the student page does not trip Suspense cleanup on navigations like `/practice`. Loading UI: `TabPanelLoading`. `/profile` keeps `keepMountedTabs` default `true` (sync panels).
- **Prefetch:** `StudentSummaryCard` explicitly sets `prefetch` on details links.
- Legacy numeric mock URLs (`/students/3`) still work if that id exists in mock seed.
- **Vocabulary tab** passes `resolved.backendId` (UUID) to `StudentVocabularyTab` / GraphQL `studentVocabulary`.
- Profile form save still mutates mock user row when present; **native language** is a field in `StudentProfileTab` (`tabCard` grid), saved with **Save student data** via `updateStudentLanguages`.
- **Profile → Statistics:** `StatisticsDashboard` with **live** lessons/cards (`buildLiveStatisticsDashboard`) — KPI grid + Recharts (lessons trend, vocabulary added vs known bar chart from `firstSeenAt`/`knownAt`, status pie, goals). Not mock-only tiles.
- **Student detail → Statistics:** same `StatisticsDashboard` fed by `useStudentLiveStats`; hero chat → `/chat?peer={studentUserId}`; vocabulary add on student tab.
- **Student hero stats:** Words / Lessons / Streak come from live `achievementStats`; chat icon sits inline next to the name (`ProfileViewShell` `heroActions`), not absolutely over the avatar.
- **Achievements tab:** `/profile` and `/students/[studentId]` both use live `achievementStats` instead of mock-only unlock ids; see [[concepts/achievements]].

## Header search

- `components/layout/HeaderSearch.tsx` — desktop header (`Header` mid column); queries lessons, students (staff), vocabulary cards from Zustand stores.
- Search input uses a fixed DOM id (`header-search-input`) instead of relying on generated `useId()` output, which avoids SSR/client hydration mismatches inside the persistent app shell header.
- Dropdown navigates on click; Enter opens first match or `/vocabulary?q=…`.
- Vocabulary page reads `?q=` into the list search field.

## Responsive SSR note

- `useBreakpoint()` is hydration-safe: SSR and the first client render both start from the same desktop fallback, then the hook applies the real viewport width after mount.
- This avoids React hydration mismatches in responsive client components like `Header`, `Sidebar`, and `/chat`, where the rendered tree changes across mobile/tablet/desktop branches.

## Related

- [[concepts/ui-design-system]]
- [[concepts/roles-matrix]]
- [[concepts/graphql-api]]
