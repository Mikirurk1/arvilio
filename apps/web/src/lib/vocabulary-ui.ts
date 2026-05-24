import type {
  StudentWordCardDto,
  VerbFormsDto,
  VocabularyWordStatusName,
  WordCardDto,
} from '@pkg/types';
import { resolveVerbForms } from '@pkg/types';
import { pickWordDefinition, pickWordTranslation } from './word-definitions';
import { stripHtml } from './strip-html';

const POS_SORT_ORDER: Record<string, number> = {
  noun: 0,
  verb: 1,
  adjective: 2,
  adverb: 3,
};

/** Unique parts of speech from the word row and per-gloss `definitions`. */
export function collectWordPartsOfSpeech(
  word: Pick<WordCardDto, 'partOfSpeech' | 'definitions'>,
): string[] {
  const seen = new Map<string, string>();
  const add = (pos?: string | null) => {
    const trimmed = pos?.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  };
  add(word.partOfSpeech);
  for (const row of word.definitions ?? []) add(row.partOfSpeech);
  return [...seen.values()].sort(
    (a, b) =>
      (POS_SORT_ORDER[a.toLowerCase()] ?? 50) -
        (POS_SORT_ORDER[b.toLowerCase()] ?? 50) ||
      a.localeCompare(b),
  );
}

export function formatPartsOfSpeech(parts: string[]): string {
  return parts.length > 0 ? parts.join(' · ') : '—';
}

export function wordMatchesPosFilter(
  partsOfSpeech: string[],
  filter: string,
): boolean {
  if (filter === 'All') return true;
  const key = filter.toLowerCase();
  return partsOfSpeech.some((pos) => pos.toLowerCase() === key);
}

export type VocabularyPosScopedGloss = {
  translation: string;
  definition: string;
  /** Display label for the active sense (all POS joined when filter is All). */
  posLabel: string;
  activePos: string | null;
};

/** Glosses shown on cards — scoped to the active part-of-speech filter when set. */
export function resolveVocabularyGlossesForPosFilter(
  display: VocabularyDisplayWord,
  posFilter: string,
  nativeLanguageId?: string | null,
  englishLanguageId?: string | null,
  fallbackDefinition?: string,
): VocabularyPosScopedGloss {
  if (posFilter === 'All') {
    return {
      translation: display.translation,
      definition: display.definition,
      posLabel: display.pos,
      activePos: null,
    };
  }

  const fallback = fallbackDefinition ?? display.definition;
  const translation =
    stripHtml(
      pickWordTranslation(
        display.definitions,
        nativeLanguageId,
        englishLanguageId,
        posFilter,
      ),
    ) ||
    stripHtml(
      pickWordDefinition(
        display.definitions,
        nativeLanguageId,
        englishLanguageId,
        fallback,
        posFilter,
      ),
    );
  const definition = stripHtml(
    pickWordDefinition(
      display.definitions,
      nativeLanguageId,
      englishLanguageId,
      fallback,
      posFilter,
    ),
  );
  const activePos =
    display.partsOfSpeech.find((pos) => pos.toLowerCase() === posFilter.toLowerCase()) ??
    posFilter;

  return {
    translation,
    definition,
    posLabel: formatPartsOfSpeech([activePos]),
    activePos,
  };
}

/** Search helper: includes POS-scoped gloss text when a filter is active. */
export function vocabularyItemMatchesSearch(
  item: VocabularyListItem,
  search: string,
  posFilter: string,
  nativeLanguageId?: string | null,
  englishLanguageId?: string | null,
): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  const gloss = resolveVocabularyGlossesForPosFilter(
    item.display,
    posFilter,
    nativeLanguageId,
    englishLanguageId,
    item.card.word.definition,
  );
  return (
    item.display.word.toLowerCase().includes(query) ||
    gloss.definition.toLowerCase().includes(query) ||
    gloss.translation.toLowerCase().includes(query) ||
    item.display.definition.toLowerCase().includes(query) ||
    item.display.translation.toLowerCase().includes(query)
  );
}

export type VocabularyDisplayWord = {
  word: string;
  phonetic: string;
  /** Joined POS labels for compact display. */
  pos: string;
  partsOfSpeech: string[];
  definition: string;
  /** Native (or best available) word translation for quizzes. */
  translation: string;
  example: string;
  category: string;
  audioUrl: string | null;
  origin: string | null;
  synonyms: string[];
  antonyms: string[];
  wordId: string;
  definitions: WordCardDto['definitions'];
  verbForms: VerbFormsDto | null;
};

export function formatVerbFormsLine(verbForms: VerbFormsDto): string {
  return `Past: ${verbForms.pastSimple} · Past participle: ${verbForms.pastParticiple}`;
}

