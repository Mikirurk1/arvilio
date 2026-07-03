import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';

describe('LessonBalanceService', () => {
  const prisma = {
    scheduledLesson: { findUnique: jest.fn() },
    lessonBalanceLedger: { findUnique: jest.fn(), findMany: jest.fn() },
    studentGroupMember: { findMany: jest.fn().mockResolvedValue([]) },
    studentLessonBalance: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn(), create: jest.fn() },
    $transaction: jest.fn((fn: (tx: unknown) => Promise<void>) =>
      fn({
        studentLessonBalance: {
          upsert: jest.fn().mockResolvedValue({ userId: 's1', balance: 2 }),
          update: jest.fn().mockResolvedValue({}),
        },
        lessonBalanceLedger: { create: jest.fn().mockResolvedValue({}) },
      }),
    ),
    user: { findUnique: jest.fn() },
    payment: { findUnique: jest.fn() },
  };

  const paymentSettingsMock = {
    getPaymentSettings: jest.fn(),
    resolvePricePerLessonMinor: jest.fn(),
    resolveGroupPricePerLessonMinor: jest.fn(),
  };
  const paymentSettings = paymentSettingsMock as unknown as PaymentSettingsService;

  const tenant = { schoolId: 'school_default' } as never;
  const service = new LessonBalanceService(
    prisma as never,
    tenant,
    paymentSettings,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.lessonBalanceLedger.findMany.mockResolvedValue([]);
    paymentSettingsMock.getPaymentSettings.mockResolvedValue({
      enabledMethods: ['stripe', 'manual_invoice', 'paypal'],
      config: {
        packages: [],
        defaultPricePerLessonMinor: 2000,
        defaultCurrency: 'UAH',
        allowedCurrencies: ['UAH'],
        minPackageLessons: 3,
        manualInvoiceMethods: [
          {
            id: 'bank-a',
            kind: 'custom',
            label: 'Bank A',
            description: '',
            receiptHintUk: '',
            paymentReferenceHint: '',
            recipientTaxId: null,
            paymentPurpose: null,
            importantNotes: [],
            instructionsUk: 'Pay to bank A',
          },
          {
            id: 'bank-b',
            kind: 'custom',
            label: 'Bank B',
            description: '',
            receiptHintUk: '',
            paymentReferenceHint: '',
            recipientTaxId: null,
            paymentPurpose: null,
            importantNotes: [],
            instructionsUk: 'Pay to bank B',
          },
          {
            id: 'bank-c',
            kind: 'custom',
            label: 'Bank C',
            description: '',
            receiptHintUk: '',
            paymentReferenceHint: '',
            recipientTaxId: null,
            paymentPurpose: null,
            importantNotes: [],
            instructionsUk: '',
          },
        ],
        stripe: { mode: 'live' },
        liqpay: { mode: 'live' },
        wayforpay: { mode: 'live' },
        lemonsqueezy: { mode: 'live' },
        paddle: { mode: 'live' },
        monopay: { mode: 'live' },
        paypal: { mode: 'live' },
        groupLessons: { enabled: true, defaultBillingMode: 'per_member', defaultPriceMinor: 0, defaultCurrency: 'UAH', defaultSplitMode: 'equal_split' },
      },
      methods: [],
      secretStatuses: {} as never,
    });
    prisma.studentGroupMember.findMany.mockResolvedValue([]);
    paymentSettingsMock.resolvePricePerLessonMinor.mockResolvedValue({
      defaultPricePerLessonMinor: 2000,
      pricePerLessonMinor: null,
      resolvedPricePerLessonMinor: 2000,
      isCustomPrice: false,
      defaultCurrency: 'UAH',
    });
    paymentSettingsMock.resolveGroupPricePerLessonMinor.mockResolvedValue({
      defaultGroupPricePerLessonMinor: 800,
      groupPricePerLessonMinor: null,
      resolvedGroupPricePerLessonMinor: 800,
      isCustomGroupPrice: false,
      groupCurrency: 'UAH',
    });
  });

  it('syncLessonCharge creates group consumption for per-member group lesson', async () => {
    prisma.scheduledLesson.findUnique.mockResolvedValue({
      id: 'l1',
      kind: 'GROUP',
      studentId: 's1',
      status: 'COMPLETED',
      credited: true,
      groupBillingMode: 'PER_MEMBER',
      groupPriceMinor: null,
      groupCurrency: null,
      groupSplitMode: null,
      groupPayerUserId: null,
      participants: [{ userId: 's1' }],
    });
    prisma.lessonBalanceLedger.findUnique.mockResolvedValue(null);

    await service.syncLessonCharge('l1');

    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('syncLessonCharge creates consumption for completed lesson', async () => {
    prisma.scheduledLesson.findUnique.mockResolvedValue({
      id: 'l1',
      kind: 'INDIVIDUAL',
      studentId: 's1',
      status: 'COMPLETED',
      credited: true,
      groupBillingMode: null,
      groupPriceMinor: null,
      groupCurrency: null,
      groupSplitMode: null,
      groupPayerUserId: null,
      participants: [],
    });
    prisma.lessonBalanceLedger.findUnique.mockResolvedValue(null);

    await service.syncLessonCharge('l1');

    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('syncLessonCharge skips when already consumed', async () => {
    prisma.scheduledLesson.findUnique.mockResolvedValue({
      id: 'l1',
      kind: 'INDIVIDUAL',
      studentId: 's1',
      status: 'COMPLETED',
      credited: true,
      groupBillingMode: null,
      groupPriceMinor: null,
      groupCurrency: null,
      groupSplitMode: null,
      groupPayerUserId: null,
      participants: [],
    });
    prisma.lessonBalanceLedger.findUnique.mockResolvedValue({ id: 'existing' });

    await service.syncLessonCharge('l1');

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns all enabled methods when the student payment allowlist is empty', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 't1' })
      .mockResolvedValueOnce({ role: 'STUDENT' })
      .mockResolvedValueOnce({ lessonFormat: 'MIXED' });
    prisma.studentLessonBalance.upsert.mockResolvedValue({
      userId: 's1',
      balance: 2,
      groupBalance: 0,
      pricePerLessonMinor: null,
      groupPricePerLessonMinor: null,
      billingMode: 'BOTH',
      packageOverrides: null,
      paymentMethodSelection: { allowedMethods: [] },
      manualInvoiceSelection: { allowedMethodIds: ['bank-b'], defaultMethodId: 'bank-b' },
      updatedAt: new Date(),
    });
    prisma.lessonBalanceLedger.findMany.mockResolvedValue([
      {
        id: 'le1',
        delta: 0,
        balanceAfter: 2,
        kind: 'GROUP_CHARGE',
        note: null,
        createdAt: new Date(),
        scheduledLessonId: 'l2',
        amountMinor: 5000,
        currency: 'UAH',
      },
    ]);

    const result = await service.getStudentBalance({ id: 't1', role: 'ADMIN' }, 's1');

    expect(result.lessonFormat).toBe('mixed');
    expect(result.groupMemberships).toEqual([]);
    expect(result.recentLedger[0]?.amountMinor).toBe(5000);
    expect(result.availableMethods).toEqual(['stripe', 'manual_invoice', 'paypal']);
    expect(result.paymentMethodSelection).toEqual({
      allowedMethods: [],
      restrictToAllowlistOnly: false,
    });
    expect(result.manualInvoiceMethods.map((method) => method.id)).toEqual(['bank-b']);
  });

  it('merges newly enabled platform methods for legacy non-restrictive allowlists', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 't1' })
      .mockResolvedValueOnce({ role: 'STUDENT' });
    prisma.studentLessonBalance.upsert.mockResolvedValue({
      userId: 's1',
      balance: 2,
      groupBalance: 0,
      pricePerLessonMinor: null,
      groupPricePerLessonMinor: null,
      billingMode: 'BOTH',
      packageOverrides: null,
      paymentMethodSelection: { allowedMethods: ['stripe'] },
      manualInvoiceSelection: { allowedMethodIds: [], defaultMethodId: null },
      updatedAt: new Date(),
    });

    const result = await service.getStudentBalance({ id: 't1', role: 'ADMIN' }, 's1');

    expect(result.availableMethods).toEqual(['stripe', 'manual_invoice', 'paypal']);
  });

  it('hides manual invoice methods when manual_invoice is not allowed for the student', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 't1' })
      .mockResolvedValueOnce({ role: 'STUDENT' });
    prisma.studentLessonBalance.upsert.mockResolvedValue({
      userId: 's1',
      balance: 2,
      groupBalance: 0,
      pricePerLessonMinor: null,
      groupPricePerLessonMinor: null,
      billingMode: 'BOTH',
      packageOverrides: null,
      paymentMethodSelection: {
        allowedMethods: ['paypal'],
        restrictToAllowlistOnly: true,
      },
      manualInvoiceSelection: { allowedMethodIds: ['bank-a'], defaultMethodId: 'bank-a' },
      updatedAt: new Date(),
    });

    const result = await service.getStudentBalance({ id: 't1', role: 'ADMIN' }, 's1');

    expect(result.availableMethods).toEqual(['paypal']);
    expect(result.paymentMethodSelection).toEqual({
      allowedMethods: ['paypal'],
      restrictToAllowlistOnly: true,
    });
    expect(result.manualInvoiceMethods).toEqual([]);
  });

  it('returns all created manual invoice templates for admin selection but only configured ones to students', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 't1' })
      .mockResolvedValueOnce({ role: 'STUDENT' });
    prisma.studentLessonBalance.upsert.mockResolvedValue({
      userId: 's1',
      balance: 2,
      groupBalance: 0,
      pricePerLessonMinor: null,
      groupPricePerLessonMinor: null,
      billingMode: 'BOTH',
      packageOverrides: null,
      paymentMethodSelection: { allowedMethods: ['manual_invoice'] },
      manualInvoiceSelection: { allowedMethodIds: ['bank-a', 'bank-c'], defaultMethodId: 'bank-c' },
      updatedAt: new Date(),
    });

    const result = await service.getStudentBalance({ id: 't1', role: 'ADMIN' }, 's1');

    expect(result.platformManualInvoiceMethods.map((method) => method.id)).toEqual([
      'bank-a',
      'bank-b',
      'bank-c',
    ]);
    expect(result.manualInvoiceMethods.map((method) => method.id)).toEqual(['bank-a']);
  });

  it('redacts student pricing fields for teacher viewers', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 't1' })
      .mockResolvedValueOnce({ role: 'STUDENT' });
    prisma.studentLessonBalance.upsert.mockResolvedValue({
      userId: 's1',
      balance: 2,
      pricePerLessonMinor: 3500,
      billingMode: 'BOTH',
      packageOverrides: [{ packageId: 'p1', enabled: true }],
      paymentMethodSelection: { allowedMethods: [] },
      manualInvoiceSelection: { allowedMethodIds: [], defaultMethodId: null },
      updatedAt: new Date(),
    });
    paymentSettingsMock.resolvePricePerLessonMinor.mockResolvedValue({
      pricePerLessonMinor: 3500,
      defaultPricePerLessonMinor: 2000,
      resolvedPricePerLessonMinor: 3500,
      defaultCurrency: 'UAH',
      isCustomPrice: true,
    });
    prisma.lessonBalanceLedger.findMany.mockResolvedValue([
      {
        id: 'l1',
        delta: -1,
        balanceAfter: 1,
        kind: 'LESSON',
        note: null,
        createdAt: new Date(),
        scheduledLessonId: 'sl1',
        amountMinor: 3500,
        currency: 'UAH',
      },
    ]);

    const result = await service.getStudentBalance({ id: 't1', role: 'TEACHER' }, 's1');

    expect(result.showPerLessonPricing).toBe(false);
    expect(result.pricePerLessonMinor).toBeNull();
    expect(result.resolvedPricePerLessonMinor).toBe(0);
    expect(result.packages).toEqual([]);
    expect(result.recentLedger[0]?.amountMinor).toBeNull();
    expect(result.balance).toBe(2);
  });

  describe('grantPurchaseLessons (G2: tenant-aware webhooks)', () => {
    function makeService(initialSchoolId: string | null) {
      let schoolId = initialSchoolId;
      const tenantMock = {
        get schoolId() {
          return schoolId;
        },
        isActive: () => true,
        setSchoolId: jest.fn((id: string | null) => {
          schoolId = id;
        }),
      };
      const svc = new LessonBalanceService(prisma as never, tenantMock as never, paymentSettings);
      return { svc, tenantMock };
    }

    it('seeds schoolId from the payment when context has none (webhook path)', async () => {
      prisma.payment.findUnique.mockResolvedValue({ schoolId: 'school_b', metadata: null });
      const { svc, tenantMock } = makeService(null);
      await svc.grantPurchaseLessons({ userId: 's1', lessons: 5, paymentId: 'pay-1' });
      expect(tenantMock.setSchoolId).toHaveBeenCalledWith('school_b');
    });

    it('does not override an already-active tenant context', async () => {
      prisma.payment.findUnique.mockResolvedValue({ schoolId: 'school_b', metadata: null });
      const { svc, tenantMock } = makeService('school_a');
      await svc.grantPurchaseLessons({ userId: 's1', lessons: 5, paymentId: 'pay-1' });
      expect(tenantMock.setSchoolId).not.toHaveBeenCalled();
    });

    it('no-ops for non-positive lessons', async () => {
      const { svc, tenantMock } = makeService(null);
      await svc.grantPurchaseLessons({ userId: 's1', lessons: 0, paymentId: 'pay-1' });
      expect(tenantMock.setSchoolId).not.toHaveBeenCalled();
      expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });
  });
});
