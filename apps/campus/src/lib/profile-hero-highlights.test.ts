import {
  buildProfileHeroAction,
  buildStudentHeroAction,
  formatContactMetaLine,
  formatLessonWhenLabel,
  pickLastCompletedLessonDto,
  pickNextPlannedLessonDto,
  truncateEmail,
} from './profile-hero-highlights';
import { LESSON_STATUS } from '@pkg/types';
import { mockScheduledLesson, mockScheduledLessonBackend } from '../testing/fixtures';

describe('profile-hero-highlights', () => {
  it('pickNextPlannedLessonDto returns earliest upcoming planned lesson', () => {
    const lessons = [
      mockScheduledLesson({ id: 1, date: '2026-06-12', startTime: '10:00' }),
      mockScheduledLesson({ id: 2, date: '2026-06-11', startTime: '09:00' }),
    ];
    const next = pickNextPlannedLessonDto(lessons, new Date('2026-06-01').getTime());
    expect(next?.id).toBe(2);
  });

  it('pickLastCompletedLessonDto returns most recent completed lesson', () => {
    const lessons = [
      mockScheduledLesson({
        id: 1,
        statusId: LESSON_STATUS.completed.id,
        date: '2026-05-01',
      }),
      mockScheduledLesson({
        id: 2,
        statusId: LESSON_STATUS.completed.id,
        date: '2026-05-10',
      }),
    ];
    const last = pickLastCompletedLessonDto(lessons, new Date('2026-06-01').getTime());
    expect(last?.id).toBe(2);
  });

  it('formatLessonWhenLabel includes date and 12h time', () => {
    expect(formatLessonWhenLabel('2026-06-03', '14:05')).toContain('2:05 PM');
  });

  it('truncateEmail shortens long addresses', () => {
    expect(truncateEmail('verylonglocalpart@school.com')).toContain('@school.com');
  });

  it('buildProfileHeroAction prefers next lesson over vocabulary review', () => {
    const action = buildProfileHeroAction({
      lessons: [
        mockScheduledLessonBackend({
          id: 'lesson-1',
          title: 'Grammar',
          date: '2026-06-10',
          startTime: '14:00',
          endTime: '15:00',
        }),
      ],
      reviewCount: 5,
      isStudent: true,
      now: new Date('2026-06-01').getTime(),
    });
    expect(action?.href).toBe('/lessons/lesson-1');
    expect(action?.tone).toBe('blue');
  });

  it('buildProfileHeroAction falls back to vocabulary review for students', () => {
    const action = buildProfileHeroAction({
      lessons: [],
      reviewCount: 3,
      isStudent: true,
    });
    expect(action?.href).toBe('/practice/vocabulary');
    expect(action?.title).toBe('Review due');
  });

  it('buildStudentHeroAction links to next lesson', () => {
    const action = buildStudentHeroAction(
      [mockScheduledLesson({ backendId: 'lesson-1', date: '2026-06-10' })],
      (lesson) => `/lessons/${lesson.backendId}`,
      new Date('2026-06-01').getTime(),
    );
    expect(action?.href).toBe('/lessons/lesson-1');
  });

  it('formatContactMetaLine joins email and timezone', () => {
    expect(formatContactMetaLine('student@school.com', 1)).toContain('@school.com');
  });
});
