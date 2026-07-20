'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CreateStudentWordCardRequestDto,
  StudentWordCardDto,
  VocabularyOverviewDto,
  WordCardDto,
  WordLookupResultDto,
} from '@pkg/types';
import {
  ADD_STUDENT_WORD_CARD,
  LOOKUP_WORD,
  STUDENT_VOCABULARY,
  STUDENT_VOCABULARY_PAGE,
  DELETE_STUDENT_WORD_CARD,
  UPDATE_CARD_STATUS,
  VOCABULARY_OVERVIEW,
  WORDS_BY_IDS,
} from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';
import { loadInitialPage, loadNextPage, mergePageItems } from './lib/paginated-api';
import { createIdlePaginatedSlice, type PaginatedSlice } from './lib/paginated-slice';

type VocabularyState = {
  overview: AsyncSlice<VocabularyOverviewDto>;
  cards: AsyncSlice<StudentWordCardDto[]>;
  cardsStudentId: string | null;
  cardsPage: PaginatedSlice<StudentWordCardDto>;
  cardsPageStudentId: string | null;
  fetchOverview: (force?: boolean) => Promise<void>;
  fetchCards: (studentId?: string, force?: boolean) => Promise<void>;
  fetchCardsPage: (studentId?: string, force?: boolean) => Promise<void>;
  loadMoreCardsPage: () => Promise<void>;
  lookupWord: (text: string) => Promise<WordLookupResultDto>;
  fetchWordsByIds: (ids: string[]) => Promise<WordCardDto[]>;
  addCard: (body: CreateStudentWordCardRequestDto, studentId?: string) => Promise<StudentWordCardDto>;
  updateCardStatus: (
    cardId: string,
    status: StudentWordCardDto['status'],
    studentId?: string,
  ) => Promise<void>;
  deleteCard: (cardId: string, studentId: string) => Promise<void>;
};

export const useVocabularyStore = create<VocabularyState>()(
  devtools(
    (set, get) => ({
      overview: createIdleSlice<VocabularyOverviewDto>(),
      cards: createIdleSlice<StudentWordCardDto[]>(),
      cardsStudentId: null,
      cardsPage: createIdlePaginatedSlice<StudentWordCardDto>(),
      cardsPageStudentId: null,

      fetchOverview: async (force = false) => {
        const prev = get().overview;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ overview: sliceLoading(prev) }, false, 'vocabulary/overview:start');
        try {
          const data = await graphqlRequest<{ vocabularyOverview: VocabularyOverviewDto }>(
            VOCABULARY_OVERVIEW,
          );
          set(
            { overview: sliceSuccess(prev, data.vocabularyOverview) },
            false,
            'vocabulary/overview:success',
          );
        } catch (error) {
          set({ overview: sliceError(prev, error) }, false, 'vocabulary/overview:error');
        }
      },

      fetchCards: async (studentId, force = false) => {
        const key = studentId ?? null;
        const prev = get().cards;
        if (!force && get().cardsStudentId === key && prev.status === 'success' && prev.data) {
          return;
        }
        set(
          { cards: sliceLoading(prev), cardsStudentId: key },
          false,
          'vocabulary/cards:start',
        );
        try {
          const data = await graphqlRequest<{ studentVocabulary: StudentWordCardDto[] }>(
            STUDENT_VOCABULARY,
            studentId ? { studentId } : {},
          );
          set(
            { cards: sliceSuccess(prev, data.studentVocabulary), cardsStudentId: key },
            false,
            'vocabulary/cards:success',
          );
        } catch (error) {
          set({ cards: sliceError(prev, error) }, false, 'vocabulary/cards:error');
        }
      },

      fetchCardsPage: async (studentId, force = false) => {
        const key = studentId ?? null;
        const prev = get().cardsPage;
        if (!force && get().cardsPageStudentId === key && prev.status === 'success' && prev.items.length > 0) {
          return;
        }
        set(
          {
            cardsPage: { ...createIdlePaginatedSlice<StudentWordCardDto>(), status: 'loading' },
            cardsPageStudentId: key,
          },
          false,
          'vocabulary/cardsPage:start',
        );
        try {
          const page = await loadInitialPage<StudentWordCardDto>(
            STUDENT_VOCABULARY_PAGE,
            'studentVocabularyPage',
            studentId ? { studentId } : {},
          );
          set(
            {
              cardsPage: {
                items: page.items,
                hasMore: page.hasMore,
                nextCursor: page.nextCursor,
                status: 'success',
                error: null,
                loadingMore: false,
              },
              cardsPageStudentId: key,
            },
            false,
            'vocabulary/cardsPage:success',
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load vocabulary';
          set(
            {
              cardsPage: { ...get().cardsPage, status: 'error', error: message, loadingMore: false },
            },
            false,
            'vocabulary/cardsPage:error',
          );
        }
      },

      loadMoreCardsPage: async () => {
        const page = get().cardsPage;
        const studentId = get().cardsPageStudentId;
        if (page.status !== 'success' || !page.hasMore || page.loadingMore || !page.nextCursor) {
          return;
        }
        set({ cardsPage: { ...page, loadingMore: true } }, false, 'vocabulary/cardsPage:more:start');
        try {
          const next = await loadNextPage<StudentWordCardDto>(
            STUDENT_VOCABULARY_PAGE,
            'studentVocabularyPage',
            studentId ? { studentId } : {},
            page.nextCursor,
          );
          set(
            { cardsPage: mergePageItems(page, next) },
            false,
            'vocabulary/cardsPage:more:success',
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load more';
          set(
            { cardsPage: { ...get().cardsPage, loadingMore: false, error: message } },
            false,
            'vocabulary/cardsPage:more:error',
          );
        }
      },

      lookupWord: async (text) => {
        const data = await graphqlRequest<{ lookupWord: WordLookupResultDto }>(LOOKUP_WORD, {
          text: text.trim(),
        });
        return data.lookupWord;
      },

      fetchWordsByIds: async (ids) => {
        if (ids.length === 0) return [];
        const data = await graphqlRequest<{ wordsByIds: WordCardDto[] }>(WORDS_BY_IDS, { ids });
        return data.wordsByIds;
      },

      addCard: async (body, studentId) => {
        const data = await graphqlRequest<{ addStudentWordCard: StudentWordCardDto }>(
          ADD_STUDENT_WORD_CARD,
          {
            input: { text: body.text, lessonId: body.lessonId, status: body.status },
            studentId,
          },
        );
        await Promise.all([
          get().fetchCards(studentId, true),
          get().fetchCardsPage(studentId, true),
          get().fetchOverview(true),
        ]);
        return data.addStudentWordCard;
      },

      updateCardStatus: async (cardId, status, studentId) => {
        await graphqlRequest(UPDATE_CARD_STATUS, {
          input: { cardId, status },
          studentId,
        });
        await Promise.all([get().fetchCards(studentId, true), get().fetchCardsPage(studentId, true)]);
      },

      deleteCard: async (cardId, studentId) => {
        await graphqlRequest<{ deleteStudentWordCard: boolean }>(DELETE_STUDENT_WORD_CARD, {
          cardId,
          studentId,
        });
        await Promise.all([
          get().fetchCards(studentId, true),
          get().fetchCardsPage(studentId, true),
          get().fetchOverview(true),
        ]);
      },
    }),
    { name: 'arvilio/vocabulary' },
  ),
);
