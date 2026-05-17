---
tags: [concept, vocabulary]
updated: 2026-05-16
---

# Vocabulary

Word learning: global dictionary + per-student cards + spaced repetition.

## Backend

- **Module:** `module-vocabulary`
- **DictionaryService** — primary enrichment via `DICTIONARY_API_URL` (dictionaryapi.dev)
- **DatamuseProvider** — synonyms/antonyms/definition fallback
- **WordEnrichmentService** — dictionary EN (full homograph array) + MyMemory → one `WordDefinition` row per `(language, partOfSpeech)`; modal groups native glosses by POS
- **TranslationService** — `TRANSLATION_API_URL`, optional `TRANSLATION_API_EMAIL`
- **VocabularyService** — overview, list/create/update cards, `lookupWord`, `getWordDetails`
- **Word add rules** — English lemma only (`assertEnglishLemma`); new words require dictionary hit (`foundInDictionary` / `dictionaryFound` on enrich); Datamuse alone does not allow add

## Data model

- [[entities/word]] — canonical definition
- [[entities/student-word-card]] — per-student status (NEW → LEARNED)
- [[entities/review-queue]] — SRS scheduling

## GraphQL

- `vocabularyOverview`, `lookupWord`, `wordsByIds`, `wordDetails`, `globalWords`, `studentVocabulary`, `languages`
- `addStudentWordCard`, `updateCardStatus` with optional `studentId`

## Web

- `/vocabulary` — main vocabulary UI; **Play** mode shows English word → multiple-choice **translation** (`lemmaText` via `pickWordTranslation`, falls back to definition gloss); needs ≥2 distinct answers in pool (2–4 options per question)
- `/practice/vocabulary` — practice mode
- Store: `vocabulary-store.ts` (if present) / GraphQL operations

## Known gaps

Staff acting on another student's cards without authorization check — [[concepts/auth-rbac#Known gaps]].

## Related

- [[entities/word]]
- [[entities/student-word-card]]
- [[concepts/quizzes-flashcards]] (quiz source VOCABULARY)
