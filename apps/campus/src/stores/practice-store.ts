'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PracticeWeekSummaryDto } from '@pkg/types';
import { PRACTICE_WEEK_SUMMARY, RECORD_PRACTICE_SESSION } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type PracticeState = {
  weekSummary: AsyncSlice<PracticeWeekSummaryDto>;
  fetchWeekSummary: (force?: boolean) => Promise<void>;
  recordSession: (input: {
    kind: 'vocabulary' | 'quiz' | 'speaking' | 'games' | 'challenges' | 'lesson';
    startedAt: string;
    endedAt: string;
  }) => Promise<void>;
};

export const usePracticeStore = create<PracticeState>()(
  devtools(
    (set, get) => ({
      weekSummary: createIdleSlice<PracticeWeekSummaryDto>(),

      fetchWeekSummary: async (force = false) => {
        const prev = get().weekSummary;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ weekSummary: sliceLoading(prev) }, false, 'practice/week:start');
        try {
          const data = await graphqlRequest<{ practiceWeekSummary: PracticeWeekSummaryDto }>(
            PRACTICE_WEEK_SUMMARY,
          );
          set(
            { weekSummary: sliceSuccess(prev, data.practiceWeekSummary) },
            false,
            'practice/week:success',
          );
        } catch (error) {
          set({ weekSummary: sliceError(prev, error) }, false, 'practice/week:error');
        }
      },

      recordSession: async (input) => {
        await graphqlRequest(RECORD_PRACTICE_SESSION, {
          input: { ...input, source: 'practice' },
        });
        await get().fetchWeekSummary(true);
      },
    }),
    { name: 'arvilio/practice' },
  ),
);
