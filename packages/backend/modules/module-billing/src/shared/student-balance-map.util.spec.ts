import {
  groupBillingModeToDto,
  lessonFormatToDto,
  toGroupMembershipSummaryDto,
} from './student-balance-map.util';

describe('student-balance-map.util', () => {
  it('maps prisma lesson format to dto', () => {
    expect(lessonFormatToDto('INDIVIDUAL_ONLY')).toBe('individual_only');
    expect(lessonFormatToDto('GROUP_ONLY')).toBe('group_only');
    expect(lessonFormatToDto('MIXED')).toBe('mixed');
  });

  it('maps group membership row', () => {
    const dto = toGroupMembershipSummaryDto({
      studentGroup: {
        id: 'g1',
        name: 'Test',
        groupBillingMode: 'FIXED_TOTAL',
        groupPriceMinor: 1000,
        groupCurrency: 'UAH',
        groupSplitMode: 'EQUAL_SPLIT',
        groupPayerUserId: null,
      },
    });
    expect(dto.groupBillingMode).toBe('fixed_total');
    expect(dto.groupSplitMode).toBe('equal_split');
  });

  it('maps billing mode', () => {
    expect(groupBillingModeToDto('PER_MEMBER')).toBe('per_member');
  });
});
