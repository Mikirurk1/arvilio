---
tags: [entity, materials, lessons]
updated: 2026-05-30
---

# Entity: LibraryMaterial

School-wide reusable resource in the **materials library** (boards, presentations, books, other). Distinct from [[entities/lesson-material]], which is an attachment row on a single [[entities/scheduled-lesson]].

## Fields

- `kind`: `BOARD | PRESENTATION | BOOK | OTHER`
- `title`, `description?`, `tags[]`, `level?` (CEFR code from shared `PROFICIENCY_LEVEL` catalog — same A1–C2 as student `proficiencyLevel`), `publisher?`
- `schoolId?` — tenant seam (nullable today, single-school)
- `createdById` → [[entities/user]]
- `assets[]` → `LibraryMaterialAsset` (role, URL or file)

## Asset roles

`STUDENT_BOOK`, `TEACHER_BOOK`, `WORKBOOK`, `AUDIO`, `VIDEO`, `SLIDES`, `LINK`, `OTHER` — flexible; books can have many assets without schema changes.

## Files

- Binaries: `LibraryFileAttachment` on disk — `{MATERIAL_UPLOAD_DIR}/library/{materialId}/{attachmentId}{ext}` (see [[concepts/materials-library]])
- REST: `POST/GET /api/materials/files/:materialId|:attachmentId`

## GraphQL

- `libraryMaterials`, `libraryMaterial`, `createLibraryMaterial`, `updateLibraryMaterial`, `deleteLibraryMaterial`, `upsertLibraryMaterialAssets`
- Module: `packages/backend/modules/module-materials`

## Lesson link

`LessonMaterial.libraryMaterialId` references a library item. Lesson UI attaches by reference (no file copy). Students see linked assets on the lesson page; staff manage library at `/materials`.

## Related

- [[concepts/materials-library]]
- [[entities/lesson-material]]
- [[entities/scheduled-lesson]]
