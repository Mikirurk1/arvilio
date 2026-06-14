import type { StudentLessonBalanceDto } from '@pkg/types';
import { headerGroupStatLabel, splitStudentBillingTracks } from './student-billing-tracks';

const baseBalance = (): StudentLessonBalanceDto => ({
  balance: 5,
  isDebt: false,
  groupBalance: 3,
  groupIsDebt: false,
  availableMethods: [],
  enabledPaymentMethods: [],
  paymentMethodSelection: { allowedMethods: [], restrictToAllowlistOnly: false },
  manualInvoiceMethods: [],
  platformManualInvoiceMethods: [],
  manualInvoiceSelection: { allowedMethodIds: [], defaultMethodId: null },
  billingMode: 'both',
  packageOverrides: [],
  platformPackages: [],
  showPerLessonPricing: true,
  showSelfServePackages: true,
  allowedCurrencies: ['UAH'],
  minPackageLessons: 1,
  pricePerLessonMinor: null,
  defaultPricePerLessonMinor: 2000,
  resolvedPricePerLessonMinor: 2000,
  groupPricePerLessonMinor: null,
  defaultGroupPricePerLessonMinor: 800,
  resolvedGroupPricePerLessonMinor: 800,
  groupCurrency: 'UAH',
  defaultCurrency: 'UAH',
  isCustomPrice: false,
  isCustomGroupPrice: false,
  packages: [],
  recentLedger: [
    {
      id: '1',
      delta: -1,
      balanceAfter: 4,
      kind: 'CONSUMPTION',
      note: null,
      createdAt: '2026-06-01T10:00:00.000Z',
      scheduledLessonId: 'l1',
    },
    {
      id: '2',
      delta: 0,
      balanceAfter: 4,
      kind: 'GROUP_CHARGE',
      note: null,
      createdAt: '2026-06-02T10:00:00.000Z',
      scheduledLessonId: 'l2',
      amountMinor: 15000,
      currency: 'UAH',
    },
  ],
  lessonFormat: 'mixed',
  groupMemberships: [
    {
      groupId: 'g1',
      name: 'B2 Evening',
      groupBillingMode: 'fixed_total',
      groupPriceMinor: 30000,
      groupCurrency: 'UAH',
      groupSplitMode: 'equal_split',
      groupPayerUserId: null,
    },
  ],
});

describe('student-billing-tracks', () => {
  it('splits ledger and memberships for mixed students', () => {
    const tracks = splitStudentBillingTracks(baseBalance(), 'mixed');
    expect(tracks.showIndividual).toBe(true);
    expect(tracks.showGroup).toBe(true);
    expect(tracks.individual?.recentIndividualLedger).toHaveLength(1);
    expect(tracks.group?.recentGroupLedger).toHaveLength(1);
    expect(tracks.group?.memberships).toHaveLength(1);
  });

  it('hides individual track for group-only students', () => {
    const tracks = splitStudentBillingTracks(baseBalance(), 'group_only');
    expect(tracks.showIndividual).toBe(false);
    expect(tracks.individual).toBeNull();
    expect(tracks.showGroup).toBe(true);
  });

  it('summarizes group header stat from group balance when per-member groups exist', () => {
    const track = {
      groupBalance: 2,
      isDebt: false,
      resolvedGroupPricePerLessonMinor: 800,
      groupCurrency: 'UAH',
      memberships: [
        {
          groupId: 'g1',
          name: 'Alpha',
          groupBillingMode: 'per_member' as const,
          groupPriceMinor: null,
          groupCurrency: null,
          groupSplitMode: null,
          groupPayerUserId: null,
        },
      ],
      recentGroupLedger: [],
    };
    expect(headerGroupStatLabel(track)).toBe('2');
    expect(
      headerGroupStatLabel({
        ...track,
        memberships: [
          {
            groupId: 'g1',
            name: 'Alpha',
            groupBillingMode: 'fixed_total',
            groupPriceMinor: 30000,
            groupCurrency: 'UAH',
            groupSplitMode: 'equal_split',
            groupPayerUserId: null,
          },
        ],
      }),
    ).toBe('Alpha');
  });
});
