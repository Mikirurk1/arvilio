import {
  priceIdForPlan,
  planForPriceId,
  mapStripeSubscriptionStatus,
  schoolStatusForSubscription,
} from './platform-subscription.util';

describe('platform-subscription.util', () => {
  beforeEach(() => {
    process.env.STRIPE_PRICE_STARTER = 'price_starter';
    process.env.STRIPE_PRICE_PRO = 'price_pro';
  });
  afterEach(() => {
    delete process.env.STRIPE_PRICE_STARTER;
    delete process.env.STRIPE_PRICE_PRO;
  });

  it('maps plans to env price ids and back', () => {
    expect(priceIdForPlan('STARTER')).toBe('price_starter');
    expect(priceIdForPlan('PRO')).toBe('price_pro');
    expect(priceIdForPlan('TRIAL')).toBeNull();
    expect(planForPriceId('price_pro')).toBe('PRO');
    expect(planForPriceId('price_unknown')).toBeNull();
    expect(planForPriceId(undefined)).toBeNull();
  });

  it('maps Stripe subscription statuses', () => {
    expect(mapStripeSubscriptionStatus('trialing')).toBe('TRIALING');
    expect(mapStripeSubscriptionStatus('active')).toBe('ACTIVE');
    expect(mapStripeSubscriptionStatus('past_due')).toBe('PAST_DUE');
    expect(mapStripeSubscriptionStatus('unpaid')).toBe('PAST_DUE');
    expect(mapStripeSubscriptionStatus('canceled')).toBe('CANCELED');
    expect(mapStripeSubscriptionStatus('weird')).toBe('PAST_DUE');
  });

  it('maps subscription status to school lifecycle', () => {
    expect(schoolStatusForSubscription('ACTIVE')).toBe('ACTIVE');
    expect(schoolStatusForSubscription('TRIALING')).toBe('ACTIVE');
    expect(schoolStatusForSubscription('PAST_DUE')).toBe('ACTIVE'); // dunning grace
    expect(schoolStatusForSubscription('CANCELED')).toBe('SUSPENDED');
  });
});
