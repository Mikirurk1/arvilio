---
tags: [entity, materials, annotations]
updated: 2026-05-30
---

# Library file user annotation

Per-user vector annotations on a library PDF file attachment. Annotations follow the **user + file**, not the lesson — the same book opened in another lesson shows the same notes.

## Model

| Field | Type | Notes |
|-------|------|-------|
| `id` | cuid | Primary key |
| `userId` | FK → User | Owner of the annotation layer |
| `fileAttachmentId` | FK → LibraryFileAttachment | PDF being annotated |
| `contextUserId` | string | `""` = own book; student id when staff overlay on that student's book |
| `document` | JSON | `{ version: 1, pages: { "0": Annotation[] } }` — normalized 0–1 coords |
| `fileRevision` | string? | `sizeBytes:storageKey` fingerprint when saved |
| `updatedAt` | DateTime | Last save |

Unique: `(userId, fileAttachmentId, contextUserId)`.

Prisma: `LibraryFileUserAnnotation` in `schema.prisma`.

## Annotation types (v1)

`pen`, `rect`, `ellipse`, `arrow`, `text` — see `@pkg/types` `material-annotations.ts`.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/materials/annotations/:fileAttachmentId?subjectUserId=` | Load base + staff overlay |
| PUT | `/api/materials/annotations/:fileAttachmentId` | Upsert own layer; body/query `contextUserId` for staff overlay |
| DELETE | `/api/materials/annotations/:fileAttachmentId?contextUserId=` | Clear staff overlay on student's book |

Access:

- File download rule via `MaterialsAccessService.assertCanDownloadMaterial`
- Staff viewing student layer: `assertCanViewStudent` (teacher only assigned students); **read-only**

Only PDF assets with role `student_book`, `teacher_book`, or `workbook`.

## Web

- Viewer: `/materials/view/[attachmentId]` — pdf.js + Konva overlay
- Route policy: `/materials/view` allowed for all school roles (before staff-only `/materials`)
- Entry: `MaterialAssetLink` from lesson chips and library cards for book PDFs
- Staff lesson context: `?subjectUserId=` on student-facing books for review mode

## Related

- [[entities/library-material]]
- [[concepts/materials-library]]
