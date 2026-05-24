---
tags: [entity, lessons]
updated: 2026-05-16
---

# Entity: LessonMaterial

Attachments and content blocks on a [[entities/scheduled-lesson]].

## Fields

- `kind`: TEXT, PHOTO, TEST, FILE, PRESENTATION
- `text`, `files[]` (refs: `att:{attachmentId}` or legacy bare filename), `order`
- API also returns `fileLinks[]` (`ref`, `fileName`, `downloadPath`) for downloads

## Code

- Prisma: `LessonMaterial` model; binaries in `LessonFileAttachment` (disk under `LESSON_UPLOAD_DIR` or `data/lesson-uploads`)
- REST: `POST /api/lessons/files/:lessonId`, `GET /api/lessons/files/:attachmentId`
- Managed via lessons service / lesson modal UI; web uploads pending files in `useScheduledLessonPersistence` before content save
- After save, UI must keep API `fileLinks` (not local-only filenames): `mergeLessonDisplayNames` keeps content from the server response

## Related

- [[entities/scheduled-lesson]]
