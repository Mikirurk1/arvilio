import type {
  GroupFixedSplitMode,
  GroupLessonBillingMode,
  StudentGroupMembershipSummaryDto,
  StudentLessonFormat,
} from '@pkg/types';

export function lessonFormatToDto(
  value: 'INDIVIDUAL_ONLY' | 'GROUP_ONLY' | 'MIXED',
): StudentLessonFormat {
  if (value === 'INDIVIDUAL_ONLY') return 'individual_only';
  if (value === 'GROUP_ONLY') return 'group_only';
  return 'mixed';
}

export function groupBillingModeToDto(
  mode: 'PER_MEMBER' | 'FIXED_TOTAL',
): GroupLessonBillingMode {
  return mode.toLowerCase() as GroupLessonBillingMode;
}

export function groupSplitModeToDto(
  mode: 'SINGLE_PAYER' | 'EQUAL_SPLIT' | null,
): GroupFixedSplitMode | null {
  if (!mode) return null;
  return mode.toLowerCase() as GroupFixedSplitMode;
}

export function toGroupMembershipSummaryDto(row: {
  studentGroup: {
    id: string;
    name: string;
    groupBillingMode: 'PER_MEMBER' | 'FIXED_TOTAL';
    groupPriceMinor: number | null;
    groupCurrency: string | null;
    groupSplitMode: 'SINGLE_PAYER' | 'EQUAL_SPLIT' | null;
    groupPayerUserId: string | null;
  };
}): StudentGroupMembershipSummaryDto {
  const group = row.studentGroup;
  return {
    groupId: group.id,
    name: group.name,
    groupBillingMode: groupBillingModeToDto(group.groupBillingMode),
    groupPriceMinor: group.groupPriceMinor,
    groupCurrency: group.groupCurrency,
    groupSplitMode: groupSplitModeToDto(group.groupSplitMode),
    groupPayerUserId: group.groupPayerUserId,
  };
}
