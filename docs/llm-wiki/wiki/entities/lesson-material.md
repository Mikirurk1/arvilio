---
tags: [entity, lessons]
updated: 2026-05-16
---

# Entity: LessonMaterial

Attachments and content blocks on a [[entities/scheduled-lesson]].

## Fields

- `kind`: TEXT, PHOTO, TEST, FILE, PRESENTATION
- `text`, `files[]`, `order`

## Code

- Prisma: `LessonMaterial` model
- Managed via lessons service / lesson modal UI

## Related

- [[entities/scheduled-lesson]]