export type VocabularyListItem = {
  card: StudentWordCardDto;
  status: VocabularyWordStatusName;
  display: VocabularyDisplayWord;
};

export type VocabularyPlayQuestion = {
  cardId: string;
  word: string;
  phonetic: string;
  correct: string;
  options: string[];
};

export function toDisplayWord(
  card: StudentWordCardDto,
  nativeLanguageId?: string | null,
  englishLanguageId?: string | null,
): VocabularyDisplayWord {
  const definition = stripHtml(
    pickWordDefinition(
      card.word.definitions,
      nativeLanguageId,
      englishLanguageId,
      card.word.definition,
    ),
  );
  const translation =
    stripHtml(pickWordTranslation(card.word.definitions, nativeLanguageId, englishLanguageId)) ||
    stripHtml(
      pickWordDefinition(
        card.word.definitions,
        nativeLanguageId,
        englishLanguageId,
        card.word.definition,
      ),
    );
  const partsOfSpeech = collectWordPartsOfSpeech(card.word);
  return {
    wordId: card.word.id,
    word: card.word.text,
    phonetic: card.word.phonetic ?? '',
    partsOfSpeech,
    pos: formatPartsOfSpeech(partsOfSpeech),
    definition,
    translation,
    example: card.word.example ?? '',
    category: card.word.category ?? 'General',
    audioUrl: card.word.audioUrl ?? null,
    origin: card.word.origin ?? null,
    synonyms: card.word.synonyms ?? [],
    antonyms: card.word.antonyms ?? [],
    definitions: card.word.definitions ?? [],
    verbForms:
      card.word.verbForms ??
      resolveVerbForms(card.word.text, card.word.partOfSpeech, card.word.definitions),
  };
}

export function mapStudentCardsToListItems(
  cards: StudentWordCardDto[],
  nativeLanguageId?: string | null,
  englishLanguageId?: string | null,
): VocabularyListItem[] {
  return cards.map((card) => ({
    card,
    status: card.status,
    display: toDisplayWord(card, nativeLanguageId, englishLanguageId),
  }));
}

export function displayWordFromCard(
  word: WordCardDto,
  nativeLanguageId?: string | null,
  englishLanguageId?: string | null,
): Pick<
  VocabularyDisplayWord,
  | 'word'
  | 'phonetic'
  | 'pos'
  | 'partsOfSpeech'
  | 'definition'
  | 'translation'
  | 'example'
  | 'audioUrl'
  | 'origin'
  | 'synonyms'
  | 'antonyms'
  | 'definitions'
  | 'wordId'
> {
  const partsOfSpeech = collectWordPartsOfSpeech(word);
  return {
    wordId: word.id,
    word: word.text,
    phonetic: word.phonetic ?? '',
    partsOfSpeech,
    pos: formatPartsOfSpeech(partsOfSpeech),
    definition: pickWordDefinition(word.definitions, nativeLanguageId, englishLanguageId, word.definition),
    translation: pickWordTranslation(word.definitions, nativeLanguageId, englishLanguageId),
    example: word.example ?? '',
    audioUrl: word.audioUrl ?? null,
    origin: word.origin ?? null,
    synonyms: word.synonyms ?? [],
    antonyms: word.antonyms ?? [],
    definitions: word.definitions ?? [],
  };
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function vocabularyPlayAnswer(item: VocabularyListItem): string {
  return item.display.translation.trim() || item.display.definition.trim();
}

/** Whether the pool can produce at least one multiple-choice question. */
export function canBuildVocabularyPlayRound(pool: VocabularyListItem[]): boolean {
  return buildVocabularyPlayRound(pool).length > 0;
}

export function buildVocabularyPlayRound(pool: VocabularyListItem[]): VocabularyPlayQuestion[] {
  if (pool.length === 0) return [];
  const poolAnswers = Array.from(
    new Set(pool.map(vocabularyPlayAnswer).filter((answer) => Boolean(answer))),
  );
  if (poolAnswers.length < 2) return [];

  const distractorCount = Math.min(3, poolAnswers.length - 1);

  return pool
    .map((item) => {
      const correct = vocabularyPlayAnswer(item);
      if (!correct) return null;
      const distractors = shuffle(poolAnswers.filter((answer) => answer !== correct)).slice(
        0,
        distractorCount,
      );
      if (distractors.length === 0) return null;
      return {
        cardId: item.card.id,
        word: item.display.word,
        phonetic: item.display.phonetic,
        correct,
        options: shuffle([correct, ...distractors]),
      };
    })
    .filter((question): question is VocabularyPlayQuestion => Boolean(question));
}
