import { resolveLessonPartyLabel } from './lesson-party-display';
import { isRecurrenceAllowedForStudent } from './student-schedule-type';

describe('lesson-party-display', () => {
  it('resolveLessonPartyLabel prefers map then stored name', () => {
    const map = new Map([[1, 'Anna']]);
    expect(resolveLessonPartyLabel(1, 'Stored', map)).toBe('Anna');
    expect(resolveLessonPartyLabel(2, 'Bob', map)).toBe('Bob');
    expect(resolveLessonPartyLabel(3, '', map, 'N/A')).toBe('N/A');
  });
});

describe('student-schedule-type', () => {
  it('isRecurrenceAllowedForStudent respects scheduleType', () => {
    const students = [
      { id: 1, scheduleType: true as const },
      { id: 2, scheduleType: false as const },
    ];
    expect(isRecurrenceAllowedForStudent(1, students)).toBe(true);
    expect(isRecurrenceAllowedForStudent(2, students)).toBe(false);
    expect(isRecurrenceAllowedForStudent(99, students)).toBe(true);
  });
});
