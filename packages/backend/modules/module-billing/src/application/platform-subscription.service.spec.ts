import type Stripe from 'stripe';
import type { PrismaService } from '@be/prisma';
import { PlatformSubscriptionService } from './platform-subscription.service';

describe('PlatformSubscriptionService.applySubscriptionEvent', () => {
  const tx = {
    schoolSubscription: { upsert: jest.fn() },
    school: { update: jest.fn() },
  };
  const prisma = {
    schoolSubscription: { findFirst: jest.fn() },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const service = new PlatformSubscriptionService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_PRICE_PRO = 'price_pro';
  });
  afterEach(() => delete process.env.STRIPE_PRICE_PRO);

  const event = (type: string, object: unknown): Stripe.Event =>
    ({ type, data: { object } }) as unknown as Stripe.Event;

  it('checkout.session.completed → ACTIVE + plan + school ACTIVE', async () => {
    await service.applySubscriptionEvent(
      event('checkout.session.completed', {
        mode: 'subscription',
        metadata: { schoolId: 's1', plan: 'PRO' },
        subscription: 'sub_1',
        customer: 'cus_1',
      }),
    );
    expect(tx.schoolSubscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { schoolId: 's1' },
        update: expect.objectContaining({ status: 'ACTIVE', plan: 'PRO', stripeSubscriptionId: 'sub_1' }),
      }),
    );
    expect(tx.school.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { status: 'ACTIVE' } });
  });

  it('ignores non-subscription checkout sessions', async () => {
    await service.applySubscriptionEvent(
      event('checkout.session.completed', { mode: 'payment', metadata: { schoolId: 's1' } }),
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('customer.subscription.updated past_due → PAST_DUE, school stays ACTIVE (dunning)', async () => {
    await service.applySubscriptionEvent(
      event('customer.subscription.updated', {
        id: 'sub_1',
        status: 'past_due',
        metadata: { schoolId: 's1' },
        items: { data: [{ price: { id: 'price_pro' } }] },
      }),
    );
    expect(tx.schoolSubscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ status: 'PAST_DUE', plan: 'PRO' }) }),
    );
    expect(tx.school.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { status: 'ACTIVE' } });
  });

  it('customer.subscription.deleted → CANCELED + school SUSPENDED', async () => {
    await service.applySubscriptionEvent(
      event('customer.subscription.deleted', { id: 'sub_1', status: 'canceled', metadata: { schoolId: 's1' } }),
    );
    expect(tx.school.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { status: 'SUSPENDED' } });
  });

  it('invoice.payment_failed → resolves school by subscription id → PAST_DUE', async () => {
    prisma.schoolSubscription.findFirst.mockResolvedValue({ schoolId: 's9' });
    await service.applySubscriptionEvent(
      event('invoice.payment_failed', { subscription: 'sub_9', customer: 'cus_9' }),
    );
    expect(prisma.schoolSubscription.findFirst).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_9' },
      select: { schoolId: true },
    });
    expect(tx.schoolSubscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { schoolId: 's9' }, update: expect.objectContaining({ status: 'PAST_DUE' }) }),
    );
  });

  it('ignores unrelated event types', async () => {
    await service.applySubscriptionEvent(event('payment_intent.succeeded', {}));
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('PlatformSubscriptionService.createPortalSession', () => {
  const prisma = { schoolSubscription: { findUnique: jest.fn() } };
  // Drive the private stripe() call via the env-guard path: no key → BadRequestException.
  // For the happy path we test the guard throws when subscription is missing.

  beforeEach(() => jest.clearAllMocks());

  it('throws when no Stripe customer exists yet (no key needed — guard is first)', async () => {
    delete process.env.STRIPE_PLATFORM_SECRET_KEY;
    prisma.schoolSubscription.findUnique.mockResolvedValue(null);
    const service = new PlatformSubscriptionService(prisma as unknown as import('@be/prisma').PrismaService);
    await expect(service.createPortalSession('school_1')).rejects.toThrow('No active subscription');
  });

  it('throws BadRequestException when platform billing is not configured', async () => {
    delete process.env.STRIPE_PLATFORM_SECRET_KEY;
    // Return a customer so the DB check passes — should then fail on missing Stripe key
    prisma.schoolSubscription.findUnique.mockResolvedValue({ stripeCustomerId: 'cus_abc' });
    const service = new PlatformSubscriptionService(prisma as unknown as import('@be/prisma').PrismaService);
    await expect(service.createPortalSession('school_1')).rejects.toThrow('Platform billing is not configured');
  });
});

describe('PlatformSubscriptionService.redeemTrialExtension', () => {
  const now = new Date('2026-06-27T00:00:00Z');

  function makeService(overrides: Partial<{
    school: unknown;
    promo: unknown;
    updateMany: { count: number };
    transactionErr?: Error;
  }> = {}) {
    const tx = {
      promoCode: {
        updateMany: jest.fn().mockResolvedValue(overrides.updateMany ?? { count: 1 }),
        update: jest.fn().mockResolvedValue({}),
      },
      promoRedemption: { create: jest.fn().mockResolvedValue({}) },
      schoolSubscription: { upsert: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      school: { findUnique: jest.fn().mockResolvedValue(overrides.school ?? {
        status: 'TRIAL',
        subscription: { trialEndsAt: new Date('2026-07-01T00:00:00Z') },
      }) },
      promoCode: { findUnique: jest.fn().mockResolvedValue(overrides.promo ?? {
        id: 'pc1', code: 'EXTEND7', kind: 'TRIAL_EXTENSION', trialDays: 7,
        active: true, maxRedemptions: null, validFrom: null, validTo: null,
      }) },
      $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => {
        if (overrides.transactionErr) throw overrides.transactionErr;
        return fn(tx);
      }),
    };
    return { service: new PlatformSubscriptionService(prisma as unknown as import('@be/prisma').PrismaService), tx };
  }

  beforeEach(() => jest.useFakeTimers().setSystemTime(now));
  afterEach(() => jest.useRealTimers());

  it('extends trialEndsAt from existing date', async () => {
    const { service, tx } = makeService();
    const result = await service.redeemTrialExtension('school_1', 'EXTEND7');
    // base = 2026-07-01 + 7 days = 2026-07-08
    expect(result.trialEndsAt).toBe('2026-07-08T00:00:00.000Z');
    expect(tx.schoolSubscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { schoolId: 'school_1' },
      update: { trialEndsAt: new Date('2026-07-08T00:00:00.000Z') },
    }));
  });

  it('extends from now when trialEndsAt is in the past', async () => {
    const { service } = makeService({
      school: { status: 'TRIAL', subscription: { trialEndsAt: new Date('2026-06-01T00:00:00Z') } },
    });
    const result = await service.redeemTrialExtension('school_1', 'EXTEND7');
    expect(result.trialEndsAt).toBe('2026-07-04T00:00:00.000Z'); // now + 7 days
  });

  it('rejects when school is not on TRIAL', async () => {
    const { service } = makeService({ school: { status: 'ACTIVE', subscription: null } });
    await expect(service.redeemTrialExtension('school_1', 'EXTEND7')).rejects.toThrow('only be applied to schools on a free trial');
  });

  it('rejects when code is inactive', async () => {
    const { service } = makeService({ promo: { id: 'pc1', code: 'EXTEND7', kind: 'TRIAL_EXTENSION', active: false } });
    await expect(service.redeemTrialExtension('school_1', 'EXTEND7')).rejects.toThrow('not found or inactive');
  });

  it('rejects PERCENT_OFF codes', async () => {
    const { service } = makeService({ promo: {
      id: 'pc1', code: 'DISC10', kind: 'PERCENT_OFF', active: true, maxRedemptions: null, validFrom: null, validTo: null,
    } });
    await expect(service.redeemTrialExtension('school_1', 'DISC10')).rejects.toThrow('not a trial extension');
  });

  it('rejects when maxRedemptions exhausted', async () => {
    const { service } = makeService({ updateMany: { count: 0 } });
    // promo has maxRedemptions: 1 so updateMany path is used
    const promo = {
      id: 'pc1', code: 'EXTEND7', kind: 'TRIAL_EXTENSION', trialDays: 7,
      active: true, maxRedemptions: 1, validFrom: null, validTo: null,
    };
    const { service: s2 } = makeService({ promo, updateMany: { count: 0 } });
    await expect(s2.redeemTrialExtension('school_1', 'EXTEND7')).rejects.toThrow('redemption limit');
  });

  it('rejects duplicate redemption (unique constraint error)', async () => {
    const { service } = makeService({ transactionErr: Object.assign(new Error('Unique constraint'), { code: 'P2002' }) });
    await expect(service.redeemTrialExtension('school_1', 'EXTEND7')).rejects.toThrow('already been applied');
  });
});
