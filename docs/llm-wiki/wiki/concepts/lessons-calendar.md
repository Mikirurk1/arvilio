---
tags: [concept, lessons]
updated: 2026-05-16
---

# Lessons & calendar

Scheduling and delivery of 1:1 [[entities/scheduled-lesson]] sessions.

## Backend

- **Module:** `packages/backend/modules/module-lessons`
- **Service:** `LessonsService` — CRUD, list for user, membership checks
- **Google:** `GoogleCalendarService` — OAuth tokens from [[entities/google-calendar-connection]], creates events + Meet URLs

## GraphQL

See [[concepts/graphql-api]] — `scheduledLessons`, mutations for create/update/delete.

## Web

| Area | Path |
|------|------|
| Calendar page | `apps/web/src/app/calendar/page.tsx` — drag/drop, role-gated edit via `canSchedule` |
| Lessons list | `apps/web/src/app/lessons/` |
| Lesson detail | `apps/web/src/app/lessons/[lessonId]/` |
| Lesson modal | `apps/web/src/features/lesson-modal/` |
| Calendar feature | `apps/web/src/features/calendar/` — adapters, DnD, rules |

### Frontend id mapping (`scheduledLessonsBackendAdapter.ts`)

- Backend lesson/student/teacher UUIDs get in-memory numeric aliases for legacy UI.
- **Separate counters:** lesson ids (`1_000_001+`) vs party ids (`2_000_001+`) so teacher/student UUIDs do not steal lesson numeric ids.
- List keys and routes prefer `backendId` (`getLessonRouteId`); `ScheduledLessonsProvider` dedupes/merges by `scheduledLessonIdentity` to avoid duplicate React keys when GraphQL cache updates race with local upserts.

## Google Meet

On **lesson create**, `LessonsService.create` calls `GoogleCalendarService.createMeetEvent` (unless `createMeetLink: false`), saves `googleCalendarEventId` / `googleMeetUrl`, and retries fetching the Meet URL when Google returns the event before the link is ready.

Requirements: teacher `GoogleCalendarConnection` (connect via **Profile → Connections → Connect Google** or Google sign-in at login), `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` on the API. **Lesson create fails** with `GOOGLE_CALENDAR_REQUIRED_MESSAGE` if the assigned teacher has no connection; the DB row is not kept.

`LessonMeetButton` only shows **Join Google Meet** when `googleMeetUrl` is present; otherwise a disabled “Meet pending” state (no manual create in UI).

Recovery API (rare): `ensureScheduledLessonMeet` GraphQL / `POST /api/lessons/scheduled/meet`.

## Homework flow

On `ScheduledLesson`: homework text/files, student response, `studentResponseStatus`, teacher feedback. UI uses `canReviewHomework` from roles matrix.

## Open questions

- Title-based Meet matching is fragile if titles duplicate
- Lesson create RBAC — [[concepts/auth-rbac#Known gaps]]

## Related

- [[entities/scheduled-lesson]]
- [[entities/lesson-material]]
