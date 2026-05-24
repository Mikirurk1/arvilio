import type { ScheduledLessonDto } from '@pkg/types';
import { getPlannedLessonsInSeries } from '../../lib/lesson-series';
import { getLessonBackendId } from './scheduledLessonsBackendAdapter';

/** Deletes planned scheduled lessons that share `seriesId` (API + caller updates local state). */
export async function deleteScheduledLessonSeries(params: {
  lessons: ScheduledLessonDto[];
  seriesId: string;
  canManage: boolean;
  deleteScheduledLesson: (backendId: string) => Promise<void>;
}): Promise<{ removedIds: number[] }> {
  const inSeries = getPlannedLessonsInSeries(params.lessons, params.seriesId);
  const removedIds = inSeries.map((lesson) => lesson.id);

  if (params.canManage) {
    const backendIds = inSeries
      .map((lesson) => getLessonBackendId(lesson))
      .filter((id): id is string => Boolean(id));
    await Promise.all(backendIds.map((id) => params.deleteScheduledLesson(id)));
  }

  return { removedIds };
}
