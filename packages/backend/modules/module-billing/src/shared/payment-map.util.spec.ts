import {
  DEFAULT_PAYMENT_CONFIG,
  finalizePaymentConfig,
  getLemonSqueezyRuntimeConfig,
  getMonoPayRuntimeConfig,
  getPaddleRuntimeConfig,
  getPaymentMethodStatuses,
  getPayPalRuntimeConfig,
  getStripeRuntimeConfig,
  parsePaymentConfig,
  parseStudentPaymentMethodSelection,
  resolvePackagesForPrice,
  resolveStudentPaymentMethods,
  shouldChargeLesson,
  validateStudentPaymentMethodSelection,
} from './payment-map.util';
import {
  getPaymentSettingsCurrencyIssues,
  getPricePerLessonForCurrency,
} from '@pkg/types';
import {
  decryptPaymentSecrets,
  encryptPaymentSecrets,
} from './payment-secrets.util';

describe('payment currency pricing', () => {
  it('finalizes per-currency lesson prices from legacy default price', () => {
    const config = finalizePaymentConfig(
      parsePaymentConfig({
        defaultPricePerLessonMinor: 45000,
        defaultCurrency: 'UAH',
        allowedCurrencies: ['UAH', 'USD'],
      }),
    );
    expect(getPricePerLessonForCurrency(config, 'UAH')).toBe(45000);
    expect(getPricePerLessonForCurrency(config, 'USD')).toBe(0);
  });

  it('blocks incompatible provider and currency combinations on save', () => {
    const issues = getPaymentSettingsCurrencyIssues({
      enabledMethods: ['liqpay'],
      config: finalizePaymentConfig(
        parsePaymentConfig({
          defaultCurrency: 'GBP',
          allowedCurrencies: ['GBP'],
          defaultPricePerLessonMinor: 1500,
          packages: [{ id: 'p1', lessons: 3, label: 'Starter', currency: 'GBP' }],
        }),
      ),
    });
    expect(issues.some((issue) => issue.includes('LiqPay'))).toBe(true);
  });

  it('validates per-package currency against enabled providers', () => {
    const issues = getPaymentSettingsCurrencyIssues({
      enabledMethods: ['liqpay', 'stripe'],
      config: finalizePaymentConfig(
        parsePaymentConfig({
          defaultCurrency: 'UAH',
          allowedCurrencies: ['UAH', 'GBP'],
          defaultPricePerLessonMinor: 45000,
          pricePerLessonByCurrency: [
            { currency: 'UAH', pricePerLessonMinor: 45000 },
            { currency: 'GBP', pricePerLessonMinor: 1500 },
          ],
          packages: [
            { id: 'uah', lessons: 10, label: '10 UAH', currency: 'UAH' },
            { id: 'gbp', lessons: 10, label: '10 GBP', currency: 'GBP' },
          ],
        }),
      ),
    });
    expect(issues.some((issue) => issue.includes('LiqPay') && issue.includes('GBP'))).toBe(true);
    expect(issues.some((issue) => issue.includes('Stripe') && issue.includes('UAH'))).toBe(false);
  });

  it('requires Lemon Squeezy variant currency when enabled', () => {
    const issues = getPaymentSettingsCurrencyIssues({
      enabledMethods: ['lemonsqueezy'],
      config: finalizePaymentConfig(
        parsePaymentConfig({
          defaultCurrency: 'USD',
          allowedCurrencies: ['USD'],
          defaultPricePerLessonMinor: 1200,
          packages: [{ id: 'p1', lessons: 5, label: 'Pack', currency: 'USD' }],
          lemonsqueezy: { mode: 'test' },
        }),
      ),
    });
    expect(issues.some((issue) => issue.includes('variant currency'))).toBe(true);
  });

  it('normalizes package currency on finalize', () => {
    const config = finalizePaymentConfig(
      parsePaymentConfig({
        defaultCurrency: 'UAH',
        allowedCurrencies: ['UAH', 'USD'],
        defaultPricePerLessonMinor: 45000,
        packages: [{ id: 'p1', lessons: 5, label: 'Pack' }],
      }),
    );
    expect(config.packages[0]?.currency).toBe('UAH');
  });
});

