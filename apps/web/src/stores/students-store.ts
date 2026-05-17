'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  StudentSummaryBackendDto,
  UpdateAdminStudentRequestDto,
} from '@soenglish/shared-types';
import { STUDENTS_LIST, UPDATE_STUDENT_LANGUAGES } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type StudentsState = {
  list: AsyncSlice<StudentSummaryBackendDto[]>;
  fetchStudents: (force?: boolean) => Promise<void>;
  updateStudentAdmin: (
    studentId: string,
    input: UpdateAdminStudentRequestDto,
  ) => Promise<void>;
};

export const useStudentsStore = create<StudentsState>()(
  devtools(
    (set, get) => ({
      list: createIdleSlice<StudentSummaryBackendDto[]>(),

      fetchStudents: async (force = false) => {
        const prev = get().list;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ list: sliceLoading(prev) }, false, 'students/fetch:start');
        try {
          const data = await graphqlRequest<{ students: StudentSummaryBackendDto[] }>(
            STUDENTS_LIST,
          );
          set({ list: sliceSuccess(prev, data.students) }, false, 'students/fetch:success');
        } catch (error) {
          set({ list: sliceError(prev, error) }, false, 'students/fetch:error');
        }
      },

      updateStudentAdmin: async (studentId, input) => {
        await graphqlRequest(UPDATE_STUDENT_LANGUAGES, { studentId, input });
        await get().fetchStudents(true);
      },
    }),
    { name: 'soenglish/students' },
  ),
);
