import type { VerbFormsDto } from '@pkg/types';

export type WordRow = {
  id: string;
  text: string;
  definition: string;
  example: string | null;
  partOfSpeech: string | null;
  category: string | null;
  translation: string | null;
  verbForms: VerbFormsDto | null;
  vocabularyWeight: number;
};

export type CardWithWord = {
  status: 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED';
  lessonId: string | null;
  word: {
    id: string;
    text: string;
    definition: string;
    example: string | null;
    partOfSpeech: string | null;
    category: string | null;
    definitions: Array<{
      languageId: string;
      text: string;
      lemmaText: string | null;
      partOfSpeech: string;
    }>;
  };
};

export const cardWordInclude = {
  word: {
    include: {
      definitions: {
        select: {
          languageId: true,
          text: true,
          lemmaText: true,
          partOfSpeech: true,
        },
      },
    },
  },
} as const;
