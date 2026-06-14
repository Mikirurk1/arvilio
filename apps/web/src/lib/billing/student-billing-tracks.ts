import type {
  GroupLessonBillingMode,
  LessonBalanceLedgerEntryDto,
  StudentGroupMembershipSummaryDto,
  StudentLessonBalanceDto,
  StudentLessonFormat,
} from '@pkg/types';
import { showsGroupTrack, showsIndividualTrack } from '../student-lesson-format';

export type IndividualBillingTrack = {
  balance: number;
  isDebt: boolean;
  resolvedPricePerLessonMinor: number;
  defaultCurrency: string;
  recentIndividualLedger: LessonBalanceLedgerEntryDto[];
};

export type GroupBillingTrack = {
  groupBalance: number;
  isDebt: boolean;
  resolvedGroupPricePerLessonMinor: number;
  groupCurrency: string;
  memberships: StudentGroupMembershipSummaryDto[];
  recentGroupLedger: LessonBalanceLedgerEntryDto[];
};

const INDIVIDUAL_LEDGER_KINDS = new Set([
  'PURCHASE',
  'MANUAL_CREDIT',
  'CONSUMPTION',
  'REVERSAL',
  'ADJUSTMENT',
]);

const GROUP_CREDIT_LEDGER_KINDS = new Set([
  'GROUP_PURCHASE',
  'GROUP_MANUAL_CREDIT',
  'GROUP_CONSUMPTION',
  'GROUP_REVERSAL',
]);

const GROUP_MONEY_LEDGER_KINDS = new Set(['GROUP_CHARGE', 'GROUP_CHARGE_REVERSAL']);

export function splitStudentBillingTracks(
  balance: StudentLessonBalanceDto,
  lessonFormat: StudentLessonFormat | undefined | null,
): {
  showIndividual: boolean;
  showGroup: boolean;
  individual: IndividualBillingTrack | null;
  group: GroupBillingTrack | null;
} {
  const showIndividual = showsIndividualTrack(lessonFormat);
  const showGroup = showsGroupTrack(lessonFormat);

  const individual: IndividualBillingTrack | null = showIndividual
    ? {
        balance: balance.balance,
        isDebt: balance.isDebt,
        resolvedPricePerLessonMinor: balance.resolvedPricePerLessonMinor,
        defaultCurrency: balance.defaultCurrency,
        recentIndividualLedger: balance.recentLedger.filter((row) =>
          INDIVIDUAL_LEDGER_KINDS.has(row.kind),
        ),
      }
    : null;

  const group: GroupBillingTrack | null = showGroup
    ? {
        groupBalance: balance.groupBalance,
        isDebt: balance.groupIsDebt,
        resolvedGroupPricePerLessonMinor: balance.resolvedGroupPricePerLessonMinor,
        groupCurrency: balance.groupCurrency,
        memberships: balance.groupMemberships ?? [],
        recentGroupLedger: balance.recentLedger.filter(
          (row) =>
            GROUP_CREDIT_LEDGER_KINDS.has(row.kind) || GROUP_MONEY_LEDGER_KINDS.has(row.kind),
        ),
      }
    : null;

  return { showIndividual, showGroup, individual, group };
}

export function formatMinor(amountMinor: number, currency: string): string {
  return `${(amountMinor / 100).toFixed(2)} ${currency}`;
}

export function summarizeGroupMembership(
  membership: StudentGroupMembershipSummaryDto,
): string {
  if (membership.groupBillingMode === 'per_member') {
    return '1 group lesson credit per member';
  }
  const price =
    membership.groupPriceMinor != null
      ? formatMinor(membership.groupPriceMinor, membership.groupCurrency ?? 'UAH')
      : '—';
  const split =
    membership.groupSplitMode === 'single_payer' ? 'single payer' : 'split equally';
  return `${price} · ${split}`;
}

export function groupBillingModeShortLabel(mode: GroupLessonBillingMode): string {
  return mode === 'per_member' ? 'Per member' : 'Fixed total';
}

export function headerGroupStatLabel(group: GroupBillingTrack | null): string {
  if (!group) return '—';
  const hasPerMember = group.memberships.some((m) => m.groupBillingMode === 'per_member');
  if (hasPerMember || group.memberships.length === 0) {
    return `${group.groupBalance}${group.isDebt ? ' · debt' : ''}`;
  }
  const count = group.memberships.length;
  if (count === 1) return group.memberships[0]!.name;
  return `${count} groups`;
}
