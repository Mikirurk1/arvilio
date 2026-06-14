---
tags: [concept, vocabulary]
updated: 2026-05-29
---

# Vocabulary

Word learning: global dictionary + per-student cards + spaced repetition.

## Backend

- **Module:** `module-vocabulary`
- **DictionaryService** — System → Word dictionary **Dictionary source** (primary) + fallback chain: `dictionary_api_dev` → `reverso` → `wiktionary` (Wiktionary last unless selected). On miss, tries next provider sequentially; `source` / provenance record the provider that actually returned the entry.
- **DatamuseProvider** — synonyms/antonyms/definition fallback
- **WordEnrichmentService** — dictionary EN (full homograph array) + translation chain → one `WordDefinition` row per `(language, partOfSpeech)`; modal groups native glosses by POS. Persists `sourcePayload.enrichment` (`dictionaryProvider`, `translationProviders[]`) for staff provenance in the word-details modal.
- **TranslationService** — System → Word dictionary → **Translation source**: primary + fallback chain (`deepl` → `google` → `microsoft` → `reverso` → `mymemory` → `libretranslate` → `gtx`). Paid APIs (DeepL, Google Cloud, Microsoft) need keys in env or System UI; skip when unconfigured. Endpoints in env (`DEEPL_API_URL`, `GOOGLE_TRANSLATE_API_URL`, `AZURE_TRANSLATOR_URL`, etc.).
- **VocabularyService** — overview, list/create/update cards, `lookupWord`, `getWordDetails`
- **Word add rules** — English single word or short phrase (≤8 tokens, `assertEnglishLemma`); input whitespace is collapsed. New entries require dictionary hit (`foundInDictionary` / `dictionaryFound` on enrich). **Exception:** multi-word phrases may also qualify when Datamuse returns a usable gloss (single-word adds still require the dictionary API).

## Data model

- [[entities/word]] — canonical definition
- [[entities/student-word-card]] — per-student status (NEW → LEARNED)
- [[entities/review-queue]] — SRS scheduling

## GraphQL

- `vocabularyOverview`, `lookupWord`, `wordsByIds`, `wordDetails`, `globalWords`, `studentVocabulary`, `languages`
- `addStudentWordCard`, `updateCardStatus` with optional `studentId`

## Web

- `/vocabulary` — main vocabulary UI; shared **filters** (search, lesson select, part-of-speech chips) on **List** and **Flashcards**. POS chips from `collectWordPartsOfSpeech` (word row + all `definitions[].partOfSpeech`). When a POS chip is active, card glosses use `resolveVocabularyGlossesForPosFilter` → `pickWordTranslation` / `pickWordDefinition` scoped to that POS (homographs like *kind* show noun vs adjective translation + definition on list cards and flashcards).
- **Flashcards** mode: taller card (~400px); front — word, phonetic, audio, POS badges, **irregular verb forms** (`verbForms`: Past / Past participle from curated list in `@pkg/types` / `irregular-verbs.ts` when the lemma is a verb), topic category, lesson label, origin; back — per-POS native glosses (`pickNativeDefinitions`), EN definition, example, synonyms; toolbar status + word-details (ℹ). After flip: **staff** Still learning / Repeated / Mistakes work / Learned; **students** Still learning / Got it only. **Start over** staff-only. List cards show the same `verbForms` line via `VerbFormsLine`.
- **Play** setup is a single start card (instructions, word-source controls, full-width **Play** at bottom); quiz shows English word → multiple-choice **translation** (`lemmaText` via `pickWordTranslation`, falls back to definition gloss); needs ≥2 distinct answers in pool (2–4 options per question)
- `/practice/vocabulary` — practice mode
- **`/practice/irregular-verbs`** — standalone irregular verb table + Three Forms Drill (global catalog, not student cards); tiers `common` / `extended` on `IrregularVerbEntry` — see [[concepts/web-app]]
- **Word details modal** (`WordDetailsModal`) — staff (teacher/admin/super_admin) see footer **Data sources**: dictionary provider, supplemental (e.g. Datamuse), translation provider(s) from `sourcePayload.enrichment`; legacy words without stored translation show a short “not stored” note until next enrich/backfill.
- Store: `vocabulary-store.ts` (if present) / GraphQL operations
- **System → Word dictionary** — per-provider **setup instructions** (official doc links, pricing, env vars, steps) in `WordDictionaryPanel` via `word-dictionary-setup-guides.ts` + `ProviderSetupGuide`.
- **LibreTranslate (dev):** `npm run docker:libretranslate` → `infra/docker/docker-compose.yml` service on host **5001** (macOS AirPlay uses 5000). Set `LIBRETRANSLATE_URL=http://127.0.0.1:5001`; restart API. Docs: [LibreTranslate installation](https://docs.libretranslate.com/guides/installation/).

## Known gaps

Staff acting on another student's cards without authorization check — [[concepts/auth-rbac#Known gaps]].

## Related

- [[entities/word]]
- [[entities/student-word-card]]
- [[concepts/quizzes-flashcards]] (quiz source VOCABULARY)
