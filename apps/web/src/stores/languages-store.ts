'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { LanguageDto } from '@soenglish/shared-types';
import { LANGUAGES } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type LanguagesState = {
  languages: AsyncSlice<LanguageDto[]>;
  fetchLanguages: () => Promise<void>;
  languageById: (id: string | null | undefined) => LanguageDto | undefined;
  englishLanguageId: () => string | undefined;
};

/** Stable fallback — never use inline `?? []` in selectors (breaks useSyncExternalStore). */
const EMPTY_LANGUAGES: LanguageDto[] = [];

export const selectLanguagesList = (s: LanguagesState): LanguageDto[] =>
  s.languages.data ?? EMPTY_LANGUAGES;

export const selectEnglishLanguageId = (s: LanguagesState): string | undefined =>
  s.languages.data?.find((l) => l.code === 'en')?.id;

export const useLanguagesStore = create<LanguagesState>()(
  devtools(
    (set, get) => ({
      languages: createIdleSlice<LanguageDto[]>(),

      fetchLanguages: async () => {
        const prev = get().languages;
        if (prev.status === 'success' && prev.data) return;
        set({ languages: sliceLoading(prev) });
        try {
          const data = await graphqlRequest<{ languages: LanguageDto[] }>(LANGUAGES);
          set({ languages: sliceSuccess(prev, data.languages) });
        } catch (error) {
          set({ languages: sliceError(prev, error) });
        }
      },

      languageById: (id) => {
        if (!id) return undefined;
        return get().languages.data?.find((l: LanguageDto) => l.id === id);
      },

      englishLanguageId: () =>
        get().languages.data?.find((l: LanguageDto) => l.code === 'en')?.id,
    }),
    { name: 'soenglish/languages' },
  ),
);
