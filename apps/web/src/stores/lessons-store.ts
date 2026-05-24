'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CreateScheduledLessonRequestDto,
  ScheduledLessonBackendDto,
  UpdateScheduledLessonRequestDto,
} from '@pkg/types';
import {
  CREATE_SCHEDULED_LESSON,
  SCHEDULED_LESSONS,
  SCHEDULED_LESSONS_PAGE,
} from '../graphql/operations';
import { apiClient } from '../lib/api';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

/** Must match default in `LessonsService.listForPage`. */
export const LESSONS_PAGE_SIZE = 25;

type LessonsPageSlice = {
  items: ScheduledLessonBackendDto[];
  hasMore: boolean;
  nextCursor: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  loadingMore: boolean;
};

function createIdleLessonsPage(): LessonsPageSlice {
  return {
    items: [],
    hasMore: false,
    nextCursor: null,
    status: 'idle',
    error: null,
    loadingMore: false,
  };
}

function patchBackendLessonCache(
  prev: AsyncSlice<ScheduledLessonBackendDto[]>,
  id: string,
  updated: ScheduledLessonBackendDto,
): AsyncSlice<ScheduledLessonBackendDto[]> {
  if (!prev.data) return prev;
  return sliceSuccess(
    prev,
    prev.data.map((row) => (row.id === id ? updated : row)),
  );
}

function patchLessonsPageItem(
  page: LessonsPageSlice,
  id: string,
  updated: ScheduledLessonBackendDto,
): LessonsPageSlice {
  if (!page.items.some((row) => row.id === id)) return page;
  return {
    ...page,
    items: page.items.map((row) => (row.id === id ? updated : row)),
  };
}

type LessonsState = {
  backendLessons: AsyncSlice<ScheduledLessonBackendDto[]>;
  lessonsPage: LessonsPageSlice;
  fetchScheduledLessons: (force?: boolean) => Promise<void>;
  fetchLessonsPage: (force?: boolean) => Promise<void>;
  loadMoreLessonsPage: () => Promise<void>;
  createScheduledLesson: (body: CreateScheduledLessonRequestDto) => Promise<ScheduledLessonBackendDto>;
  updateScheduledLesson: (
    id: string,
    body: UpdateScheduledLessonRequestDto,
  ) => Promise<ScheduledLessonBackendDto>;
  deleteScheduledLesson: (id: string) => Promise<void>;
};

export const useLessonsStore = create<LessonsState>()(
  devtools(
    (set, get) => ({
      backendLessons: createIdleSlice<ScheduledLessonBackendDto[]>(),
      lessonsPage: createIdleLessonsPage(),

      fetchScheduledLessons: async (force = false) => {
        const prev = get().backendLessons;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ backendLessons: sliceLoading(prev) }, false, 'lessons/fetch:start');
        try {
          const data = await graphqlRequest<{ scheduledLessons: ScheduledLessonBackendDto[] }>(
            SCHEDULED_LESSONS,
          );
          set(
            { backendLessons: sliceSuccess(prev, data.scheduledLessons) },
            false,
            'lessons/fetch:success',
          );
        } catch (error) {
          set({ backendLessons: sliceError(prev, error) }, false, 'lessons/fetch:error');
        }
      },

      fetchLessonsPage: async (force = false) => {
        const prev = get().lessonsPage;
        if (!force && prev.status === 'success' && prev.items.length > 0) return;
        set(
          {
            lessonsPage: {
              ...createIdleLessonsPage(),
              status: 'loading',
            },
          },
          false,
          'lessons/page:start',
        );
        try {
          const data = await graphqlRequest<{
            scheduledLessonsPage: {
              items: ScheduledLessonBackendDto[];
              hasMore: boolean;
              nextCursor: string | null;
            };
          }>(SCHEDULED_LESSONS_PAGE, { limit: LESSONS_PAGE_SIZE });
          const page = data.scheduledLessonsPage;
          set(
            {
              lessonsPage: {
                items: page.items,
                hasMore: page.hasMore,
                nextCursor: page.nextCursor,
                status: 'success',
                error: null,
                loadingMore: false,
              },
            },
            false,
            'lessons/page:success',
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load lessons';
          set(
            {
              lessonsPage: {
                ...get().lessonsPage,
                status: 'error',
                error: message,
                loadingMore: false,
              },
            },
            false,
            'lessons/page:error',
          );
        }
      },

      loadMoreLessonsPage: async () => {
        const page = get().lessonsPage;
        if (page.status !== 'success' || !page.hasMore || page.loadingMore || !page.nextCursor) {
          return;
        }
        set(
          { lessonsPage: { ...page, loadingMore: true } },
          false,
          'lessons/page:more:start',
        );
        try {
          const data = await graphqlRequest<{
            scheduledLessonsPage: {
              items: ScheduledLessonBackendDto[];
              hasMore: boolean;
              nextCursor: string | null;
            };
          }>(SCHEDULED_LESSONS_PAGE, {
            cursor: page.nextCursor,
            limit: LESSONS_PAGE_SIZE,
          });
          const next = data.scheduledLessonsPage;
          const seen = new Set(page.items.map((row) => row.id));
          const merged = [...page.items, ...next.items.filter((row) => !seen.has(row.id))];
          set(
            {
              lessonsPage: {
                items: merged,
                hasMore: next.hasMore,
                nextCursor: next.nextCursor,
                status: 'success',
                error: null,
                loadingMore: false,
              },
            },
            false,
            'lessons/page:more:success',
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load more lessons';
          set(
            {
              lessonsPage: {
                ...get().lessonsPage,
                loadingMore: false,
                error: message,
              },
            },
            false,
            'lessons/page:more:error',
          );
        }
      },

      createScheduledLesson: async (body) => {
        const data = await graphqlRequest<{ createScheduledLesson: ScheduledLessonBackendDto }>(
          CREATE_SCHEDULED_LESSON,
          { input: body },
        );
        const created = data.createScheduledLesson;
        set(
          (state) => ({
            backendLessons: state.backendLessons.data
              ? sliceSuccess(state.backendLessons, [...state.backendLessons.data, created])
              : sliceSuccess(state.backendLessons, [created]),
          }),
          false,
          'lessons/create:cache',
        );
        if (get().lessonsPage.status === 'success') {
          void get().fetchLessonsPage(true);
        }
        return created;
      },

      updateScheduledLesson: async (id, body) => {
        const updated = await apiClient.patch<ScheduledLessonBackendDto>(
          `/lessons/scheduled/${encodeURIComponent(id)}`,
          body,
        );
        set(
          (state) => ({
            backendLessons: patchBackendLessonCache(state.backendLessons, id, updated),
            lessonsPage: patchLessonsPageItem(state.lessonsPage, id, updated),
          }),
          false,
          'lessons/update:cache',
        );
        return updated;
      },

      deleteScheduledLesson: async (id) => {
        await apiClient.delete(`/lessons/scheduled/${encodeURIComponent(id)}`);
        set(
          (state) => {
            const prev = state.backendLessons;
            const nextBackend = prev.data
              ? sliceSuccess(
                  prev,
                  prev.data.filter((row) => row.id !== id),
                )
              : prev;
            const page = state.lessonsPage;
            return {
              backendLessons: nextBackend,
              lessonsPage:
                page.status === 'success'
                  ? {
                      ...page,
                      items: page.items.filter((row) => row.id !== id),
                    }
                  : page,
            };
          },
          false,
          'lessons/delete:cache',
        );
      },
    }),
    { name: 'soenglish/lessons' },
  ),
);
