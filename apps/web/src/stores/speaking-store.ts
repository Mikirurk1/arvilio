'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CreateSpeakingTopicRequestDto,
  ReviewSpeakingSubmissionRequestDto,
  SpeakingSubmissionDto,
  SpeakingTopicCardDto,
  SubmitSpeakingRecordingRequestDto,
} from '@pkg/types';
import {
  CREATE_SPEAKING_TOPIC,
  DELETE_SPEAKING_TOPIC,
  MY_SPEAKING_TOPICS,
  REVIEW_SPEAKING_SUBMISSION,
  STUDENT_SPEAKING_SUBMISSIONS,
  STUDENT_SPEAKING_TOPICS,
  SUBMIT_SPEAKING_RECORDING,
} from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type SpeakingState = {
  myTopics: AsyncSlice<SpeakingTopicCardDto[]>;
  studentTopics: AsyncSlice<SpeakingTopicCardDto[]>;
  studentTopicsStudentId: string | null;
  studentSubmissions: AsyncSlice<SpeakingSubmissionDto[]>;
  studentSubmissionsStudentId: string | null;
  creating: boolean;
  createError: string | null;
  fetchMyTopics: (force?: boolean) => Promise<void>;
  fetchStudentTopics: (studentId: string, force?: boolean) => Promise<void>;
  fetchStudentSubmissions: (studentId: string, force?: boolean) => Promise<void>;
  createTopic: (body: CreateSpeakingTopicRequestDto) => Promise<SpeakingTopicCardDto>;
  deleteTopic: (topicId: string, studentId?: string) => Promise<void>;
  submitRecording: (body: SubmitSpeakingRecordingRequestDto) => Promise<SpeakingSubmissionDto>;
  reviewSubmission: (body: ReviewSpeakingSubmissionRequestDto) => Promise<SpeakingSubmissionDto>;
};

export const useSpeakingStore = create<SpeakingState>()(
  devtools(
    (set, get) => ({
      myTopics: createIdleSlice<SpeakingTopicCardDto[]>(),
      studentTopics: createIdleSlice<SpeakingTopicCardDto[]>(),
      studentTopicsStudentId: null,
      studentSubmissions: createIdleSlice<SpeakingSubmissionDto[]>(),
      studentSubmissionsStudentId: null,
      creating: false,
      createError: null,

      fetchMyTopics: async (force = false) => {
        const prev = get().myTopics;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ myTopics: sliceLoading(prev) }, false, 'speaking/my:start');
        try {
          const data = await graphqlRequest<{ mySpeakingTopics: SpeakingTopicCardDto[] }>(
            MY_SPEAKING_TOPICS,
          );
          set({ myTopics: sliceSuccess(prev, data.mySpeakingTopics) }, false, 'speaking/my:success');
        } catch (error) {
          set({ myTopics: sliceError(prev, error) }, false, 'speaking/my:error');
        }
      },

      fetchStudentTopics: async (studentId, force = false) => {
        const prev = get().studentTopics;
        if (
          !force &&
          get().studentTopicsStudentId === studentId &&
          prev.status === 'success' &&
          prev.data
        ) {
          return;
        }
        set(
          { studentTopics: sliceLoading(prev), studentTopicsStudentId: studentId },
          false,
          'speaking/studentTopics:start',
        );
        try {
          const data = await graphqlRequest<{ studentSpeakingTopics: SpeakingTopicCardDto[] }>(
            STUDENT_SPEAKING_TOPICS,
            { studentId },
          );
          set(
            {
              studentTopics: sliceSuccess(prev, data.studentSpeakingTopics),
              studentTopicsStudentId: studentId,
            },
            false,
            'speaking/studentTopics:success',
          );
        } catch (error) {
          set({ studentTopics: sliceError(prev, error) }, false, 'speaking/studentTopics:error');
        }
      },

      fetchStudentSubmissions: async (studentId, force = false) => {
        const prev = get().studentSubmissions;
        if (
          !force &&
          get().studentSubmissionsStudentId === studentId &&
          prev.status === 'success' &&
          prev.data
        ) {
          return;
        }
        set(
          { studentSubmissions: sliceLoading(prev), studentSubmissionsStudentId: studentId },
          false,
          'speaking/submissions:start',
        );
        try {
          const data = await graphqlRequest<{ studentSpeakingSubmissions: SpeakingSubmissionDto[] }>(
            STUDENT_SPEAKING_SUBMISSIONS,
            { studentId },
          );
          set(
            {
              studentSubmissions: sliceSuccess(prev, data.studentSpeakingSubmissions),
              studentSubmissionsStudentId: studentId,
            },
            false,
            'speaking/submissions:success',
          );
        } catch (error) {
          set({ studentSubmissions: sliceError(prev, error) }, false, 'speaking/submissions:error');
        }
      },

      createTopic: async (body) => {
        set({ creating: true, createError: null }, false, 'speaking/create:start');
        try {
          const data = await graphqlRequest<{ createSpeakingTopic: SpeakingTopicCardDto }>(
            CREATE_SPEAKING_TOPIC,
            { input: body },
          );
          const created = data.createSpeakingTopic;
          const myPrev = get().myTopics;
          if (myPrev.status === 'success' && myPrev.data) {
            set({
              myTopics: sliceSuccess(myPrev, [created, ...myPrev.data]),
            });
          }
          if (body.studentId) {
            const studentPrev = get().studentTopics;
            if (
              studentPrev.status === 'success' &&
              studentPrev.data &&
              get().studentTopicsStudentId === body.studentId
            ) {
              set({
                studentTopics: sliceSuccess(studentPrev, [created, ...studentPrev.data]),
              });
            }
          }
          set({ creating: false }, false, 'speaking/create:success');
          return created;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create topic';
          set({ creating: false, createError: message }, false, 'speaking/create:error');
          throw error;
        }
      },

      deleteTopic: async (topicId, studentId) => {
        await graphqlRequest(DELETE_SPEAKING_TOPIC, { id: topicId });
        const myPrev = get().myTopics;
        if (myPrev.status === 'success' && myPrev.data) {
          set({
            myTopics: sliceSuccess(
              myPrev,
              myPrev.data.filter((topic) => topic.id !== topicId),
            ),
          });
        }
        if (studentId) {
          const studentPrev = get().studentTopics;
          if (studentPrev.status === 'success' && studentPrev.data) {
            set({
              studentTopics: sliceSuccess(
                studentPrev,
                studentPrev.data.filter((topic) => topic.id !== topicId),
              ),
            });
          }
        }
      },

      submitRecording: async (body) => {
        const data = await graphqlRequest<{ submitSpeakingRecording: SpeakingSubmissionDto }>(
          SUBMIT_SPEAKING_RECORDING,
          { input: body },
        );
        return data.submitSpeakingRecording;
      },

      reviewSubmission: async (body) => {
        const data = await graphqlRequest<{ reviewSpeakingSubmission: SpeakingSubmissionDto }>(
          REVIEW_SPEAKING_SUBMISSION,
          { input: body },
        );
        const updated = data.reviewSpeakingSubmission;
        const prev = get().studentSubmissions;
        if (prev.status === 'success' && prev.data) {
          set({
            studentSubmissions: sliceSuccess(
              prev,
              prev.data.map((row) => (row.id === updated.id ? updated : row)),
            ),
          });
        }
        return updated;
      },
    }),
    { name: 'speaking-store' },
  ),
);
