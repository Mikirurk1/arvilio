---
tags: [concept, lessons]
updated: 2026-05-20
---

# Lessons & calendar

Scheduling and delivery of 1:1 [[entities/scheduled-lesson]] sessions.

## Backend

- **Module:** `packages/backend/modules/lessons`
- **Service:** `LessonsService` — CRUD, list for user, membership checks
- **Google:** `GoogleCalendarService` — OAuth tokens from [[entities/google-calendar-connection]], creates events + Meet URLs

## GraphQL

See [[concepts/graphql-api]] — `scheduledLessons` (full list, calendar), `scheduledLessonsPage(cursor, limit)` (paginated, `/lessons` list), mutations for create/update/delete. `CreateScheduledLessonInput.createMeetLink` (optional) maps to `CreateScheduledLessonRequestDto.createMeetLink` — set `false` in tests to skip Google Calendar.

## Web

| Area | Path |
|------|------|
| Calendar page | `apps/web/src/app/calendar/page.tsx` — drag/drop, role-gated edit via `canSchedule`; grid times use **viewer's profile timezone** (`useViewerTimezone`); lesson chips use each student's **`User.displayColor`** (`#RRGGBB`, from `students` query); students **Request lesson** → `/chat?peer={teacherId}` (`resolveStudentTeacherChatPeerId` in `lib/student-teacher-chat.ts`, `auth.user.teacherId` or teacher from a lesson) |
| Student profile (staff) | `apps/web/src/app/students/[studentId]/` — **User color** picker (teacher / admin / super-admin only); persisted via `updateStudentLanguages` → `displayColor`; random color on admin user create |
| Lessons list | `apps/web/src/app/lessons/` — infinite scroll via `fetchLessonsPage` / `loadMoreLessonsPage` (25 per page, **newest first**); default status filter **All**; falls back to full `scheduledLessons` if page slice is empty |
| Lesson detail | `apps/web/src/app/lessons/[lessonId]/` — short **description** (sidebar); hidden for students when empty; teacher/student names from GraphQL `teacherName` / `studentName`; **students** can add lesson vocabulary via `LessonVocabularyAddPanel` (`studentBackendId` = session user id, `lessonId` on card) |
| Lesson modal | `apps/web/src/features/lesson-modal/` — materials/homework files upload to `POST /api/lessons/files/:lessonId`; stored refs `att:{id}`; download `GET /api/lessons/files/:attachmentId`; UI uses `fileLinks` + `openLessonAttachment` |
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

## Recurrence (create)

Backend stores `recurrence`, `weeklyDays`, `seriesId` on each row but **does not** expand a series server-side.

On create, the web client materializes occurrences via `lib/lesson-recurrence.ts` + `features/lesson-modal/recurring-lesson-create.ts` (calendar page + `useLessonEditor`):

| Pattern | Horizon |
|---------|---------|
| daily | 30 days from start date |
| weekly | 12 weeks; `weeklyDays` chips (1=Mon…7=Sun); if none selected, uses start date weekday |
| monthly | 6 months (clamped day-of-month) |

All occurrences share one `seriesId`; each gets its own `createScheduledLesson` (+ Google Calendar event when enabled). Conflicts and past slots are skipped.

### Editing a series

- Lessons with the same `seriesId` are linked. While linked, modal save updates **start/end time, duration, timezone, title, status** on every series member (each keeps its own **date**). **Lesson plan, materials, homework, vocabulary** apply only to the lesson being edited (`applyLessonContentFromCandidate` in `lib/lesson-series.ts`).
- **Unlink** (Unlink icon in modal header, staff with `canManage`): clears `seriesId` on this lesson only; `toUpdateScheduledLessonBody` sends `seriesId: null` so the API clears the column (omitted `undefined` would not update).
- **Delete series** (Repeat icon, danger style): deletes only **planned** lessons with the same `seriesId` (`getPlannedLessonsInSeries` / `deleteScheduledLessonSeries`); completed and cancelled stay.
- **Stacking:** lesson modal portals to `document.body` (`--z-modal` 2200). Confirm dialogs and calendar inline confirms use `BodyPortal` / `WhenPortaled` on `document.body` at `--z-modal-confirm` (2400). Toasts use `BodyPortal` at `--z-toast` (10100). Tokens: `styles/tokens/_layout.scss`; helper `components/ui/BodyPortal.tsx`.
- Calendar: linked lessons show a **Repeat** icon. Drag to **another day** → confirm detach from recurrence, then move only that lesson. Resize or same-day time change → confirm updating **all** lessons in the series. Conflict popup lists blockers (`findScheduleConflictsForUpdates`).
- **Recurrence** on create is allowed only when the selected student has **fixed schedule** (`User.scheduleType` / profile Schedule type).

### Timezones (web)

- **Viewer zone:** `useViewerTimezone()` reads `auth.user.timezone` (IANA); `useActiveUser().timezoneId` is derived for legacy form state.
- **Calendar / dashboard week list:** lesson instants converted with `lessonStartTimeInZone` / `lessonDateKeyInZone` into the viewer zone.
- **Lesson modal + lesson detail:** `LessonPartyScheduleTimes` — **student** sees primary **Your time** + muted **Teacher** line; **staff** see primary **Lesson time** (teacher/lesson zone) + muted **Student** line. Party zones from `students` / `assignableTeachers` GraphQL `timezone` fields.
- **Stored lesson wall clock** remains in the lesson's `timezone` column (typically teacher zone at create); edit fields still use that wall clock for staff.

## Open questions

- Title-based Meet matching is fragile if titles duplicate
- Lesson create RBAC — [[concepts/auth-rbac#Known gaps]]

## Related

- [[entities/scheduled-lesson]]
- [[entities/lesson-material]]
