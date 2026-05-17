import type { StudentWordCardDto, VocabularyWordStatusName, WordCardDto } from '@soenglish/shared-types';
import { pickWordDefinition, pickWordTranslation } from './word-definitions';
import { stripHtml } from './strip-html';

export type VocabularyDisplayWord = {
  word: string;
  phonetic: string;
  pos: string;
  definition: string;
  /** Native (or best available) word translation for quizzes. */
  translation: string;
  example: string;
  category: string;
  audioUrl: string | null;
  origin: string | null;
  wordId: string;
  definitions: WordCardDto['definitions'];
};

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
  return {
    wordId: card.word.id,
    word: card.word.text,
    phonetic: card.word.phonetic ?? '',
    pos: card.word.partOfSpeech ?? '—',
    definition,
    translation,
    example: card.word.example ?? '',
    category: card.word.category ?? 'General',
    audioUrl: card.word.audioUrl ?? null,
    origin: card.word.origin ?? null,
    definitions: card.word.definitions ?? [],
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
  'word' | 'phonetic' | 'pos' | 'definition' | 'translation' | 'example' | 'audioUrl' | 'origin' | 'definitions' | 'wordId'
> {
  return {
    wordId: word.id,
    word: word.text,
    phonetic: word.phonetic ?? '',
    pos: word.partOfSpeech ?? '—',
    definition: pickWordDefinition(word.definitions, nativeLanguageId, englishLanguageId, word.definition),
    translation: pickWordTranslation(word.definitions, nativeLanguageId, englishLanguageId),
    example: word.example ?? '',
    audioUrl: word.audioUrl ?? null,
    origin: word.origin ?? null,
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
