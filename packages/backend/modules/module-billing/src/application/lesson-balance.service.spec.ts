import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';

describe('LessonBalanceService', () => {
  const prisma = {
    scheduledLesson: { findUnique: jest.fn() },
    lessonBalanceLedger: { findUnique: jest.fn(), findMany: jest.fn() },
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
  };

  const paymentSettingsMock = {
    getPaymentSettings: jest.fn(),
    resolvePricePerLessonMinor: jest.fn(),
  };
  const paymentSettings = paymentSettingsMock as unknown as PaymentSettingsService;

  const service = new LessonBalanceService(
    prisma as never,
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
      },
      methods: [],
      secretStatuses: {} as never,
    });
    paymentSettingsMock.resolvePricePerLessonMinor.mockResolvedValue({
      defaultPricePerLessonMinor: 2000,
      pricePerLessonMinor: null,
      resolvedPricePerLessonMinor: 2000,
      isCustomPrice: false,
      defaultCurrency: 'UAH',
    });
  });

  it('syncLessonCharge creates consumption for completed lesson', async () => {
    prisma.scheduledLesson.findUnique.mockResolvedValue({
      id: 'l1',
      studentId: 's1',
      status: 'COMPLETED',
      credited: true,
    });
    prisma.lessonBalanceLedger.findUnique.mockResolvedValue(null);

    await service.syncLessonCharge('l1');

    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('syncLessonCharge skips when already consumed', async () => {
    prisma.scheduledLesson.findUnique.mockResolvedValue({
      id: 'l1',
      studentId: 's1',
      status: 'COMPLETED',
      credited: true,
    });
    prisma.lessonBalanceLedger.findUnique.mockResolvedValue({ id: 'existing' });

    await service.syncLessonCharge('l1');

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns all enabled methods when the student payment allowlist is empty', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 't1' })
      .mockResolvedValueOnce({ role: 'STUDENT' });
    prisma.studentLessonBalance.upsert.mockResolvedValue({
      userId: 's1',
      balance: 2,
      pricePerLessonMinor: null,
      billingMode: 'BOTH',
      packageOverrides: null,
      paymentMethodSelection: { allowedMethods: [] },
      manualInvoiceSelection: { allowedMethodIds: ['bank-b'], defaultMethodId: 'bank-b' },
      updatedAt: new Date(),
    });

    const result = await service.getStudentBalance({ id: 't1', role: 'ADMIN' }, 's1');

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
      pricePerLessonMinor: null,
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
      pricePerLessonMinor: null,
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
      pricePerLessonMinor: null,
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
});
