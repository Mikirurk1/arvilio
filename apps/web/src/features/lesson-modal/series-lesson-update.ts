import type { ScheduledLessonDto } from '@pkg/types';
import type { Dispatch, SetStateAction } from 'react';
import { buildLessonSeriesUpdates, buildSeriesTimeUpdates } from '../../lib/lesson-series';
import {
  findPastSlotsInUpdates,
  findScheduleConflictsForUpdates,
  type ScheduleConflict,
} from '../calendar/rules/conflicts';
import { upsertScheduledLesson } from './scheduledLessonsBackendAdapter';

type ConflictStrategy = 'any-overlap' | 'same-teacher-overlap';

export type ScheduleUpdateValidation =
  | { ok: true; updates: ScheduledLessonDto[] }
  | { ok: false; conflicts: ScheduleConflict[]; past: ScheduledLessonDto[] };

export function validateLessonScheduleUpdates(
  lessons: ScheduledLessonDto[],
  editingLesson: ScheduledLessonDto | null,
  candidate: ScheduledLessonDto,
  strategy: ConflictStrategy = 'any-overlap',
): ScheduleUpdateValidation {
  const updates = buildLessonSeriesUpdates(lessons, editingLesson, candidate);
  const past = findPastSlotsInUpdates(updates);
  if (past.length > 0) return { ok: false, conflicts: [], past };
  const conflicts = findScheduleConflictsForUpdates(lessons, updates, strategy);
  if (conflicts.length > 0) return { ok: false, conflicts, past: [] };
  return { ok: true, updates };
}

export function validateSeriesTimeUpdates(
  lessons: ScheduledLessonDto[],
  sourceLesson: ScheduledLessonDto,
  nextSchedule: Pick<ScheduledLessonDto, 'startTime' | 'endTime' | 'duration' | 'timezoneId'>,
  strategy: ConflictStrategy = 'any-overlap',
): ScheduleUpdateValidation {
  const updates = buildSeriesTimeUpdates(lessons, sourceLesson, nextSchedule);
  const past = findPastSlotsInUpdates(updates);
  if (past.length > 0) return { ok: false, conflicts: [], past };
  const conflicts = findScheduleConflictsForUpdates(lessons, updates, strategy);
  if (conflicts.length > 0) return { ok: false, conflicts, past: [] };
  return { ok: true, updates };
}

export async function persistLessonSeriesUpdates(params: {
  updates: ScheduledLessonDto[];
  lessons: ScheduledLessonDto[];
  persistUpdate: (
    candidate: ScheduledLessonDto,
    editingLesson: ScheduledLessonDto,
    options?: { includeLessonContent?: boolean },
  ) => Promise<ScheduledLessonDto | null>;
  setLessons: Dispatch<SetStateAction<ScheduledLessonDto[]>>;
  includeLessonContent?: boolean;
  primaryLessonId?: number;
}): Promise<ScheduledLessonDto | null> {
  let primary: ScheduledLessonDto | null = null;
  let matchedPrimary: ScheduledLessonDto | null = null;

  for (const update of params.updates) {
    const original = params.lessons.find((lesson) => lesson.id === update.id);
    if (!original) continue;
    const persisted = await params.persistUpdate(update, original, {
      includeLessonContent: params.includeLessonContent,
    });
    if (!persisted) continue;
    params.setLessons((prev) => upsertScheduledLesson(prev, persisted));
    if (params.primaryLessonId !== undefined && persisted.id === params.primaryLessonId) {
      matchedPrimary = persisted;
    }
    if (!primary) primary = persisted;
  }

  return matchedPrimary ?? primary;
}

export async function persistSeriesScheduleChanges(params: {
  updates: ScheduledLessonDto[];
  lessons: ScheduledLessonDto[];
  persistScheduleUpdate: (
    candidate: ScheduledLessonDto,
    editingLesson: ScheduledLessonDto,
  ) => Promise<ScheduledLessonDto | null>;
  setLessons: Dispatch<SetStateAction<ScheduledLessonDto[]>>;
}): Promise<void> {
  for (const update of params.updates) {
    const original = params.lessons.find((lesson) => lesson.id === update.id);
    if (!original) continue;
    const persisted = await params.persistScheduleUpdate(update, original);
    if (!persisted) continue;
    params.setLessons((prev) => upsertScheduledLesson(prev, persisted));
  }
}

export function applyLessonSeriesUpdatesLocally(
  lessons: ScheduledLessonDto[],
  updates: ScheduledLessonDto[],
): ScheduledLessonDto[] {
  const byId = new Map(updates.map((lesson) => [lesson.id, lesson]));
  return lessons.map((lesson) => byId.get(lesson.id) ?? lesson);
}
