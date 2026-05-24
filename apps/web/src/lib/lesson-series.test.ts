import { LESSON_STATUS, TIME_ZONE, type LessonStatusId, type ScheduledLessonDto } from '@pkg/types';
import { mockScheduledLesson } from '../testing/fixtures';
import {
  applyLessonContentFromCandidate,
  applySeriesFieldsFromCandidate,
  applySeriesTimeFromSource,
  buildLessonSeriesUpdates,
  buildSeriesTimeUpdates,
  getLessonsInSeries,
  getPlannedLessonsInSeries,
  unlinkLessonFields,
} from './lesson-series';

function lesson(id: number, seriesId: string | null, statusId: LessonStatusId): ScheduledLessonDto {
  return mockScheduledLesson({
    id,
    title: `L${id}`,
    seriesId: seriesId ?? undefined,
    statusId,
  });
}

describe('lesson-series', () => {
  const lessons = [
    lesson(1, 'series-a', LESSON_STATUS.planned.id),
    lesson(2, 'series-a', LESSON_STATUS.completed.id),
    lesson(3, 'series-b', LESSON_STATUS.planned.id),
  ];

  it('getLessonsInSeries filters by seriesId', () => {
    expect(getLessonsInSeries(lessons, 'series-a')).toHaveLength(2);
  });

  it('getPlannedLessonsInSeries keeps only planned', () => {
    expect(getPlannedLessonsInSeries(lessons, 'series-a')).toHaveLength(1);
  });

  it('applySeriesFieldsFromCandidate copies schedule fields', () => {
    const base = lessons[0]!;
    const candidate = { ...base, title: 'Updated', startTime: '12:00' };
    expect(applySeriesFieldsFromCandidate(base, candidate).title).toBe('Updated');
    expect(applySeriesFieldsFromCandidate(base, candidate).startTime).toBe('12:00');
  });

  it('buildLessonSeriesUpdates returns single candidate when no editing lesson', () => {
    const candidate = lessons[0]!;
    expect(buildLessonSeriesUpdates(lessons, null, candidate)).toEqual([candidate]);
  });

  it('buildLessonSeriesUpdates applies content only to edited lesson in series', () => {
    const editing = { ...lessons[0]!, seriesId: 'series-a', lessonPlan: 'Old' };
    const sibling = { ...lessons[1]!, seriesId: 'series-a', lessonPlan: 'Sibling' };
    const all = [editing, sibling];
    const candidate = { ...editing, title: 'New title', lessonPlan: 'New plan' };
    const updates = buildLessonSeriesUpdates(all, editing, candidate);
    expect(updates.find((u) => u.id === editing.id)?.lessonPlan).toBe('New plan');
    expect(updates.find((u) => u.id === sibling.id)?.lessonPlan).toBe('Sibling');
    expect(updates.find((u) => u.id === sibling.id)?.title).toBe('New title');
  });

  it('applyLessonContentFromCandidate copies materials and homework', () => {
    const base = lessons[0]!;
    const candidate = {
      ...base,
      lessonPlan: 'Plan',
      materials: [{ id: 'm1', kind: 'text' as const, text: 'x', files: [] }],
      homework: { text: 'HW', files: [] },
    };
    const updated = applyLessonContentFromCandidate(base, candidate);
    expect(updated.lessonPlan).toBe('Plan');
    expect(updated.homework?.text).toBe('HW');
  });

  it('applySeriesTimeFromSource copies wall-clock fields', () => {
    const member = lessons[0]!;
    const source = { ...member, startTime: '14:00', endTime: '15:00', duration: 60 };
    expect(applySeriesTimeFromSource(member, source).startTime).toBe('14:00');
  });

  it('unlinkLessonFields clears series', () => {
    expect(unlinkLessonFields(lessons[0]!)).toEqual({
      seriesId: undefined,
      recurrence: 'none',
      weeklyDays: [],
    });
  });

  it('buildSeriesTimeUpdates applies schedule to series', () => {
    const withSeries = { ...lessons[0]!, seriesId: 'series-a' };
    const all = [withSeries, { ...withSeries, id: 2 }];
    const updates = buildSeriesTimeUpdates(all, withSeries, {
      startTime: '15:00',
      endTime: '16:00',
      duration: 60,
      timezoneId: TIME_ZONE.kyiv.id,
    });
    expect(updates.every((u) => u.startTime === '15:00')).toBe(true);
  });
});
