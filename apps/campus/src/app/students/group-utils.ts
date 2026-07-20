import type {
  CreateStudentGroupRequestDto,
  GroupFixedSplitMode,
  GroupLessonBillingMode,
  StudentSummaryBackendDto,
} from '@pkg/types';

export type GroupDraft = {
  name: string;
  teacherId: string;
  memberUserIds: string[];
  groupBillingMode: GroupLessonBillingMode;
  groupPriceMinor: number;
  groupCurrency: string;
  groupSplitMode: GroupFixedSplitMode;
  groupPayerUserId: string;
};

export const emptyDraft = (currency = 'UAH'): GroupDraft => ({
  name: '',
  teacherId: '',
  memberUserIds: [],
  groupBillingMode: 'per_member',
  groupPriceMinor: 0,
  groupCurrency: currency,
  groupSplitMode: 'equal_split',
  groupPayerUserId: '',
});

export function billingModeLabel(mode: GroupLessonBillingMode): string {
  return mode === 'per_member' ? 'Per member' : 'Fixed total';
}

export function isGroupEligibleStudent(student: StudentSummaryBackendDto): boolean {
  return student.lessonFormat === 'mixed' || student.lessonFormat === 'group_only';
}

export function validateDraft(draft: GroupDraft): string | null {
  if (!draft.name.trim()) return 'Group name is required.';
  if (draft.memberUserIds.length < 2) return 'Add at least two students to the group.';
  if (
    draft.groupBillingMode === 'fixed_total' &&
    draft.groupSplitMode === 'single_payer' &&
    !draft.groupPayerUserId
  ) {
    return 'Select a payer for single-payer billing.';
  }
  if (draft.groupBillingMode === 'fixed_total' && draft.groupPriceMinor <= 0) {
    return 'Enter a fixed lesson amount greater than zero.';
  }
  return null;
}

export function buildGroupPayload(draft: GroupDraft): CreateStudentGroupRequestDto {
  return {
    name: draft.name.trim(),
    teacherId: draft.teacherId || null,
    memberUserIds: draft.memberUserIds,
    groupBillingMode: draft.groupBillingMode,
    groupPriceMinor:
      draft.groupBillingMode === 'fixed_total' ? draft.groupPriceMinor : undefined,
    groupCurrency: draft.groupBillingMode === 'fixed_total' ? draft.groupCurrency : undefined,
    groupSplitMode:
      draft.groupBillingMode === 'fixed_total' ? draft.groupSplitMode : undefined,
    groupPayerUserId:
      draft.groupBillingMode === 'fixed_total' && draft.groupSplitMode === 'single_payer'
        ? draft.groupPayerUserId || null
        : null,
  };
}