describe('parsePaymentConfig legacy packages', () => {
  it('infers defaultPricePerLessonMinor from package amountMinor', () => {
    const config = parsePaymentConfig({
      packages: [{ id: 'p1', lessons: 4, amountMinor: 200000, label: '4 lessons' }],
    });
    expect(config.defaultPricePerLessonMinor).toBe(50000);
    expect(config.packages[0].lessons).toBe(4);
  });
});

describe('resolvePackagesForPrice', () => {
  it('multiplies lessons by price per lesson', () => {
    const config = parsePaymentConfig({
      defaultPricePerLessonMinor: 10000,
      defaultCurrency: 'UAH',
      packages: [{ id: 'p1', lessons: 3, label: '3 lessons' }],
    });
    const resolved = resolvePackagesForPrice(config, 12000, true);
    expect(resolved[0].amountMinor).toBe(36000);
    expect(resolved[0].pricePerLessonMinor).toBe(12000);
    expect(resolved[0].isCustomPrice).toBe(true);
    expect(resolved[0].lessonsLocked).toBe(false);
  });

  it('parses allowedCurrencies and minPackageLessons', () => {
    const config = parsePaymentConfig({
      allowedCurrencies: ['USD', 'UAH'],
      defaultCurrency: 'USD',
      minPackageLessons: 5,
      defaultPricePerLessonMinor: 1200,
      pricePerLessonByCurrency: [
        { currency: 'USD', pricePerLessonMinor: 1200 },
        { currency: 'UAH', pricePerLessonMinor: 45000 },
      ],
    });
    expect(config.allowedCurrencies).toEqual(['USD', 'UAH']);
    expect(config.defaultCurrency).toBe('USD');
    expect(config.minPackageLessons).toBe(5);
    expect(config.pricePerLessonByCurrency).toEqual([
      { currency: 'USD', pricePerLessonMinor: 1200 },
      { currency: 'UAH', pricePerLessonMinor: 45000 },
    ]);
  });
});

describe('student payment method selection', () => {
  it('treats an empty allowlist as all enabled methods', () => {
    const selection = validateStudentPaymentMethodSelection(['stripe', 'manual_invoice'], {
      allowedMethods: [],
    });

    expect(resolveStudentPaymentMethods(['stripe', 'manual_invoice'], selection)).toEqual([
      'stripe',
      'manual_invoice',
    ]);
  });

  it('filters the enabled list down to the selected allowlist', () => {
    const selection = validateStudentPaymentMethodSelection(
      ['stripe', 'manual_invoice', 'paypal'],
      {
        allowedMethods: ['paypal', 'manual_invoice'],
        restrictToAllowlistOnly: true,
      },
      { strict: true },
    );

    expect(
      resolveStudentPaymentMethods(['stripe', 'manual_invoice', 'paypal'], selection).sort(),
    ).toEqual(['manual_invoice', 'paypal']);
  });

  it('adds newly enabled platform methods for non-restrictive legacy allowlists', () => {
    const selection = validateStudentPaymentMethodSelection(['stripe', 'manual_invoice'], {
      allowedMethods: ['stripe'],
      restrictToAllowlistOnly: false,
    });

    expect(
      resolveStudentPaymentMethods(
        ['stripe', 'manual_invoice', 'monopay', 'paypal'],
        selection,
      ),
    ).toEqual(['stripe', 'manual_invoice', 'monopay', 'paypal']);
  });

  it('keeps a strict allowlist when staff saved restrictToAllowlistOnly', () => {
    const selection = validateStudentPaymentMethodSelection(
      ['stripe', 'manual_invoice', 'monopay'],
      {
        allowedMethods: ['stripe'],
        restrictToAllowlistOnly: true,
      },
      { strict: true },
    );

    expect(
      resolveStudentPaymentMethods(['stripe', 'manual_invoice', 'monopay'], selection),
    ).toEqual(['stripe']);
  });

  it('does not restore platform methods removed from the school allowlist', () => {
    const selection = validateStudentPaymentMethodSelection(['stripe', 'paypal'], {
      allowedMethods: ['stripe', 'paypal'],
    });

    expect(resolveStudentPaymentMethods(['stripe', 'manual_invoice'], selection)).toEqual([
      'stripe',
    ]);
  });

  it('rejects payment methods that are not enabled platform-wide in strict mode', () => {
    expect(() =>
      validateStudentPaymentMethodSelection(
        ['stripe', 'manual_invoice'],
        {
          allowedMethods: ['paypal'],
        },
        { strict: true },
      ),
    ).toThrow('payment method selection contains methods that are not enabled platform-wide');
  });

  it('parses payment method selection from JSON payloads', () => {
    expect(
      parseStudentPaymentMethodSelection({
        allowedMethods: ['manual_invoice', 'stripe', 'stripe', 'unknown'],
      }),
    ).toEqual({
      allowedMethods: ['manual_invoice', 'stripe'],
      restrictToAllowlistOnly: false,
    });
  });
});

