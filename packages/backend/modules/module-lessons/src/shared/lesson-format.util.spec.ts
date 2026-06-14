import {
  canJoinGroupLesson,
  canTakeIndividualLesson,
  lessonFormatFromDto,
  lessonFormatToDto,
} from './lesson-format.util';

describe('lesson-format.util', () => {
  it('round-trips dto values', () => {
    expect(lessonFormatToDto('INDIVIDUAL_ONLY')).toBe('individual_only');
    expect(lessonFormatFromDto('mixed')).toBe('MIXED');
  });

  it('gates group and individual participation', () => {
    expect(canJoinGroupLesson('GROUP_ONLY')).toBe(true);
    expect(canJoinGroupLesson('INDIVIDUAL_ONLY')).toBe(false);
    expect(canTakeIndividualLesson('INDIVIDUAL_ONLY')).toBe(true);
    expect(canTakeIndividualLesson('GROUP_ONLY')).toBe(false);
    expect(canJoinGroupLesson('MIXED')).toBe(true);
    expect(canTakeIndividualLesson('MIXED')).toBe(true);
  });
});
