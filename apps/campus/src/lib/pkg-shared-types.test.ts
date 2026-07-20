import {
  formatTimeZoneOptionLabel,
  getProficiencyLevelById,
  getUserAccountStatusById,
  TIME_ZONE,
  vocabularyStatusLabel,
} from '@pkg/types';

describe('@pkg/types helpers', () => {
  it('getProficiencyLevelById resolves CEFR entry', () => {
    expect(getProficiencyLevelById(3)?.code).toBe('B1');
    expect(getProficiencyLevelById(999 as Parameters<typeof getProficiencyLevelById>[0])).toBeUndefined();
  });

  it('getUserAccountStatusById resolves status entry', () => {
    expect(getUserAccountStatusById(1)?.name).toBe('active');
  });

  it('formatTimeZoneOptionLabel includes IANA id', () => {
    const label = formatTimeZoneOptionLabel(TIME_ZONE.kyiv);
    expect(label).toContain('Europe/Kyiv');
  });

  it('vocabularyStatusLabel maps known statuses', () => {
    expect(vocabularyStatusLabel('mistakes_work')).toBe('Review');
  });
});
