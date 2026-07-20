import { buildLiveProfileStats, formatLessonHours, sumCompletedLessonMinutes } from './profile-live-stats';

describe('profile-live-stats', () => {
  it('sumCompletedLessonMinutes sums completed lessons only', () => {
    const minutes = sumCompletedLessonMinutes([
      { status: 'completed', duration: 45 } as never,
      { status: 'planned', duration: 60 } as never,
      { status: 'completed', duration: 30 } as never,
    ]);
    expect(minutes).toBe(75);
  });

  it('formatLessonHours formats small and large values', () => {
    expect(formatLessonHours(0)).toBe('0h');
    expect(formatLessonHours(90)).toBe('1.5h');
    expect(formatLessonHours(600)).toBe('10h');
  });

  it('buildLiveProfileStats maps overview and summary', () => {
    const stats = buildLiveProfileStats(
      { vocabularyCount: 5, lessonsCompleted: 2 } as never,
      { totalWords: 10 } as never,
      [{ status: 'completed', duration: 60 } as never],
    );
    expect(stats.wordsLearned).toBe(10);
    expect(stats.lessonsCompleted).toBe(2);
    expect(stats.lessonMinutesTotal).toBe(60);
  });
});
