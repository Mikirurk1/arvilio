import type {
  CreateScheduledLessonRequestDto,
  ScheduledLessonDto,
  UpdateScheduledLessonRequestDto,
} from '@pkg/types';
import { getIanaForTimeZoneId } from '../../lib/lessonTime';
import { ApiError } from '../../lib/api';
import { GraphqlError } from '../../lib/graphql-client';
import {
  fromLessonFormState,
  nextLessonEntityId,
} from '../calendar/adapters/lessonCalendarAdapter';
import type { LessonFormState } from './types';
import { partyStringId, statusFromId } from './scheduledLessonsBackendAdapter';
import type { LessonPartyOption } from '../../hooks/use-lesson-party-options';

function mapLessonContentFields(lesson: ScheduledLessonDto) {
  return {
    materials: (lesson.materials ?? []).map((material) => ({
      kind: material.kind,
      text: material.text ?? '',
      files: material.files ?? [],
    })),
    homework: {
      text: lesson.homework?.text ?? '',
      files: lesson.homework?.files ?? [],
    },
    studentResponse: {
      text: lesson.studentResponse?.text ?? '',
      files: lesson.studentResponse?.files ?? [],
      status: lesson.studentResponse?.status ?? 'not_submitted',
      homeworkChecked: lesson.studentResponse?.homeworkChecked ?? false,
      teacherHomeworkFeedback: lesson.studentResponse?.teacherHomeworkFeedback ?? '',
    },
  };
}

function mapLessonContentFieldsForCreate(
  lesson: ScheduledLessonDto,
): Partial<ReturnType<typeof mapLessonContentFields>> {
  if (!lessonHasPersistableContent(lesson)) return {};
  return mapLessonContentFields(lesson);
}

export function lessonHasPersistableContent(lesson: ScheduledLessonDto): boolean {
  if (lesson.lessonPlan?.trim()) return true;
  if ((lesson.materials?.length ?? 0) > 0) return true;
  if (lesson.homework?.text?.trim()) return true;
  if ((lesson.homework?.files?.length ?? 0) > 0) return true;
  return false;
}

export function resolvePartyBackendId(
  numericId: number,
  studentOptions: LessonPartyOption[],
  teacherOptions: LessonPartyOption[],
): string | undefined {
  const mapped = partyStringId(numericId);
  if (mapped) return mapped;
  return (
    studentOptions.find((row) => row.id === numericId)?.backendId ??
    teacherOptions.find((row) => row.id === numericId)?.backendId
  );
}

export function toCreateScheduledLessonBody(
  lesson: ScheduledLessonDto,
  resolvePartyId: (numericId: number) => string | undefined,
): CreateScheduledLessonRequestDto | null {
  const studentId = resolvePartyId(lesson.studentId);
  if (!studentId) return null;
  const teacherId = resolvePartyId(lesson.teacherId);
  return {
    title: lesson.title,
    description: lesson.description,
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    duration: lesson.duration,
    timezone: getIanaForTimeZoneId(lesson.timezoneId),
    teacherId: teacherId ?? undefined,
    studentId,
    status: statusFromId(lesson.statusId),
    notes: lesson.notes,
    lessonPlan: lesson.lessonPlan,
    recurrence: lesson.recurrence,
    weeklyDays: lesson.weeklyDays,
    seriesId: lesson.seriesId,
    linkedWordIds: lesson.linkedWordIds?.length ? [...lesson.linkedWordIds] : undefined,
    ...mapLessonContentFieldsForCreate(lesson),
  };
}

export function toUpdateScheduledLessonBody(
  lesson: ScheduledLessonDto,
  options?: { includeLessonContent?: boolean },
): UpdateScheduledLessonRequestDto {
  const includeLessonContent = options?.includeLessonContent ?? true;
  return {
    title: lesson.title,
    description: lesson.description,
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    duration: lesson.duration,
    timezone: getIanaForTimeZoneId(lesson.timezoneId),
    status: statusFromId(lesson.statusId),
    notes: lesson.notes,
    lessonPlan: lesson.lessonPlan,
    recurrence: lesson.recurrence,
    weeklyDays: lesson.weeklyDays,
    seriesId: lesson.seriesId ?? undefined,
    linkedWordIds: lesson.linkedWordIds?.length ? [...lesson.linkedWordIds] : undefined,
    ...(includeLessonContent ? mapLessonContentFields(lesson) : {}),
  };
}

/** Keep lesson content from API (`lesson`); overlay display names from local `source`. */
export function mergeLessonDisplayNames(
  lesson: ScheduledLessonDto,
  source: ScheduledLessonDto,
): ScheduledLessonDto {
  return {
    ...lesson,
    teacherName: source.teacherName || lesson.teacherName,
    studentName: source.studentName || lesson.studentName,
    description: source.description ?? lesson.description,
  };
}

export function buildLessonCandidate(
  form: LessonFormState,
  lessons: ScheduledLessonDto[],
  editingLesson: ScheduledLessonDto | null,
): ScheduledLessonDto {
  const seq = nextLessonEntityId(lessons);
  return fromLessonFormState(form, editingLesson ?? undefined, editingLesson ? undefined : seq);
}

export function persistenceErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof GraphqlError) {
    const fromErrors = error.errors?.[0]?.message?.trim();
    if (fromErrors) return fromErrors;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Failed to save lesson';
}

export function isGoogleCalendarRequiredError(error: unknown): boolean {
  const message = persistenceErrorMessage(error);
  return message.includes('sign in with Google') && message.includes('Calendar');
}
