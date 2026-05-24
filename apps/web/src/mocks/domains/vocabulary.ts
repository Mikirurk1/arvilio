import type {
  VocabularyWordDto,
  VocabularyWordStatusName,
  VocabularyWordStatusId,
} from '@pkg/types';
import { VOCABULARY_WORD_STATUS_IDS } from '@pkg/types';

export { VOCABULARY_WORD_STATUS_IDS };

/** Resolve catalog status id to status name (labels / filters). */
export function vocabularyStatusIdToLegacy(statusId: VocabularyWordStatusId): VocabularyWordStatusName {
  switch (statusId) {
    case VOCABULARY_WORD_STATUS_IDS.new:
      return 'new';
    case VOCABULARY_WORD_STATUS_IDS.repeated:
      return 'repeated';
    case VOCABULARY_WORD_STATUS_IDS.mistakesWork:
      return 'mistakes_work';
    case VOCABULARY_WORD_STATUS_IDS.learned:
      return 'learned';
    default:
      return 'new';
  }
}

export function legacyStatusToVocabularyStatusId(
  status: VocabularyWordStatusName,
): VocabularyWordStatusId {
  switch (status) {
    case 'new':
      return VOCABULARY_WORD_STATUS_IDS.new;
    case 'repeated':
      return VOCABULARY_WORD_STATUS_IDS.repeated;
    case 'mistakes_work':
      return VOCABULARY_WORD_STATUS_IDS.mistakesWork;
    case 'learned':
      return VOCABULARY_WORD_STATUS_IDS.learned;
    default:
      return VOCABULARY_WORD_STATUS_IDS.new;
  }
}

const vocabularySeed: VocabularyWordDto[] = [
  {
    id: 1,
    word: 'Eloquent',
    phonetic: '/ˈɛl.ə.kwənt/',
    pos: 'adjective',
    definition: 'Fluent and persuasive in speaking or writing.',
    example: 'She delivered an eloquent speech.',
    category: 'communication',
  },
  {
    id: 2,
    word: 'Leverage',
    phonetic: '/ˈlev.ər.ɪdʒ/',
    pos: 'verb / noun',
    definition: 'Use something to maximum advantage.',
    example: 'We need to leverage our network.',
    category: 'business',
  },
  {
    id: 3,
    word: 'Concise',
    phonetic: '/kənˈsaɪs/',
    pos: 'adjective',
    definition: 'Clear and brief.',
    example: 'Please be concise in your presentation.',
    category: 'communication',
  },
  {
    id: 4,
    word: 'Ambiguous',
    phonetic: '/æmˈbɪɡ.ju.əs/',
    pos: 'adjective',
    definition: 'Open to more than one interpretation.',
    example: 'The contract terms were ambiguous.',
    category: 'communication',
  },
  {
    id: 5,
    word: 'Coherent',
    phonetic: '/kəʊˈhɪə.rənt/',
    pos: 'adjective',
    definition: 'Logical and consistent.',
    example: 'She presented a coherent argument.',
    category: 'communication',
  },
];

/** Mutable global catalog (shared across mocks). */
export const mockVocabularyWords: VocabularyWordDto[] = [...vocabularySeed];

function nextCatalogWordId(): number {
  return mockVocabularyWords.reduce((max, w) => Math.max(max, w.id), 0) + 1;
}

export function getVocabularyWordById(id: number): VocabularyWordDto | undefined {
  return mockVocabularyWords.find((w) => w.id === id);
}

export function createVocabularyWord(
  partial: Omit<VocabularyWordDto, 'id'> & { id?: number },
): number {
  const id = partial.id ?? nextCatalogWordId();
  const row: VocabularyWordDto = {
    id,
    word: partial.word,
    phonetic: partial.phonetic ?? '',
    pos: partial.pos ?? '—',
    definition: partial.definition ?? '',
    example: partial.example ?? '',
    category: partial.category ?? 'general',
  };
  mockVocabularyWords.push(row);
  return id;
}
