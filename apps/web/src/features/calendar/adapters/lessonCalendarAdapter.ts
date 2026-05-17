import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { LESSON_STATUS, TIME_ZONE } from '@soenglish/shared-types';
import type { LessonFormState } from '../../lesson-modal/types';

export function nextLessonEntityId(lessons: ScheduledLessonDto[]): number {
  let max = 0;
  for (const l of lessons) {
    if (l.id > max) max = l.id;
  }
  return max + 1;
}

export function calculateEndTime(startTime: string, duration: number): string {
  const [hour, minute] = startTime.split(':').map(Number);
  const total = hour * 60 + minute + duration;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function toLessonFormState(lesson: ScheduledLessonDto): LessonFormState {
  return {
    title: lesson.title,
    date: lesson.date,
    startTime: lesson.startTime,
    timezoneId: lesson.timezoneId ?? TIME_ZONE.kyiv.id,
    duration: lesson.duration,
    teacherId: lesson.teacherId,
    teacherName: lesson.teacherName,
    studentId: lesson.studentId,
    studentName: lesson.studentName,
    notes: lesson.notes ?? '',
    lessonPlan: lesson.lessonPlan ?? '',
    materials:
      lesson.materials?.map((material) => ({
        ...material,
        kind: material.kind ?? 'text',
      })) ?? [],
    homeworkText: lesson.homework?.text ?? '',
    homeworkFiles: lesson.homework?.files ?? [],
    studentResponseText: lesson.studentResponse?.text ?? '',
    studentResponseFiles: lesson.studentResponse?.files ?? [],
    studentResponseStatus: lesson.studentResponse?.status ?? 'not_submitted',
    homeworkChecked: lesson.studentResponse?.homeworkChecked ?? false,
    teacherHomeworkFeedback: lesson.studentResponse?.teacherHomeworkFeedback ?? '',
    statusId: lesson.statusId,
    cancelReason: lesson.cancelReason,
    credited: lesson.credited,
    recurrence: lesson.recurrence,
    weeklyDays: lesson.weeklyDays ?? [],
    applyToSeries: false,
    linkedWordIds: [...(lesson.linkedWordIds ?? [])],
  };
}

export function fromLessonFormState(
  form: LessonFormState,
  existing?: ScheduledLessonDto,
  newLessonId?: number,
): ScheduledLessonDto {
  return {
    id: existing?.id ?? newLessonId ?? Date.now(),
    backendId: existing?.backendId,
    lessonId: existing?.lessonId,
    title: form.title,
    date: form.date,
    startTime: form.startTime,
    endTime: calculateEndTime(form.startTime, form.duration),
    duration: form.duration,
    timezoneId: form.timezoneId ?? existing?.timezoneId ?? TIME_ZONE.kyiv.id,
    teacherId: form.teacherId,
    teacherName: form.teacherName,
    studentId: form.studentId,
    studentName: form.studentName,
    statusId: form.statusId,
    cancelReason:
      form.statusId === LESSON_STATUS.cancelled.id
        ? form.cancelReason
        : undefined,
    credited: form.credited,
    notes: form.notes,
    description: existing?.description,
    lessonPlan: form.lessonPlan,
    materials: form.materials,
    homework: {
      text: form.homeworkText,
      files: form.homeworkFiles,
    },
    studentResponse: {
      text: form.studentResponseText,
      files: form.studentResponseFiles,
      status: form.studentResponseStatus,
      homeworkChecked: form.homeworkChecked,
      teacherHomeworkFeedback: form.teacherHomeworkFeedback,
    },
    order: existing?.order ?? 1,
    recurrence: form.recurrence,
    weeklyDays: form.recurrence === 'weekly' ? form.weeklyDays : [],
    seriesId: existing?.seriesId ?? (form.recurrence !== 'none' ? `series-${Date.now()}` : undefined),
    linkedWordIds: form.linkedWordIds.length > 0 ? [...form.linkedWordIds] : undefined,
  };
}

