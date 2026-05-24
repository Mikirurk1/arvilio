import type { ScheduledLessonDto } from '@pkg/types';
import type { Dispatch, SetStateAction } from 'react';
import { effectiveWeeklyDays, expandRecurrenceDates } from '../../lib/lesson-recurrence';
import { hasTimeConflict, isPastSlot } from '../calendar/rules/conflicts';
import { upsertScheduledLesson } from './scheduledLessonsBackendAdapter';
import type { LessonFormState } from './types';

type ConflictStrategy = 'any-overlap' | 'same-teacher-overlap';

export async function createRecurringLessons(params: {
  form: Pick<LessonFormState, 'recurrence' | 'weeklyDays' | 'date'>;
  candidate: ScheduledLessonDto;
  lessons: ScheduledLessonDto[];
  persistCreate: (candidate: ScheduledLessonDto) => Promise<ScheduledLessonDto>;
  setLessons: Dispatch<SetStateAction<ScheduledLessonDto[]>>;
  onLessonCreated?: (lesson: ScheduledLessonDto) => void;
  conflictStrategy?: ConflictStrategy;
}): Promise<ScheduledLessonDto | null> {
  const dates = expandRecurrenceDates(params.form.recurrence, params.form.date, params.form.weeklyDays);
  const seriesId =
    params.form.recurrence !== 'none'
      ? (params.candidate.seriesId ?? `series-${Date.now()}`)
      : undefined;
  const weeklyDays =
    params.form.recurrence === 'weekly'
      ? effectiveWeeklyDays(params.form.date, params.form.weeklyDays)
      : [];

  let first: ScheduledLessonDto | null = null;
  const strategy = params.conflictStrategy ?? 'any-overlap';

  for (const date of dates) {
    const branch: ScheduledLessonDto = {
      ...params.candidate,
      date,
      seriesId,
      recurrence: params.form.recurrence,
      weeklyDays,
    };
    if (hasTimeConflict(params.lessons, branch, undefined, strategy)) continue;
    if (isPastSlot(branch)) continue;

    const persisted = await params.persistCreate(branch);
    params.setLessons((prev) => upsertScheduledLesson(prev, persisted));
    params.onLessonCreated?.(persisted);
    if (!first) first = persisted;
  }

  return first;
}

export function applyRecurringLessonsLocally(params: {
  form: Pick<LessonFormState, 'recurrence' | 'weeklyDays' | 'date'>;
  candidate: ScheduledLessonDto;
  tryApplyLesson: (lesson: ScheduledLessonDto, source?: ScheduledLessonDto) => boolean;
  editingLesson?: ScheduledLessonDto | null;
}): void {
  const dates = expandRecurrenceDates(params.form.recurrence, params.form.date, params.form.weeklyDays);
  const seriesId = params.form.recurrence !== 'none' ? `series-${Date.now()}` : undefined;
  const weeklyDays =
    params.form.recurrence === 'weekly'
      ? effectiveWeeklyDays(params.form.date, params.form.weeklyDays)
      : [];

  dates.forEach((date, index) => {
    const branch: ScheduledLessonDto = {
      ...params.candidate,
      date,
      seriesId,
      recurrence: params.form.recurrence,
      weeklyDays,
      id: params.candidate.id + index,
    };
    params.tryApplyLesson(branch, index === 0 ? (params.editingLesson ?? undefined) : undefined);
  });
}
