---
tags: [entity, lessons]
updated: 2026-05-16
---

# Entity: ScheduledLesson

1:1 live lesson between a teacher and student (not the catalog `Lesson` model).

## Key fields

| Field | Notes |
|-------|-------|
| `teacherId`, `studentId` | Required participants |
| `date`, `startTime`, `endTime`, `timezone` | Wall-clock scheduling |
| `status` | PLANNED, COMPLETED, CANCELLED |
| `recurrence`, `weeklyDays`, `seriesId` | Recurring series |
| `googleMeetUrl`, `googleCalendarEventId` | Meet integration |
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
- Meet join: `LessonMeetButton.tsx` matches lesson by title → `googleMeetUrl`

## Related

- [[concepts/lessons-calendar]]
- [[entities/lesson]] (catalog — different model)
