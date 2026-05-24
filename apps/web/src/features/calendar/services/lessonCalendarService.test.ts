import { getInitialLessons, getLessonsByStudent } from './lessonCalendarService';

describe('lessonCalendarService', () => {
  it('getInitialLessons returns lessons sorted by date and time', () => {
    const lessons = getInitialLessons();
    expect(lessons.length).toBeGreaterThan(0);
    for (let i = 1; i < lessons.length; i += 1) {
      const prev = `${lessons[i - 1]!.date} ${lessons[i - 1]!.startTime}`;
      const curr = `${lessons[i]!.date} ${lessons[i]!.startTime}`;
      expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0);
    }
  });

  it('getLessonsByStudent filters by studentId', () => {
    const lessons = getInitialLessons();
    const studentId = lessons[0]?.studentId;
    expect(studentId).toBeDefined();
    const filtered = getLessonsByStudent(lessons, studentId!);
    expect(filtered.every((row) => row.studentId === studentId)).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });
});
