import { isRecurrenceAllowedForStudent } from './student-schedule-type';

describe('student-schedule-type', () => {
  it('isRecurrenceAllowedForStudent blocks fixed-schedule students', () => {
    expect(
      isRecurrenceAllowedForStudent(1, [{ id: 1, scheduleType: false }]),
    ).toBe(false);
  });

  it('isRecurrenceAllowedForStudent allows flexible schedule', () => {
    expect(
      isRecurrenceAllowedForStudent(1, [{ id: 1, scheduleType: true }]),
    ).toBe(true);
  });

  it('isRecurrenceAllowedForStudent defaults to allowed when student missing', () => {
    expect(isRecurrenceAllowedForStudent(99, [{ id: 1, scheduleType: false }])).toBe(true);
  });
});
