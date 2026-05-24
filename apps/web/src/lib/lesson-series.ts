import { LESSON_STATUS, type ScheduledLessonDto } from '@pkg/types';

/** Lessons sharing the same `seriesId`. */
export function getLessonsInSeries(
  lessons: ScheduledLessonDto[],
  seriesId: string,
): ScheduledLessonDto[] {
  return lessons.filter((lesson) => lesson.seriesId === seriesId);
}

/** Series members that are still `planned` (only these are removed by delete-series). */
export function getPlannedLessonsInSeries(
  lessons: ScheduledLessonDto[],
  seriesId: string,
): ScheduledLessonDto[] {
  return getLessonsInSeries(lessons, seriesId).filter(
    (lesson) => lesson.statusId === LESSON_STATUS.planned.id,
  );
}

/** Copy schedule (and shared setup fields) from the edited lesson onto one series member. */
export function applySeriesFieldsFromCandidate(
  lesson: ScheduledLessonDto,
  candidate: ScheduledLessonDto,
): ScheduledLessonDto {
  return {
    ...lesson,
    title: candidate.title,
    startTime: candidate.startTime,
    endTime: candidate.endTime,
    duration: candidate.duration,
    timezoneId: candidate.timezoneId,
    notes: candidate.notes,
    statusId: candidate.statusId,
    cancelReason: candidate.cancelReason,
    credited: candidate.credited,
  };
}

/** Lesson plan, materials, homework, and vocabulary apply only to the lesson being edited. */
export function applyLessonContentFromCandidate(
  lesson: ScheduledLessonDto,
  candidate: ScheduledLessonDto,
): ScheduledLessonDto {
  return {
    ...lesson,
    description: candidate.description,
    lessonPlan: candidate.lessonPlan,
    materials: candidate.materials,
    homework: candidate.homework,
    studentResponse: candidate.studentResponse,
    linkedWordIds: candidate.linkedWordIds,
  };
}

/** Lessons to save when editing — one row or the whole series (when still linked). */
export function buildLessonSeriesUpdates(
  lessons: ScheduledLessonDto[],
  editingLesson: ScheduledLessonDto | null,
  candidate: ScheduledLessonDto,
): ScheduledLessonDto[] {
  if (!editingLesson) return [candidate];
  if (!editingLesson.seriesId) {
    return [
      {
        ...candidate,
        id: editingLesson.id,
        backendId: editingLesson.backendId,
        date: candidate.date,
        seriesId: editingLesson.seriesId,
      },
    ];
  }
  return getLessonsInSeries(lessons, editingLesson.seriesId).map((lesson) => {
    const withSchedule = applySeriesFieldsFromCandidate(lesson, candidate);
    if (lesson.id !== editingLesson.id) return withSchedule;
    return applyLessonContentFromCandidate(withSchedule, candidate);
  });
}

/** Same wall-clock time/duration on each series member; dates unchanged. */
export function applySeriesTimeFromSource(
  member: ScheduledLessonDto,
  source: ScheduledLessonDto,
): ScheduledLessonDto {
  return {
    ...member,
    startTime: source.startTime,
    endTime: source.endTime,
    duration: source.duration,
    timezoneId: source.timezoneId,
  };
}

export function buildSeriesTimeUpdates(
  lessons: ScheduledLessonDto[],
  sourceLesson: ScheduledLessonDto,
  nextSchedule: Pick<ScheduledLessonDto, 'startTime' | 'endTime' | 'duration' | 'timezoneId'>,
): ScheduledLessonDto[] {
  if (!sourceLesson.seriesId) {
    return [{ ...sourceLesson, ...nextSchedule }];
  }
  return getLessonsInSeries(lessons, sourceLesson.seriesId).map((member) =>
    applySeriesTimeFromSource(member, { ...sourceLesson, ...nextSchedule }),
  );
}

export function unlinkLessonFields(
  _lesson: ScheduledLessonDto,
): Pick<ScheduledLessonDto, 'seriesId' | 'recurrence' | 'weeklyDays'> {
  return {
    seriesId: undefined,
    recurrence: 'none',
    weeklyDays: [],
  };
}
