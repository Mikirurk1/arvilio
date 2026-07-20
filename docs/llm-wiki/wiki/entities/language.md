---
tags: [entity, i18n]
updated: 2026-07-11
---

# Entity: Language

Catalog of **learning / definition languages** (subjects and gloss languages) — **not** the UI/marketing locale allowlist.

| Axis | Where |
|------|--------|
| UI locale (`uk`, `en`, …) | `@pkg/types` `SUPPORTED_LOCALES` — [[concepts/payload-cms]], marketing plan |
| Learning language (EN, DE, …) | This entity + `StudentLearningLanguage` |

Campus/Connect must not assume “product = English only.” The catalog is already multi-language (`isActive` gates enrichment).

## Fields

| Field | Notes |
|-------|--------|
| `id` | cuid |
| `code` | ISO 639-1 (`en`, `uk`, `de`, …), unique |
| `name` | Display name |
| `isActive` | Included in translation enrichment / pickers |

## Relations

- `User.nativeLanguage` — viewer’s native language for picking card definitions (gloss language)
- `StudentLearningLanguage` — languages a student is **learning** (admin-managed)
- `WordDefinition` — per-language definition text for a [[entities/word]]

## API

- REST: `GET /api/languages` (authenticated)
- GraphQL: `languages` query
- Admin: `learningLanguageIds` on create user + `updateStudentLanguages` / `PATCH /api/admin/students/:id`

## Seed

`npm run prisma:seed:languages` — en, uk, ru, pl, de, fr (learning/definition catalog capacity).

## Related

- [[entities/user]] — `locale` (UI) vs `nativeLanguageId` (catalog)
- [[entities/word]]
- [[concepts/vocabulary]]
- [`docs/arvilio-marketing-site-payload-plan.md`](../../../arvilio-marketing-site-payload-plan.md) §6.1