describe('getPaymentMethodStatuses', () => {
  const ENV_KEYS = [
    'STRIPE_LIVE_SECRET_KEY',
    'STRIPE_TEST_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_LIVE_WEBHOOK_SECRET',
    'STRIPE_TEST_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_SECRET',
    'LIQPAY_LIVE_PUBLIC_KEY',
    'LIQPAY_TEST_PUBLIC_KEY',
    'LIQPAY_PUBLIC_KEY',
    'LIQPAY_LIVE_PRIVATE_KEY',
    'LIQPAY_TEST_PRIVATE_KEY',
    'LIQPAY_PRIVATE_KEY',
    'WAYFORPAY_LIVE_SECRET_KEY',
    'WAYFORPAY_TEST_SECRET_KEY',
    'WAYFORPAY_SECRET_KEY',
    'WAYFORPAY_LIVE_MERCHANT_ACCOUNT',
    'WAYFORPAY_TEST_MERCHANT_ACCOUNT',
    'WAYFORPAY_MERCHANT_ACCOUNT',
    'WAYFORPAY_LIVE_MERCHANT_DOMAIN',
    'WAYFORPAY_TEST_MERCHANT_DOMAIN',
    'WAYFORPAY_MERCHANT_DOMAIN',
    'LEMONSQUEEZY_LIVE_API_KEY',
    'LEMONSQUEEZY_TEST_API_KEY',
    'LEMONSQUEEZY_API_KEY',
    'LEMONSQUEEZY_LIVE_WEBHOOK_SECRET',
    'LEMONSQUEEZY_TEST_WEBHOOK_SECRET',
    'LEMONSQUEEZY_WEBHOOK_SECRET',
    'PADDLE_LIVE_API_KEY',
    'PADDLE_TEST_API_KEY',
    'PADDLE_API_KEY',
    'PADDLE_LIVE_WEBHOOK_SECRET',
    'PADDLE_TEST_WEBHOOK_SECRET',
    'PADDLE_WEBHOOK_SECRET',
    'MONOPAY_LIVE_TOKEN',
    'MONOPAY_TEST_TOKEN',
    'MONOPAY_TOKEN',
    'PAYPAL_LIVE_CLIENT_ID',
    'PAYPAL_TEST_CLIENT_ID',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_LIVE_CLIENT_SECRET',
    'PAYPAL_TEST_CLIENT_SECRET',
    'PAYPAL_CLIENT_SECRET',
    'PAYPAL_LIVE_WEBHOOK_ID',
    'PAYPAL_TEST_WEBHOOK_ID',
    'PAYPAL_WEBHOOK_ID',
  ] as const;

  const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  it('marks manual_invoice configured only when at least one valid method exists', () => {
    const config = parsePaymentConfig(DEFAULT_PAYMENT_CONFIG);
    let manual = getPaymentMethodStatuses(config, []).find((m) => m.id === 'manual_invoice');
    expect(manual?.configured).toBe(false);

    manual = getPaymentMethodStatuses(
      parsePaymentConfig({
        manualInvoiceMethods: [
          {
            id: 'iban-main',
            kind: 'iban_sepa',
            label: 'Primary IBAN',
            description: 'Main EUR account',
            receiptHintUk: 'Send the receipt to admin',
            paymentReferenceHint: 'Student name',
            recipientTaxId: '1234567890',
            paymentPurpose: 'За ведення уроків',
            importantNotes: ['SEPA only'],
            beneficiaryName: 'SoEnglish',
            iban: 'DE89370400440532013000',
            bic: 'DEUTDEFF',
          },
        ],
      }),
      [],
    ).find((m) => m.id === 'manual_invoice');
    expect(manual?.configured).toBe(true);
    expect(manual?.configuredLabel).toBe('1 manual method configured');
  });

  it('reports partial manual method readiness in configuredLabel', () => {
    const manual = getPaymentMethodStatuses(
      parsePaymentConfig({
        manualInvoiceMethods: [
          {
            id: 'iban-main',
            kind: 'iban_sepa',
            label: 'Primary IBAN',
            description: 'Main EUR account',
            receiptHintUk: 'Send the receipt to admin',
            paymentReferenceHint: 'Student name',
            recipientTaxId: '1234567890',
            paymentPurpose: 'За ведення уроків',
            importantNotes: ['SEPA only'],
            beneficiaryName: 'SoEnglish',
            iban: 'DE89370400440532013000',
            bic: 'DEUTDEFF',
          },
          {
            id: 'swift-draft',
            kind: 'swift_wire',
            label: 'USD wire',
            description: '',
            receiptHintUk: '',
            paymentReferenceHint: '',
            recipientTaxId: null,
            paymentPurpose: null,
            importantNotes: [],
            beneficiaryName: '',
            accountNumber: '',
            iban: null,
            bankName: null,
            bankAddress: null,
            swiftBic: '',
            beneficiaryAddress: null,
            intermediaryBankName: null,
            intermediarySwiftBic: null,
          },
        ],
      }),
      [],
    ).find((m) => m.id === 'manual_invoice');
    expect(manual?.configuredLabel).toBe('1 of 2 manual methods ready');
  });

  it('marks manual_invoice configured for valid card transfer methods', () => {
    const manual = getPaymentMethodStatuses(
      parsePaymentConfig({
        manualInvoiceMethods: [
          {
            id: 'card-main',
            kind: 'card_transfer',
            label: 'Main card',
            description: 'Direct card transfer',
            receiptHintUk: 'Send receipt',
            paymentReferenceHint: 'Student name',
            recipientTaxId: null,
            paymentPurpose: null,
            importantNotes: [],
            beneficiaryName: 'Teriv Mykola',
            bankName: 'MonoBank',
            cardNumber: '4441111122223333',
          },
        ],
      }),
      [],
    ).find((m) => m.id === 'manual_invoice');
    expect(manual?.configured).toBe(true);
  });

  it('marks stripe configured for the selected live mode env', () => {
    delete process.env.STRIPE_LIVE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    const config = parsePaymentConfig({});
    let stripe = getPaymentMethodStatuses(config, []).find((m) => m.id === 'stripe');
    expect(stripe?.configured).toBe(false);
    expect(stripe?.mode).toBe('live');

    process.env.STRIPE_LIVE_SECRET_KEY = 'sk_live_123';
    stripe = getPaymentMethodStatuses(config, []).find((m) => m.id === 'stripe');
    expect(stripe?.configured).toBe(true);
  });

  it('marks stripe configured when the school secret is stored in system settings', () => {
    delete process.env.STRIPE_LIVE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    const stripe = getPaymentMethodStatuses(parsePaymentConfig({}), [], {
      stripe: { liveSecretKey: 'sk_live_school' },
    }).find((m) => m.id === 'stripe');
    expect(stripe?.configured).toBe(true);
  });

  it('parses legacy liqpay sandbox config into test mode fields', () => {
    const config = parsePaymentConfig({});
    expect(config.liqpay?.mode).toBe('live');

    const legacySandbox = parsePaymentConfig({
      liqpaySandbox: true,
      liqpay: { publicKey: 'sandbox_public_key' },
    });
    expect(legacySandbox.liqpay?.mode).toBe('test');
    expect(legacySandbox.liqpay?.testPublicKey).toBe('sandbox_public_key');
  });

  it('marks wayforpay configured only with active-mode secret and merchant settings', () => {
    delete process.env.WAYFORPAY_LIVE_SECRET_KEY;
    delete process.env.WAYFORPAY_SECRET_KEY;
    const config = parsePaymentConfig({
      wayforpay: {
        mode: 'live',
        liveMerchantAccount: 'merchant',
        liveMerchantDomainName: 'soenglish.com',
      },
    });
    let method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'wayforpay');
    expect(method?.configured).toBe(false);

    process.env.WAYFORPAY_LIVE_SECRET_KEY = 'secret';
    method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'wayforpay');
    expect(method?.configured).toBe(true);
  });

  it('marks lemonsqueezy configured only with active-mode api, webhook, store and variant', () => {
    delete process.env.LEMONSQUEEZY_TEST_API_KEY;
    delete process.env.LEMONSQUEEZY_TEST_WEBHOOK_SECRET;
    const config = parsePaymentConfig({
      lemonsqueezy: {
        mode: 'test',
        testStoreId: '1',
        testVariantId: '2',
      },
    });
    let method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'lemonsqueezy');
    expect(method?.configured).toBe(false);
    expect(method?.mode).toBe('test');

    process.env.LEMONSQUEEZY_TEST_API_KEY = 'ls_test_key';
    process.env.LEMONSQUEEZY_TEST_WEBHOOK_SECRET = 'ls_test_secret';
    method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'lemonsqueezy');
    expect(method?.configured).toBe(true);
  });

  it('marks paddle configured only with active-mode api and webhook secrets', () => {
    delete process.env.PADDLE_TEST_API_KEY;
    delete process.env.PADDLE_TEST_WEBHOOK_SECRET;
    const config = parsePaymentConfig({ paddle: { mode: 'test' } });
    let method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'paddle');
    expect(method?.configured).toBe(false);

    process.env.PADDLE_TEST_API_KEY = 'pdl_sdbx_apikey_x';
    process.env.PADDLE_TEST_WEBHOOK_SECRET = 'pdl_ntfset_secret';
    method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'paddle');
    expect(method?.configured).toBe(true);
  });

  it('marks monopay configured only with active-mode token', () => {
    delete process.env.MONOPAY_TEST_TOKEN;
    const config = parsePaymentConfig({ monopay: { mode: 'test' } });
    let method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'monopay');
    expect(method?.configured).toBe(false);
    expect(method?.mode).toBe('test');

    process.env.MONOPAY_TEST_TOKEN = 'mono_test_token';
    method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'monopay');
    expect(method?.configured).toBe(true);
  });

  it('marks paypal configured only with client id, client secret and webhook id', () => {
    delete process.env.PAYPAL_TEST_CLIENT_SECRET;
    delete process.env.PAYPAL_TEST_WEBHOOK_ID;
    const config = parsePaymentConfig({
      paypal: {
        mode: 'test',
        testClientId: 'paypal-client-id',
      },
    });
    let method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'paypal');
    expect(method?.configured).toBe(false);
    expect(method?.mode).toBe('test');

    process.env.PAYPAL_TEST_CLIENT_SECRET = 'paypal-secret';
    process.env.PAYPAL_TEST_WEBHOOK_ID = 'WH-123';
    method = getPaymentMethodStatuses(config, []).find((m) => m.id === 'paypal');
    expect(method?.configured).toBe(true);
  });
});

