---
tags: [entity, i18n]
updated: 2026-05-16
---

# Entity: Language

Catalog of supported UI / definition languages.

## Fields

| Field | Notes |
|-------|--------|
| `id` | cuid |
| `code` | ISO 639-1 (`en`, `uk`, …), unique |
| `name` | Display name |
| `isActive` | Included in translation enrichment |

## Relations

- `User.nativeLanguage` — viewer's native language for picking card definitions
- `StudentLearningLanguage` — languages a student is learning (admin-managed only)
- `WordDefinition` — per-language definition text for a [[entities/word]]

## API

- REST: `GET /api/languages` (authenticated)
- GraphQL: `languages` query
- Admin: `learningLanguageIds` on create user + `updateStudentLanguages` / `PATCH /api/admin/students/:id`

## Seed

`npm run prisma:seed:languages` — en, uk, ru, pl, de, fr.

## Related

- [[entities/user]]
- [[entities/word]]
- [[concepts/vocabulary]]
