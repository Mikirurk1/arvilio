---
tags: [entity, materials, captions, backend]
updated: 2026-05-30
---

# LibraryFileCaptionTrack

WebVTT subtitle track for a library file attachment (audio or video). Generated asynchronously after upload via OpenAI Whisper STT; optional translated tracks via `TranslationService`.

## Schema (Prisma)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `fileAttachmentId` | FK → `LibraryFileAttachment` | Parent media file |
| `language` | string | BCP-47-ish code (`en`, `uk`, `und` for auto-detect placeholder) |
| `kind` | `SOURCE` \| `TRANSLATION` | STT original vs translated |
| `sourceTrackId` | UUID? | For translations, links to source track |
| `status` | `PENDING` \| `PROCESSING` \| `READY` \| `FAILED` | Job state |
| `vttStorageKey` | string? | On-disk WebVTT path under upload dir |
| `errorMessage` | string? | Last failure reason |

Unique: `(fileAttachmentId, language, kind)`.

## Storage

VTT files: `{MATERIAL_UPLOAD_DIR}/library/{materialId}/captions/{attachmentId}/{language}.{source|translation}.vtt`

## API

- `GET /api/materials/files/:attachmentId/captions` — list tracks (auth + materials access)
- `GET /api/materials/files/:attachmentId/captions/:language/vtt` — WebVTT stream
- `POST /api/materials/files/:attachmentId/captions/generate` — staff manual re-trigger

## Config

Platform integration `mediaCaptions` (System → Word dictionary → Media captions): enabled, STT provider (`local_whisper` | `openai_whisper` | `disabled`), source language, target languages. Local: `MATERIAL_WHISPER_BIN`, `MATERIAL_WHISPER_MODEL`. Cloud: OpenAI Whisper API key.

See [[concepts/materials-library]].
