---
tags: [entity, lessons]
updated: 2026-06-08
---

# Entity: ScheduledLesson

Live lesson between a teacher and one or more students (not the catalog `Lesson` model).

## Key fields

| Field | Notes |
|-------|-------|
| `kind` | `INDIVIDUAL` (default) or `GROUP` |
| `teacherId`, `studentId` | Teacher + **primary** student (first participant for groups) |
| `participants` | Junction `ScheduledLessonParticipant` — all students, per-participant homework |
| `groupBillingMode`, `groupPriceMinor`, `groupSplitMode`, `groupPayerUserId` | Group billing — see [[concepts/group-lessons]] |
| `date`, `startTime`, `endTime`, `timezone` | Wall-clock scheduling |
| `status` | PLANNED, COMPLETED, CANCELLED |
| `recurrence`, `weeklyDays`, `seriesId` | Recurring series |
| `videoProvider`, `videoMeetingUrl`, `videoMeetingExternalId`, `videoMeetingRawId`, `videoMeetingStartedAt`, `videoMeetingEndedAt` | Generalized video meeting fields — see [[concepts/video-meeting-providers]] |
| `googleMeetUrl`, `googleCalendarEventId`, `googleConferenceId`, `meetCreatedAt` | **Legacy** Google Meet fields. Kept for backward compat — new code reads `videoMeetingUrl ?? googleMeetUrl`. Mirrored on Google provider writes. |
| Homework fields | `homeworkText`, `studentResponseStatus`, `teacherHomeworkFeedback`, etc. |

## Relations

- `materials` → [[entities/lesson-material]]
- `linkedWords` → [[entities/student-word-card]]
- `quizzes` → [[entities/quiz]]

## API

- GraphQL: `scheduledLessons`, `scheduledLesson`, `createScheduledLesson`, `updateScheduledLesson`, `deleteScheduledLesson`
- REST: `module-lessons` `be-lessons.ts`
- Membership enforced on single-lesson read; create lacks role checks — [[concepts/auth-rbac#Known gaps]]

## Web

- Calendar, lesson modal — [[concepts/lessons-calendar]]
- Meeting join — `LessonVideoButton` (provider-aware label) for Google/Zoom; `LessonVideoEmbed` (iframe) for Jitsi. Reads `videoMeetingUrl ?? googleMeetUrl`.

## Related

- [[concepts/group-lessons]]
- [[concepts/lessons-calendar]]
- [[concepts/video-meeting-providers]]
- [[entities/zoom-connection]]
- [[entities/google-calendar-connection]]
- [[entities/lesson]] (catalog — different model)
