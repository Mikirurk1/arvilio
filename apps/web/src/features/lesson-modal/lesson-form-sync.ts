import type { Dispatch, SetStateAction } from 'react';
import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { fromLessonFormState } from '../calendar/adapters/lessonCalendarAdapter';
import { upsertScheduledLesson } from './scheduledLessonsBackendAdapter';
import type { LessonFormState } from './types';

/** Keep modal form edits in the scheduled-lessons list so lesson pages see content before the next save. */
export function syncLessonFormChange(
  next: LessonFormState,
  editingLesson: ScheduledLessonDto | null,
  setForm: (value: LessonFormState) => void,
  setLessons: Dispatch<SetStateAction<ScheduledLessonDto[]>>,
  setEditingLesson?: Dispatch<SetStateAction<ScheduledLessonDto | null>>,
) {
  setForm(next);
  if (!editingLesson) return;
  const candidate = fromLessonFormState(next, editingLesson);
  setLessons((prev) => upsertScheduledLesson(prev, candidate));
  setEditingLesson?.(candidate);
}
