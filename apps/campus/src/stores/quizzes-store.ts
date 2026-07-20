'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  GenerateQuizRequestDto,
  QuizAttemptResultDto,
  QuizCardDto,
  QuizDetailDto,
  StudentQuizCardDto,
  SubmitQuizAttemptRequestDto,
} from '@pkg/types';
import { normalizeQuizQuestions } from '../lib/quiz-questions';
import { apiClient } from '../lib/api';
import {
  DELETE_QUIZ,
  QUIZ_DETAIL,
  QUIZZES_LIST,
  QUIZZES_PAGE,
  STUDENT_QUIZZES,
  STUDENT_QUIZZES_PAGE,
  SUBMIT_QUIZ_ATTEMPT,
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

type QuizzesState = {
  list: AsyncSlice<QuizCardDto[]>;
  listPage: PaginatedSlice<QuizCardDto>;
  studentQuizzes: AsyncSlice<StudentQuizCardDto[]>;
  studentQuizzesPage: PaginatedSlice<StudentQuizCardDto>;
  studentQuizzesStudentId: string | null;
  generating: boolean;
  generateError: string | null;
  fetchList: (force?: boolean) => Promise<void>;
  fetchListPage: (force?: boolean) => Promise<void>;
  loadMoreListPage: () => Promise<void>;
  fetchStudentQuizzes: (studentId: string, force?: boolean) => Promise<void>;
  fetchStudentQuizzesPage: (studentId: string, force?: boolean) => Promise<void>;
  loadMoreStudentQuizzesPage: () => Promise<void>;
  fetchQuiz: (quizId: string) => Promise<QuizDetailDto>;
  generateQuiz: (body: GenerateQuizRequestDto) => Promise<QuizDetailDto>;
  deleteQuiz: (quizId: string, studentId?: string) => Promise<void>;
  submitQuizAttempt: (body: SubmitQuizAttemptRequestDto) => Promise<QuizAttemptResultDto>;
};

export const useQuizzesStore = create<QuizzesState>()(
  devtools(
    (set, get) => ({
      list: createIdleSlice<QuizCardDto[]>(),
      listPage: createIdlePaginatedSlice<QuizCardDto>(),
      studentQuizzes: createIdleSlice<StudentQuizCardDto[]>(),
      studentQuizzesPage: createIdlePaginatedSlice<StudentQuizCardDto>(),
      studentQuizzesStudentId: null,
      generating: false,
      generateError: null,

      fetchList: async (force = false) => {
        const prev = get().list;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ list: sliceLoading(prev) }, false, 'quizzes/list:start');
        try {
          const data = await graphqlRequest<{ quizzes: QuizCardDto[] }>(QUIZZES_LIST);
          set({ list: sliceSuccess(prev, data.quizzes) }, false, 'quizzes/list:success');
        } catch (error) {
          set({ list: sliceError(prev, error) }, false, 'quizzes/list:error');
        }
      },

      fetchListPage: async (force = false) => {
        const prev = get().listPage;
        if (!force && prev.status === 'success' && prev.items.length > 0) return;
        set(
          { listPage: { ...createIdlePaginatedSlice<QuizCardDto>(), status: 'loading' } },
          false,
          'quizzes/listPage:start',
        );
        try {
          const page = await loadInitialPage<QuizCardDto>(QUIZZES_PAGE, 'quizzesPage', {});
          set(
            {
              listPage: {
                items: page.items,
                hasMore: page.hasMore,
                nextCursor: page.nextCursor,
                status: 'success',
                error: null,
                loadingMore: false,
              },
            },
            false,
            'quizzes/listPage:success',
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load quizzes';
          set(
            { listPage: { ...get().listPage, status: 'error', error: message, loadingMore: false } },
            false,
            'quizzes/listPage:error',
          );
        }
      },

      loadMoreListPage: async () => {
        const page = get().listPage;
        if (page.status !== 'success' || !page.hasMore || page.loadingMore || !page.nextCursor) return;
        set({ listPage: { ...page, loadingMore: true } }, false, 'quizzes/listPage:more:start');
        try {
          const next = await loadNextPage<QuizCardDto>(QUIZZES_PAGE, 'quizzesPage', {}, page.nextCursor);
          set({ listPage: mergePageItems(page, next) }, false, 'quizzes/listPage:more:success');
        } catch {
          set({ listPage: { ...get().listPage, loadingMore: false } }, false, 'quizzes/listPage:more:error');
        }
      },

      fetchStudentQuizzes: async (studentId, force = false) => {
        const prev = get().studentQuizzes;
        if (
          !force &&
          get().studentQuizzesStudentId === studentId &&
          prev.status === 'success' &&
          prev.data
        ) {
          return;
        }
        set(
          { studentQuizzes: sliceLoading(prev), studentQuizzesStudentId: studentId },
          false,
          'quizzes/student:start',
        );
        try {
          const data = await graphqlRequest<{ studentQuizzes: StudentQuizCardDto[] }>(
            STUDENT_QUIZZES,
            { studentId },
          );
          set(
            {
              studentQuizzes: sliceSuccess(prev, data.studentQuizzes),
              studentQuizzesStudentId: studentId,
            },
            false,
            'quizzes/student:success',
          );
        } catch (error) {
          set({ studentQuizzes: sliceError(prev, error) }, false, 'quizzes/student:error');
        }
      },

      fetchStudentQuizzesPage: async (studentId, force = false) => {
        const prev = get().studentQuizzesPage;
        if (
          !force &&
          get().studentQuizzesStudentId === studentId &&
          prev.status === 'success' &&
          prev.items.length > 0
        ) {
          return;
        }
        set(
          {
            studentQuizzesPage: { ...createIdlePaginatedSlice<StudentQuizCardDto>(), status: 'loading' },
            studentQuizzesStudentId: studentId,
          },
          false,
          'quizzes/studentPage:start',
        );
        try {
          const page = await loadInitialPage<StudentQuizCardDto>(
            STUDENT_QUIZZES_PAGE,
            'studentQuizzesPage',
            { studentId },
          );
          set(
            {
              studentQuizzesPage: {
                items: page.items,
                hasMore: page.hasMore,
                nextCursor: page.nextCursor,
                status: 'success',
                error: null,
                loadingMore: false,
              },
              studentQuizzesStudentId: studentId,
            },
            false,
            'quizzes/studentPage:success',
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load quizzes';
          set(
            {
              studentQuizzesPage: {
                ...get().studentQuizzesPage,
                status: 'error',
                error: message,
                loadingMore: false,
              },
            },
            false,
            'quizzes/studentPage:error',
          );
        }
      },

      loadMoreStudentQuizzesPage: async () => {
        const page = get().studentQuizzesPage;
        const studentId = get().studentQuizzesStudentId;
        if (!studentId || page.status !== 'success' || !page.hasMore || page.loadingMore || !page.nextCursor) {
          return;
        }
        set({ studentQuizzesPage: { ...page, loadingMore: true } }, false, 'quizzes/studentPage:more:start');
        try {
          const next = await loadNextPage<StudentQuizCardDto>(
            STUDENT_QUIZZES_PAGE,
            'studentQuizzesPage',
            { studentId },
            page.nextCursor,
          );
          set({ studentQuizzesPage: mergePageItems(page, next) }, false, 'quizzes/studentPage:more:success');
        } catch {
          set(
            { studentQuizzesPage: { ...get().studentQuizzesPage, loadingMore: false } },
            false,
            'quizzes/studentPage:more:error',
          );
        }
      },

      fetchQuiz: async (quizId) => {
        const data = await graphqlRequest<{ quiz: QuizDetailDto }>(QUIZ_DETAIL, { id: quizId });
        const detail = data.quiz;
        return {
          ...detail,
          questions: normalizeQuizQuestions(detail.questions),
        };
      },

      generateQuiz: async (body) => {
        set({ generating: true, generateError: null }, false, 'quizzes/generate:start');
        try {
          const created = await apiClient.post<QuizDetailDto>('/quizzes/generate', body);
          const detail: QuizDetailDto = {
            ...created,
            questionCount: created.questions.length,
            questions: normalizeQuizQuestions(created.questions),
          };
          if (body.studentId) {
            await Promise.all([
              get().fetchStudentQuizzes(body.studentId, true),
              get().fetchStudentQuizzesPage(body.studentId, true),
            ]);
          } else {
            await Promise.all([get().fetchList(true), get().fetchListPage(true)]);
          }
          set({ generating: false }, false, 'quizzes/generate:success');
          return detail;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to generate quiz';
          set({ generating: false, generateError: message }, false, 'quizzes/generate:error');
          throw error;
        }
      },

      deleteQuiz: async (quizId, studentId) => {
        await graphqlRequest<{ deleteQuiz: boolean }>(DELETE_QUIZ, { id: quizId });
        if (studentId) {
          await Promise.all([
            get().fetchStudentQuizzes(studentId, true),
            get().fetchStudentQuizzesPage(studentId, true),
          ]);
        } else {
          await Promise.all([get().fetchList(true), get().fetchListPage(true)]);
        }
      },

      submitQuizAttempt: async (body) => {
        const data = await graphqlRequest<{ submitQuizAttempt: QuizAttemptResultDto }>(
          SUBMIT_QUIZ_ATTEMPT,
          { input: body },
        );
        const result = data.submitQuizAttempt;
        if (!body.practiceMode) {
          const attemptPatch = {
            id: result.attemptId ?? 'latest',
            score: result.score,
            correctCount: result.correctCount,
            totalCount: result.totalCount,
            finishedAt: new Date().toISOString(),
          };
          const patchQuiz = <T extends QuizCardDto | StudentQuizCardDto>(q: T): T =>
            q.id === body.quizId
              ? {
                  ...q,
                  attempt: {
                    ...attemptPatch,
                    id: result.attemptId ?? q.attempt?.id ?? attemptPatch.id,
                  },
                }
              : q;

          const prevList = get().list;
          if (prevList.data?.some((q) => q.id === body.quizId)) {
            set(
              { list: sliceSuccess(prevList, prevList.data.map(patchQuiz)) },
              false,
              'quizzes/list:optimistic',
            );
          }
          const listPage = get().listPage;
          if (listPage.status === 'success' && listPage.items.some((q) => q.id === body.quizId)) {
            set(
              { listPage: { ...listPage, items: listPage.items.map(patchQuiz) } },
              false,
              'quizzes/listPage:optimistic',
            );
          }

          const studentId = body.studentId ?? get().studentQuizzesStudentId;
          if (studentId) {
            const prev = get().studentQuizzes;
            if (prev.data?.some((q) => q.id === body.quizId)) {
              set(
                { studentQuizzes: sliceSuccess(prev, prev.data.map(patchQuiz)) },
                false,
                'quizzes/student:optimistic',
              );
            }
            const studentPage = get().studentQuizzesPage;
            if (studentPage.status === 'success' && studentPage.items.some((q) => q.id === body.quizId)) {
              set(
                { studentQuizzesPage: { ...studentPage, items: studentPage.items.map(patchQuiz) } },
                false,
                'quizzes/studentPage:optimistic',
              );
            }
            await Promise.all([
              get().fetchStudentQuizzes(studentId, true),
              get().fetchStudentQuizzesPage(studentId, true),
            ]);
          } else {
            await Promise.all([get().fetchList(true), get().fetchListPage(true)]);
          }
        }
        return result;
      },
    }),
    { name: 'arvilio/quizzes' },
  ),
);
