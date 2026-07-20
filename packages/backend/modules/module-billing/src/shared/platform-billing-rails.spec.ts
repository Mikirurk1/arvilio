import {
  resolvePlatformRailsForRegion,
  PLATFORM_BILLING_RAIL_CATALOG,
} from './platform-billing-rails.catalog';
import {
  encryptPlatformBillingSecrets,
  decryptPlatformBillingSecrets,
  mergePlatformBillingSecrets,
} from './platform-billing-rails.secrets';
import { priceIdForPlan, planForPriceId } from './platform-subscription.util';
import {
  readCampusSubscriptionProduct,
  resolveOfferFromProduct,
  coerceCampusSubscriptionRails,
} from './platform-billing-products';
import { pricingModeForRail } from './platform-billing-rails.catalog';

describe('platform billing rails catalog', () => {
  it('includes stripe global and UA rails', () => {
    const ids = PLATFORM_BILLING_RAIL_CATALOG.map((r) => r.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'stripe_platform',
        'liqpay_platform',
        'monopay_platform',
        'wayforpay_platform',
      ]),
    );
    expect(PLATFORM_BILLING_RAIL_CATALOG.find((r) => r.id === 'stripe_platform')?.regions).toEqual([
      '*',
    ]);
  });

  it('resolves UA region to stripe + UA rails when all enabled', () => {
    const enabled = PLATFORM_BILLING_RAIL_CATALOG.map((r) => r.id);
    expect(resolvePlatformRailsForRegion(enabled, 'UA')).toEqual([
      'stripe_platform',
      'liqpay_platform',
      'monopay_platform',
      'wayforpay_platform',
    ]);
  });

  it('resolves PL to stripe only when UA rails enabled', () => {
    const enabled = PLATFORM_BILLING_RAIL_CATALOG.map((r) => r.id);
    expect(resolvePlatformRailsForRegion(enabled, 'PL')).toEqual(['stripe_platform']);
  });

  it('defaults missing region to UA', () => {
    const enabled = ['stripe_platform', 'liqpay_platform'] as const;
    expect(resolvePlatformRailsForRegion(enabled, null)).toEqual([
      'stripe_platform',
      'liqpay_platform',
    ]);
  });
});

describe('campus subscription product resolve', () => {
  const product = {
    default: {
      railId: 'stripe_platform',
      currency: 'EUR',
      prices: {
        STARTER: { stripePriceId: 'price_default_starter' },
        PRO: { amountMinor: 7900 },
      },
    },
    countryOverrides: [
      {
        country: 'UA',
        railId: 'liqpay_platform',
        currency: 'UAH',
        prices: {
          STARTER: { amountMinor: 99900 },
          PRO: { amountMinor: 249900 },
        },
      },
    ],
  };

  it('uses default when billingCountry is null', () => {
    const offer = resolveOfferFromProduct(product, null);
    expect(offer.source).toBe('default');
    expect(offer.railId).toBe('stripe_platform');
    expect(offer.prices.STARTER.stripePriceId).toBe('price_default_starter');
  });

  it('uses UA override when billingCountry is UA', () => {
    const offer = resolveOfferFromProduct(product, 'ua');
    expect(offer.source).toBe('override');
    expect(offer.billingCountry).toBe('UA');
    expect(offer.railId).toBe('liqpay_platform');
    expect(offer.prices.STARTER.amountMinor).toBe(99900);
  });

  it('falls back to default for unknown country', () => {
    const offer = resolveOfferFromProduct(product, 'PL');
    expect(offer.source).toBe('default');
    expect(offer.railId).toBe('stripe_platform');
  });

  it('compat-reads old stripe rail price fields into default product', () => {
    const synthesized = readCampusSubscriptionProduct({
      rails: {
        stripe_platform: {
          enabled: true,
          config: { priceStarter: 'price_legacy_s', pricePro: 'price_legacy_p' },
        },
      },
    });
    expect(synthesized.default.prices.STARTER?.stripePriceId).toBe('price_legacy_s');
    expect(synthesized.default.prices.PRO?.stripePriceId).toBe('price_legacy_p');
    expect(synthesized.countryOverrides).toEqual([]);
  });

  it('coerces unavailable default and override railIds to fallback', () => {
    const coerced = coerceCampusSubscriptionRails(
      {
        default: {
          railId: 'liqpay_platform',
          currency: 'UAH',
          prices: {},
        },
        countryOverrides: [
          {
            country: 'PL',
            railId: 'wayforpay_platform',
            currency: 'PLN',
            prices: {},
          },
        ],
      },
      ['stripe_platform'],
      'stripe_platform',
    );
    expect(coerced.default.railId).toBe('stripe_platform');
    expect(coerced.countryOverrides[0]?.railId).toBe('stripe_platform');
  });

  it('keeps railIds that remain allowed', () => {
    const coerced = coerceCampusSubscriptionRails(
      {
        default: { railId: 'liqpay_platform', currency: 'UAH', prices: {} },
        countryOverrides: [],
      },
      ['stripe_platform', 'liqpay_platform'],
      'stripe_platform',
    );
    expect(coerced.default.railId).toBe('liqpay_platform');
  });
});

describe('pricingModeForRail', () => {
  it('marks stripe as stripe and UA rails as amount', () => {
    expect(pricingModeForRail('stripe_platform')).toBe('stripe');
    expect(pricingModeForRail('liqpay_platform')).toBe('amount');
    expect(pricingModeForRail('monopay_platform')).toBe('amount');
    expect(pricingModeForRail('wayforpay_platform')).toBe('amount');
  });
});

describe('platform billing secrets crypto', () => {
  const key = 'test-platform-billing-master-key-32b!!';

  it('round-trips encryption', () => {
    const payload = encryptPlatformBillingSecrets(
      { stripe_platform: { secretKey: 'sk_test_1', webhookSecret: 'whsec_1' } },
      key,
    );
    expect(decryptPlatformBillingSecrets(payload, key)).toEqual({
      stripe_platform: { secretKey: 'sk_test_1', webhookSecret: 'whsec_1' },
    });
  });

  it('merges secret updates without wiping siblings', () => {
    const merged = mergePlatformBillingSecrets(
      { stripe_platform: { secretKey: 'sk_old', webhookSecret: 'whsec_old' } },
      { stripe_platform: { secretKey: 'sk_new' } },
    );
    expect(merged.stripe_platform).toEqual({ secretKey: 'sk_new', webhookSecret: 'whsec_old' });
  });
});

describe('priceIdForPlan with overrides', () => {
  const prevStarter = process.env['STRIPE_PRICE_STARTER'];
  const prevPro = process.env['STRIPE_PRICE_PRO'];

  beforeEach(() => {
    process.env['STRIPE_PRICE_STARTER'] = 'price_env_starter';
    process.env['STRIPE_PRICE_PRO'] = 'price_env_pro';
  });

  afterEach(() => {
    process.env['STRIPE_PRICE_STARTER'] = prevStarter;
    process.env['STRIPE_PRICE_PRO'] = prevPro;
  });

  it('prefers DB override over env', () => {
    expect(priceIdForPlan('STARTER', { starter: 'price_db_starter' })).toBe('price_db_starter');
    expect(planForPriceId('price_db_pro', { pro: 'price_db_pro' })).toBe('PRO');
  });

  it('falls back to env when override empty', () => {
    expect(priceIdForPlan('PRO', { pro: '' })).toBe('price_env_pro');
  });
});
