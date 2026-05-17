'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CreateScheduledLessonRequestDto,
  ScheduledLessonBackendDto,
  UpdateScheduledLessonRequestDto,
} from '@soenglish/shared-types';
import {
  CREATE_SCHEDULED_LESSON,
  DELETE_SCHEDULED_LESSON,
  SCHEDULED_LESSONS,
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

type LessonsState = {
  backendLessons: AsyncSlice<ScheduledLessonBackendDto[]>;
  fetchScheduledLessons: (force?: boolean) => Promise<void>;
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
            if (!prev.data) return { backendLessons: prev };
            return {
              backendLessons: sliceSuccess(
                prev,
                prev.data.filter((row) => row.id !== id),
              ),
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
