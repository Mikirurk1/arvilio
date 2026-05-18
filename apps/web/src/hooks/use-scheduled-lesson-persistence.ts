'use client';

import { useCallback } from 'react';
import type { ScheduledLessonDto } from '@soenglish/shared-types';
import {
  hydrateLessonPartyNames,
  fromBackendLesson,
  getLessonBackendId,
} from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import {
  lessonHasPersistableContent,
  mergeLessonDisplayNames,
  persistenceErrorMessage,
  resolvePartyBackendId,
  toCreateScheduledLessonBody,
  toUpdateScheduledLessonBody,
} from '../features/lesson-modal/lessonPersistence';
import { useLessonPartyOptions } from './use-lesson-party-options';
import { useLessonsStore } from '../stores/lessons-store';

export function useScheduledLessonPersistence() {
  const createScheduledLesson = useLessonsStore((s) => s.createScheduledLesson);
  const updateScheduledLesson = useLessonsStore((s) => s.updateScheduledLesson);
  const { studentOptions, teacherOptions, nameByNumericId } = useLessonPartyOptions();

  const resolvePartyId = useCallback(
    (numericId: number) => resolvePartyBackendId(numericId, studentOptions, teacherOptions),
    [studentOptions, teacherOptions],
  );

  const adaptPersisted = useCallback(
    (backend: Parameters<typeof fromBackendLesson>[0], source: ScheduledLessonDto) =>
      mergeLessonDisplayNames(
        hydrateLessonPartyNames([fromBackendLesson(backend)], nameByNumericId)[0],
        source,
      ),
    [nameByNumericId],
  );

  const persistCreate = useCallback(
    async (candidate: ScheduledLessonDto) => {
      const body = toCreateScheduledLessonBody(candidate, resolvePartyId);
      if (!body) {
        throw new Error('Select a valid student and teacher.');
      }
      const created = await createScheduledLesson(body);
      let result = adaptPersisted(created, candidate);
      const backendId = getLessonBackendId(result);
      if (backendId && lessonHasPersistableContent(candidate)) {
        const updated = await updateScheduledLesson(
          backendId,
          toUpdateScheduledLessonBody({ ...candidate, backendId }),
        );
        result = adaptPersisted(updated, candidate);
      }
      return result;
    },
    [adaptPersisted, createScheduledLesson, resolvePartyId, updateScheduledLesson],
  );

  const persistUpdate = useCallback(
    async (
      candidate: ScheduledLessonDto,
      editingLesson: ScheduledLessonDto,
      options?: { includeLessonContent?: boolean },
    ) => {
      const backendId = getLessonBackendId(editingLesson);
      if (!backendId) return null;
      const updated = await updateScheduledLesson(
        backendId,
        toUpdateScheduledLessonBody(candidate, {
          includeLessonContent: options?.includeLessonContent ?? true,
        }),
      );
      return adaptPersisted(updated, candidate);
    },
    [adaptPersisted, updateScheduledLesson],
  );

  const persistScheduleUpdate = useCallback(
    async (candidate: ScheduledLessonDto, editingLesson: ScheduledLessonDto) =>
      persistUpdate(candidate, editingLesson, { includeLessonContent: false }),
    [persistUpdate],
  );

  return {
    persistCreate,
    persistUpdate,
    persistScheduleUpdate,
    persistenceErrorMessage,
  };
}
