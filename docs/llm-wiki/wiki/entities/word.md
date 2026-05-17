---
tags: [entity, vocabulary]
updated: 2026-05-16
---

# Entity: Word

Global dictionary entry shared across students.

## Fields

- `text`, `normalizedText` (unique), `definition` (denormalized EN), `example`, `phonetic`, `partOfSpeech`, `category`
- `audioUrl` (normalized to `https:` when provider returns protocol-relative URLs), `origin` (etymology line)
- `synonyms`, `antonyms`
- `source` (e.g. `dictionaryapi.dev`), `sourcePayload` (Json audit — full API entry)

## WordDefinition

Per-language rows: `wordId`, `languageId`, `text` (unique per word+language). Filled on enrich via `TranslationService` (MyMemory) for active catalog languages except EN (from dictionary API).

## Relations

- `definitions` → `WordDefinition` + [[entities/language]]
- `cards` → [[entities/student-word-card]]
- Used in quiz questions

## UI

- Cards pick definition: viewer `nativeLanguageId` → EN → first available (`pickWordDefinition`)
- **All information** modal: `wordDetails` / `GET /vocabulary/words/:id/details` returns `sourcePayloadJson` from DB (no re-fetch)

## Enrichment flow

1. `lookupWord(text)` — returns DB row if `normalizedText` exists, else preview from external APIs (no write).
2. `findOrCreateWord` / `addStudentWordCard` — persists via `WordEnrichmentService` (dictionaryapi.dev + Datamuse). Dictionary parsing prefers noun/verb senses over exclamation; phonetic aligns with the phonetics row that has audio.

## Code

- `VocabularyService`, `WordEnrichmentService`, `DictionaryService`, `DatamuseProvider` in `module-vocabulary`
- GraphQL: `lookupWord`, `wordsByIds`, `globalWords`
- REST: `GET /api/vocabulary/words/lookup?text=`

## Related

- [[concepts/vocabulary]]
