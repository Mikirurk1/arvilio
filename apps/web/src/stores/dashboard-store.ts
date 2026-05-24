'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  DailyGoalDto,
  DashboardSummaryDto,
  LearningStreakDto,
  WordOfDayDto,
} from '@pkg/types';
import {
  DAILY_GOALS,
  DASHBOARD_SUMMARY,
  LEARNING_STREAK,
  SET_DAILY_GOAL_DONE,
  WORD_OF_DAY,
} from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';
import { useLessonsStore } from './lessons-store';
import { useVocabularyStore } from './vocabulary-store';

type DashboardState = {
  summary: AsyncSlice<DashboardSummaryDto>;
  goals: AsyncSlice<DailyGoalDto[]>;
  streak: AsyncSlice<LearningStreakDto | null>;
  wordOfDay: AsyncSlice<WordOfDayDto | null>;
  fetchSummary: (force?: boolean) => Promise<void>;
  fetchGoals: (force?: boolean) => Promise<void>;
  fetchStreak: (force?: boolean) => Promise<void>;
  fetchWordOfDay: (force?: boolean) => Promise<void>;
  fetchDashboard: (isStudent: boolean) => Promise<void>;
  toggleGoal: (goalId: string, done: boolean) => Promise<void>;
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      summary: createIdleSlice<DashboardSummaryDto>(),
      goals: createIdleSlice<DailyGoalDto[]>(),
      streak: createIdleSlice<LearningStreakDto | null>(),
      wordOfDay: createIdleSlice<WordOfDayDto | null>(),

      fetchSummary: async (force = false) => {
        const prev = get().summary;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ summary: sliceLoading(prev) }, false, 'dashboard/fetch:start');
        try {
          const data = await graphqlRequest<{ dashboardSummary: DashboardSummaryDto }>(
            DASHBOARD_SUMMARY,
          );
          set(
            { summary: sliceSuccess(prev, data.dashboardSummary) },
            false,
            'dashboard/fetch:success',
          );
        } catch (error) {
          set({ summary: sliceError(prev, error) }, false, 'dashboard/fetch:error');
        }
      },

      fetchGoals: async (force = false) => {
        const prev = get().goals;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ goals: sliceLoading(prev) }, false, 'dashboard/goals:start');
        try {
          const data = await graphqlRequest<{ dailyGoals: DailyGoalDto[] }>(DAILY_GOALS);
          set({ goals: sliceSuccess(prev, data.dailyGoals) }, false, 'dashboard/goals:success');
        } catch (error) {
          set({ goals: sliceError(prev, error) }, false, 'dashboard/goals:error');
        }
      },

      fetchStreak: async (force = false) => {
        const prev = get().streak;
        if (!force && prev.status === 'success') return;
        set({ streak: sliceLoading(prev) }, false, 'dashboard/streak:start');
        try {
          const data = await graphqlRequest<{ learningStreak: LearningStreakDto | null }>(
            LEARNING_STREAK,
          );
          set(
            { streak: sliceSuccess(prev, data.learningStreak) },
            false,
            'dashboard/streak:success',
          );
        } catch (error) {
          set({ streak: sliceError(prev, error) }, false, 'dashboard/streak:error');
        }
      },

      fetchWordOfDay: async (force = false) => {
        const prev = get().wordOfDay;
        if (!force && prev.status === 'success') return;
        set({ wordOfDay: sliceLoading(prev) }, false, 'dashboard/wod:start');
        try {
          const data = await graphqlRequest<{ wordOfDay: WordOfDayDto | null }>(WORD_OF_DAY);
          set(
            { wordOfDay: sliceSuccess(prev, data.wordOfDay) },
            false,
            'dashboard/wod:success',
          );
        } catch (error) {
          set({ wordOfDay: sliceError(prev, error) }, false, 'dashboard/wod:error');
        }
      },

      fetchDashboard: async (isStudent) => {
        await get().fetchSummary(true);
        const tasks: Promise<void>[] = [
          useLessonsStore.getState().fetchScheduledLessons(true),
        ];
        if (isStudent) {
          tasks.push(
            get().fetchGoals(true),
            get().fetchStreak(true),
            get().fetchWordOfDay(true),
            useVocabularyStore.getState().fetchOverview(true),
            useVocabularyStore.getState().fetchCards(undefined, true),
          );
        }
        await Promise.all(tasks);
      },

      toggleGoal: async (goalId, done) => {
        const prev = get().goals;
        try {
          const data = await graphqlRequest<{ setDailyGoalDone: DailyGoalDto[] }>(
            SET_DAILY_GOAL_DONE,
            { goalId, done },
          );
          set({ goals: sliceSuccess(prev, data.setDailyGoalDone) }, false, 'dashboard/goals:toggle');
        } catch (error) {
          set({ goals: sliceError(prev, error) }, false, 'dashboard/goals:toggle-error');
          throw error;
        }
      },
    }),
    { name: 'soenglish/dashboard' },
  ),
);
