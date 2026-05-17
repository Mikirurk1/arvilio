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
} from '@soenglish/shared-types';
import { normalizeQuizQuestions } from '../lib/quiz-questions';
import {
  DELETE_QUIZ,
  GENERATE_QUIZ,
  QUIZ_DETAIL,
  QUIZZES_LIST,
  STUDENT_QUIZZES,
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

type QuizzesState = {
  list: AsyncSlice<QuizCardDto[]>;
  studentQuizzes: AsyncSlice<StudentQuizCardDto[]>;
  studentQuizzesStudentId: string | null;
  generating: boolean;
  generateError: string | null;
  fetchList: (force?: boolean) => Promise<void>;
  fetchStudentQuizzes: (studentId: string, force?: boolean) => Promise<void>;
  fetchQuiz: (quizId: string) => Promise<QuizDetailDto>;
  generateQuiz: (body: GenerateQuizRequestDto) => Promise<QuizDetailDto>;
  deleteQuiz: (quizId: string, studentId?: string) => Promise<void>;
  submitQuizAttempt: (body: SubmitQuizAttemptRequestDto) => Promise<QuizAttemptResultDto>;
};

export const useQuizzesStore = create<QuizzesState>()(
  devtools(
    (set, get) => ({
      list: createIdleSlice<QuizCardDto[]>(),
      studentQuizzes: createIdleSlice<StudentQuizCardDto[]>(),
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
          const data = await graphqlRequest<{
            generateQuiz: Omit<QuizDetailDto, 'questionCount' | 'createdAt'> & {
              questions: QuizDetailDto['questions'];
            };
          }>(GENERATE_QUIZ, {
            input: body,
          });
          const detail: QuizDetailDto = {
            ...data.generateQuiz,
            questionCount: data.generateQuiz.questions.length,
            createdAt: new Date().toISOString(),
            questions: normalizeQuizQuestions(data.generateQuiz.questions),
          };
          await get().fetchList(true);
          if (body.studentId) {
            await get().fetchStudentQuizzes(body.studentId, true);
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
        await get().fetchList(true);
        if (studentId) {
          await get().fetchStudentQuizzes(studentId, true);
        }
      },

      submitQuizAttempt: async (body) => {
        const data = await graphqlRequest<{ submitQuizAttempt: QuizAttemptResultDto }>(
          SUBMIT_QUIZ_ATTEMPT,
          { input: body },
        );
        if (!body.practiceMode && body.studentId) {
          await get().fetchStudentQuizzes(body.studentId, true);
        }
        return data.submitQuizAttempt;
      },
    }),
    { name: 'soenglish/quizzes' },
  ),
);