describe('runtime config helpers', () => {
  afterEach(() => {
    delete process.env.STRIPE_TEST_SECRET_KEY;
    delete process.env.STRIPE_TEST_WEBHOOK_SECRET;
    delete process.env.PADDLE_TEST_API_KEY;
    delete process.env.PADDLE_TEST_WEBHOOK_SECRET;
    delete process.env.LEMONSQUEEZY_TEST_API_KEY;
    delete process.env.LEMONSQUEEZY_TEST_WEBHOOK_SECRET;
    delete process.env.MONOPAY_TEST_TOKEN;
    delete process.env.PAYPAL_TEST_CLIENT_ID;
    delete process.env.PAYPAL_TEST_CLIENT_SECRET;
    delete process.env.PAYPAL_TEST_WEBHOOK_ID;
  });

  it('selects stripe test credentials from active mode', () => {
    process.env.STRIPE_TEST_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_TEST_WEBHOOK_SECRET = 'whsec_test_123';
    const runtime = getStripeRuntimeConfig(
      parsePaymentConfig({
        stripe: {
          mode: 'test',
          testPublishableKey: 'pk_test_123',
        },
      }),
    );
    expect(runtime.mode).toBe('test');
    expect(runtime.publishableKey).toBe('pk_test_123');
    expect(runtime.secretKey).toBe('sk_test_123');
    expect(runtime.webhookSecret).toBe('whsec_test_123');
  });

  it('prefers stored school stripe secret over env fallback', () => {
    process.env.STRIPE_TEST_SECRET_KEY = 'sk_test_env';
    const runtime = getStripeRuntimeConfig(
      parsePaymentConfig({
        stripe: {
          mode: 'test',
          testPublishableKey: 'pk_test_123',
        },
      }),
      {
        stripe: {
          testSecretKey: 'sk_test_school',
        },
      },
    );
    expect(runtime.secretKey).toBe('sk_test_school');
  });

  it('selects lemonsqueezy test ids and keys from active mode', () => {
    process.env.LEMONSQUEEZY_TEST_API_KEY = 'ls_test_key';
    process.env.LEMONSQUEEZY_TEST_WEBHOOK_SECRET = 'ls_test_secret';
    const runtime = getLemonSqueezyRuntimeConfig(
      parsePaymentConfig({
        lemonsqueezy: {
          mode: 'test',
          testStoreId: 'store-test',
          testVariantId: 'variant-test',
        },
      }),
    );
    expect(runtime.mode).toBe('test');
    expect(runtime.storeId).toBe('store-test');
    expect(runtime.variantId).toBe('variant-test');
    expect(runtime.apiKey).toBe('ls_test_key');
    expect(runtime.webhookSecret).toBe('ls_test_secret');
    expect(runtime.testMode).toBe(true);
  });

  it('selects paddle sandbox base URL in test mode', () => {
    process.env.PADDLE_TEST_API_KEY = 'pdl_sdbx_apikey_123';
    process.env.PADDLE_TEST_WEBHOOK_SECRET = 'pdl_ntfset_secret';
    const runtime = getPaddleRuntimeConfig(parsePaymentConfig({ paddle: { mode: 'test' } }));
    expect(runtime.mode).toBe('test');
    expect(runtime.apiBaseUrl).toBe('https://sandbox-api.paddle.com');
    expect(runtime.apiKey).toBe('pdl_sdbx_apikey_123');
    expect(runtime.webhookSecret).toBe('pdl_ntfset_secret');
  });

  it('selects monopay test token from active mode', () => {
    process.env.MONOPAY_TEST_TOKEN = 'mono_test_token';
    const runtime = getMonoPayRuntimeConfig(parsePaymentConfig({ monopay: { mode: 'test' } }));
    expect(runtime.mode).toBe('test');
    expect(runtime.token).toBe('mono_test_token');
    expect(runtime.apiBaseUrl).toBe('https://api.monobank.ua');
  });

  it('selects paypal sandbox config and prefers stored school secrets', () => {
    process.env.PAYPAL_TEST_CLIENT_ID = 'paypal-client-env';
    process.env.PAYPAL_TEST_CLIENT_SECRET = 'paypal-secret-env';
    process.env.PAYPAL_TEST_WEBHOOK_ID = 'WH-env';
    const runtime = getPayPalRuntimeConfig(
      parsePaymentConfig({
        paypal: {
          mode: 'test',
          testClientId: 'paypal-client-ui',
        },
      }),
      {
        paypal: {
          testClientSecret: 'paypal-secret-school',
          testWebhookId: 'WH-school',
        },
      },
    );
    expect(runtime.mode).toBe('test');
    expect(runtime.clientId).toBe('paypal-client-ui');
    expect(runtime.clientSecret).toBe('paypal-secret-school');
    expect(runtime.webhookId).toBe('WH-school');
    expect(runtime.apiBaseUrl).toBe('https://api-m.sandbox.paypal.com');
  });

  it('encrypts and decrypts stored school payment secrets', () => {
    const encrypted = encryptPaymentSecrets(
      {
        stripe: { liveSecretKey: 'sk_live_123' },
        paddle: { testWebhookSecret: 'pdl_secret_123' },
      },
      'master-secret',
    );
    const decrypted = decryptPaymentSecrets(encrypted, 'master-secret');
    expect(decrypted.stripe?.liveSecretKey).toBe('sk_live_123');
    expect(decrypted.paddle?.testWebhookSecret).toBe('pdl_secret_123');
  });
});

describe('shouldChargeLesson', () => {
  it('charges completed lessons', () => {
    expect(shouldChargeLesson('COMPLETED', false)).toBe(true);
  });

  it('charges cancelled lessons when credited', () => {
    expect(shouldChargeLesson('CANCELLED', true)).toBe(true);
    expect(shouldChargeLesson('CANCELLED', false)).toBe(false);
  });

  it('does not charge planned lessons', () => {
    expect(shouldChargeLesson('PLANNED', true)).toBe(false);
  });
});
