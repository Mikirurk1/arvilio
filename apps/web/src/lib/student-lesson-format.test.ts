import {
  getLessonFormatLabel,
  normalizeLessonFormat,
  showsGroupTrack,
  showsIndividualTrack,
} from './student-lesson-format';

describe('student-lesson-format', () => {
  it('labels lesson formats for staff UI', () => {
    expect(getLessonFormatLabel('individual_only')).toBe('Individual only');
    expect(getLessonFormatLabel('group_only')).toBe('Group only');
    expect(getLessonFormatLabel('mixed')).toBe('Individual & group');
  });

  it('normalizes missing lesson format to mixed', () => {
    expect(normalizeLessonFormat(undefined)).toBe('mixed');
    expect(normalizeLessonFormat(null)).toBe('mixed');
  });

  it('decides which billing tracks to show', () => {
    expect(showsIndividualTrack('individual_only')).toBe(true);
    expect(showsIndividualTrack('group_only')).toBe(false);
    expect(showsGroupTrack('group_only')).toBe(true);
    expect(showsGroupTrack('individual_only')).toBe(false);
    expect(showsIndividualTrack('mixed')).toBe(true);
    expect(showsGroupTrack('mixed')).toBe(true);
  });
});
