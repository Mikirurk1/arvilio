import type {
  CreateStudentGroupRequestDto,
  GroupFixedSplitMode,
  GroupLessonBillingMode,
  StudentSummaryBackendDto,
} from '@pkg/types';
import type { TranslateFn } from '../../lib/cms/nav-i18n';

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

export function billingModeLabel(mode: GroupLessonBillingMode, t?: TranslateFn): string {
  const key =
    mode === 'per_member'
      ? 'students.groups.billing.perMember'
      : 'students.groups.billing.fixedTotal';
  if (t) return t(key);
  return mode === 'per_member' ? 'Per member' : 'Fixed total';
}

export function isGroupEligibleStudent(student: StudentSummaryBackendDto): boolean {
  return student.lessonFormat === 'mixed' || student.lessonFormat === 'group_only';
}

function validationMessage(key: string, fallback: string, t?: TranslateFn): string {
  return t ? t(key) : fallback;
}

export function validateDraft(draft: GroupDraft, t?: TranslateFn): string | null {
  if (!draft.name.trim()) {
    return validationMessage(
      'students.groups.validation.nameRequired',
      'Group name is required.',
      t,
    );
  }
  if (draft.memberUserIds.length < 2) {
    return validationMessage(
      'students.groups.validation.minMembers',
      'Add at least two students to the group.',
      t,
    );
  }
  if (
    draft.groupBillingMode === 'fixed_total' &&
    draft.groupSplitMode === 'single_payer' &&
    !draft.groupPayerUserId
  ) {
    return validationMessage(
      'students.groups.validation.payerRequired',
      'Select a payer for single-payer billing.',
      t,
    );
  }
  if (draft.groupBillingMode === 'fixed_total' && draft.groupPriceMinor <= 0) {
    return validationMessage(
      'students.groups.validation.amountRequired',
      'Enter a fixed lesson amount greater than zero.',
      t,
    );
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
