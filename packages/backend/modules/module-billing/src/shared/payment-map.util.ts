import type { PaymentMethodKind } from '@prisma/client';
import type {
  LessonPackageDto,
  MonoPayConfigDto,
  PaddleConfigDto,
  PayPalConfigDto,
  PaymentConfigDto,
  PaymentEnvironmentModeDto,
  PaymentMethodKindDto,
  PaymentMethodStatusDto,
  PaymentSecretsDto,
  PaymentCurrencyCode,
  ResolvedLessonPackageDto,
  StudentPaymentMethodSelectionDto,
  StripeConfigDto,
  LiqPayConfigDto,
  WayForPayConfigDto,
  LemonSqueezyConfigDto,
} from '@pkg/types';
import {
  DEFAULT_ALLOWED_CURRENCIES,
  DEFAULT_PAYMENT_ENVIRONMENT_MODE,
  DEFAULT_MIN_PACKAGE_LESSONS,
  formatManualInvoiceConfiguredLabel,
  isManualInvoiceMethodConfigured,
  isPaymentCurrencyCode,
  normalizeAllowedCurrencies,
  normalizePricePerLessonByCurrency,
  getPricePerLessonForCurrency,
} from '@pkg/types';
import {
  manualInvoiceMethodsToJson,
  parseManualInvoiceMethods,
} from './manual-invoice-map.util';

export const DEFAULT_PAYMENT_CONFIG: PaymentConfigDto = {
  packages: [],
  defaultPricePerLessonMinor: 0,
  pricePerLessonByCurrency: [],
  defaultCurrency: 'UAH',
  allowedCurrencies: [...DEFAULT_ALLOWED_CURRENCIES],
  minPackageLessons: DEFAULT_MIN_PACKAGE_LESSONS,
  manualInvoiceMethods: [],
  stripe: { mode: DEFAULT_PAYMENT_ENVIRONMENT_MODE },
  liqpay: { mode: DEFAULT_PAYMENT_ENVIRONMENT_MODE },
  wayforpay: { mode: DEFAULT_PAYMENT_ENVIRONMENT_MODE },
  lemonsqueezy: { mode: DEFAULT_PAYMENT_ENVIRONMENT_MODE },
  paddle: { mode: DEFAULT_PAYMENT_ENVIRONMENT_MODE },
  monopay: { mode: DEFAULT_PAYMENT_ENVIRONMENT_MODE },
  paypal: { mode: DEFAULT_PAYMENT_ENVIRONMENT_MODE },
};

export function paymentMethodToDto(value: PaymentMethodKind): PaymentMethodKindDto {
  if (value === 'STRIPE') return 'stripe';
  if (value === 'LIQPAY') return 'liqpay';
  if (value === 'WAYFORPAY') return 'wayforpay';
  if (value === 'LEMON_SQUEEZY') return 'lemonsqueezy';
  if (value === 'PADDLE') return 'paddle';
  if (value === 'MONOPAY') return 'monopay';
  if (value === 'PAYPAL') return 'paypal';
  return 'manual_invoice';
}

export function paymentMethodFromDto(value: PaymentMethodKindDto): PaymentMethodKind {
  if (value === 'stripe') return 'STRIPE';
  if (value === 'liqpay') return 'LIQPAY';
  if (value === 'wayforpay') return 'WAYFORPAY';
  if (value === 'lemonsqueezy') return 'LEMON_SQUEEZY';
  if (value === 'paddle') return 'PADDLE';
  if (value === 'monopay') return 'MONOPAY';
  if (value === 'paypal') return 'PAYPAL';
  return 'MANUAL_INVOICE';
}

const PAYMENT_METHOD_KIND_SET = new Set<PaymentMethodKindDto>([
  'manual_invoice',
  'stripe',
  'liqpay',
  'wayforpay',
  'lemonsqueezy',
  'paddle',
  'monopay',
  'paypal',
]);

export const DEFAULT_STUDENT_PAYMENT_METHOD_SELECTION: StudentPaymentMethodSelectionDto = {
  allowedMethods: [],
  restrictToAllowlistOnly: false,
};

export function parseStudentPaymentMethodSelection(
  raw: unknown,
): StudentPaymentMethodSelectionDto {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_STUDENT_PAYMENT_METHOD_SELECTION };
  const obj = raw as Record<string, unknown>;
  const allowedMethods = Array.isArray(obj['allowedMethods'])
    ? [
        ...new Set(
          obj['allowedMethods']
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter(
              (value): value is PaymentMethodKindDto =>
                PAYMENT_METHOD_KIND_SET.has(value as PaymentMethodKindDto),
            ),
        ),
      ]
    : [];
  return {
    allowedMethods,
    restrictToAllowlistOnly: obj['restrictToAllowlistOnly'] === true,
  };
}

export function studentPaymentMethodSelectionToJson(
  selection: StudentPaymentMethodSelectionDto,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    allowedMethods: [
      ...new Set(
        selection.allowedMethods
          .map((value) => value.trim())
          .filter(
            (value): value is PaymentMethodKindDto =>
              PAYMENT_METHOD_KIND_SET.has(value as PaymentMethodKindDto),
          ),
      ),
    ],
  };
  if (selection.restrictToAllowlistOnly === true) {
    payload.restrictToAllowlistOnly = true;
  }
  return payload;
}

export function validateStudentPaymentMethodSelection(
  enabledMethods: PaymentMethodKindDto[],
  selection: StudentPaymentMethodSelectionDto,
  options?: { strict?: boolean },
): StudentPaymentMethodSelectionDto {
  const enabledSet = new Set(enabledMethods);
  const allowedMethods = selection.allowedMethods.filter((method) => enabledSet.has(method));
  if (options?.strict && allowedMethods.length !== selection.allowedMethods.length) {
    throw new Error('payment method selection contains methods that are not enabled platform-wide');
  }
  return {
    allowedMethods,
    restrictToAllowlistOnly: selection.restrictToAllowlistOnly === true,
  };
}

export function resolveStudentPaymentMethods(
  enabledMethods: PaymentMethodKindDto[],
  selection: StudentPaymentMethodSelectionDto,
): PaymentMethodKindDto[] {
  if (selection.allowedMethods.length === 0) return enabledMethods;

  const enabledSet = new Set(enabledMethods);
  const intersection = selection.allowedMethods.filter((method) => enabledSet.has(method));

  if (selection.restrictToAllowlistOnly) {
    return intersection;
  }

  // Non-restrictive allowlist (legacy migration default): keep valid selections and add
  // providers enabled in System → Payments after the snapshot was saved.
  const selectionStillFullyEnabled = selection.allowedMethods.every((method) =>
    enabledSet.has(method),
  );
  if (!selectionStillFullyEnabled) return intersection;

  const newPlatformMethods = enabledMethods.filter(
    (method) => !selection.allowedMethods.includes(method),
  );
  if (newPlatformMethods.length === 0) return intersection;

  return [...new Set([...intersection, ...newPlatformMethods])];
}

function inferDefaultPriceFromLegacyPackages(
  packages: Array<{ lessons: number; amountMinor?: number }>,
): number {
  const first = packages.find((p) => p.lessons > 0 && (p.amountMinor ?? 0) > 0);
  if (!first?.amountMinor) return 0;
  return Math.round(first.amountMinor / first.lessons);
}

function normalizePaymentMode(value: unknown): PaymentEnvironmentModeDto {
  return value === 'test' ? 'test' : DEFAULT_PAYMENT_ENVIRONMENT_MODE;
}

function cleanOptional(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function buildStripeConfig(raw: Record<string, unknown> | undefined): StripeConfigDto {
  const mode = normalizePaymentMode(raw?.['mode']);
  const legacyPublishableKey = cleanOptional(raw?.['publishableKey']);
  return {
    mode,
    livePublishableKey:
      cleanOptional(raw?.['livePublishableKey']) ??
      (mode === 'live' ? legacyPublishableKey : undefined),
    testPublishableKey:
      cleanOptional(raw?.['testPublishableKey']) ??
      (mode === 'test' ? legacyPublishableKey : undefined),
  };
}

function buildLiqPayConfig(
  raw: Record<string, unknown> | undefined,
  legacySandbox: boolean,
): LiqPayConfigDto {
  const mode = legacySandbox ? 'test' : normalizePaymentMode(raw?.['mode']);
  const legacyPublicKey = cleanOptional(raw?.['publicKey']);
  return {
    mode,
    livePublicKey:
      cleanOptional(raw?.['livePublicKey']) ??
      (!legacySandbox ? legacyPublicKey : undefined),
    testPublicKey:
      cleanOptional(raw?.['testPublicKey']) ??
      (legacySandbox ? legacyPublicKey : undefined),
  };
}

function buildWayForPayConfig(raw: Record<string, unknown> | undefined): WayForPayConfigDto {
  const mode = normalizePaymentMode(raw?.['mode']);
  const legacyMerchantAccount = cleanOptional(raw?.['merchantAccount']);
  const legacyMerchantDomainName = cleanOptional(raw?.['merchantDomainName']);
  return {
    mode,
    liveMerchantAccount:
      cleanOptional(raw?.['liveMerchantAccount']) ??
      (mode === 'live' ? legacyMerchantAccount : undefined),
    liveMerchantDomainName:
      cleanOptional(raw?.['liveMerchantDomainName']) ??
      (mode === 'live' ? legacyMerchantDomainName : undefined),
    testMerchantAccount:
      cleanOptional(raw?.['testMerchantAccount']) ??
      (mode === 'test' ? legacyMerchantAccount : undefined),
    testMerchantDomainName:
      cleanOptional(raw?.['testMerchantDomainName']) ??
      (mode === 'test' ? legacyMerchantDomainName : undefined),
  };
}

function buildLemonSqueezyConfig(raw: Record<string, unknown> | undefined): LemonSqueezyConfigDto {
  const mode = normalizePaymentMode(raw?.['mode']);
  const legacyStoreId = cleanOptional(raw?.['storeId']);
  const legacyVariantId = cleanOptional(raw?.['variantId']);
  const parseVariantCurrency = (value: unknown): string | undefined => {
    const upper = cleanOptional(value)?.toUpperCase();
    return upper && isPaymentCurrencyCode(upper) ? upper : undefined;
  };
  return {
    mode,
    liveStoreId:
      cleanOptional(raw?.['liveStoreId']) ??
      (mode === 'live' ? legacyStoreId : undefined),
    liveVariantId:
      cleanOptional(raw?.['liveVariantId']) ??
      (mode === 'live' ? legacyVariantId : undefined),
    liveVariantCurrency: parseVariantCurrency(raw?.['liveVariantCurrency']),
    testStoreId:
      cleanOptional(raw?.['testStoreId']) ??
      (mode === 'test' ? legacyStoreId : undefined),
    testVariantId:
      cleanOptional(raw?.['testVariantId']) ??
      (mode === 'test' ? legacyVariantId : undefined),
    testVariantCurrency: parseVariantCurrency(raw?.['testVariantCurrency']),
  };
}

function buildPaddleConfig(raw: Record<string, unknown> | undefined): PaddleConfigDto {
  return {
    mode: normalizePaymentMode(raw?.['mode']),
  };
}

function buildMonoPayConfig(raw: Record<string, unknown> | undefined): MonoPayConfigDto {
  return {
    mode: normalizePaymentMode(raw?.['mode']),
  };
}

function buildPayPalConfig(raw: Record<string, unknown> | undefined): PayPalConfigDto {
  const mode = normalizePaymentMode(raw?.['mode']);
  const legacyClientId = cleanOptional(raw?.['clientId']);
  return {
    mode,
    liveClientId:
      cleanOptional(raw?.['liveClientId']) ??
      (mode === 'live' ? legacyClientId : undefined),
    testClientId:
      cleanOptional(raw?.['testClientId']) ??
      (mode === 'test' ? legacyClientId : undefined),
  };
}

function getLegacyOrModeEnv(
  mode: PaymentEnvironmentModeDto,
  liveEnvName: string,
  testEnvName: string,
  legacyEnvName?: string,
): string | undefined {
  if (mode === 'test') {
    return cleanOptional(process.env[testEnvName]);
  }
  return cleanOptional(process.env[liveEnvName]) ?? cleanOptional(legacyEnvName ? process.env[legacyEnvName] : undefined);
}

function getConfigModeLabel(mode: PaymentEnvironmentModeDto): string {
  return mode === 'test' ? 'Test mode' : 'Live mode';
}

function getSecretOrEnv(systemValue: string | undefined, envValue: string | undefined): string | undefined {
  return cleanOptional(systemValue) ?? cleanOptional(envValue);
}

export function getStripeRuntimeConfig(config: PaymentConfigDto, secrets?: PaymentSecretsDto) {
  const mode = config.stripe?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE;
  return {
    mode,
    publishableKey:
      mode === 'test'
        ? config.stripe?.testPublishableKey?.trim() || undefined
        : config.stripe?.livePublishableKey?.trim() || undefined,
    secretKey: getSecretOrEnv(
      mode === 'test' ? secrets?.stripe?.testSecretKey : secrets?.stripe?.liveSecretKey,
      getLegacyOrModeEnv(mode, 'STRIPE_LIVE_SECRET_KEY', 'STRIPE_TEST_SECRET_KEY', 'STRIPE_SECRET_KEY'),
    ),
    webhookSecret: getSecretOrEnv(
      mode === 'test' ? secrets?.stripe?.testWebhookSecret : secrets?.stripe?.liveWebhookSecret,
      getLegacyOrModeEnv(
        mode,
        'STRIPE_LIVE_WEBHOOK_SECRET',
        'STRIPE_TEST_WEBHOOK_SECRET',
        'STRIPE_WEBHOOK_SECRET',
      ),
    ),
  };
}

export function getLiqPayRuntimeConfig(config: PaymentConfigDto, secrets?: PaymentSecretsDto) {
  const mode = config.liqpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE;
  return {
    mode,
    publicKey:
      (mode === 'test'
        ? config.liqpay?.testPublicKey?.trim()
        : config.liqpay?.livePublicKey?.trim()) ||
      getLegacyOrModeEnv(mode, 'LIQPAY_LIVE_PUBLIC_KEY', 'LIQPAY_TEST_PUBLIC_KEY', 'LIQPAY_PUBLIC_KEY'),
    privateKey: getSecretOrEnv(
      mode === 'test' ? secrets?.liqpay?.testPrivateKey : secrets?.liqpay?.livePrivateKey,
      getLegacyOrModeEnv(
        mode,
        'LIQPAY_LIVE_PRIVATE_KEY',
        'LIQPAY_TEST_PRIVATE_KEY',
        'LIQPAY_PRIVATE_KEY',
      ),
    ),
    sandbox: mode === 'test',
  };
}

const WAYFORPAY_DEFAULT_TEST_ACCOUNT = 'test_merch_n1';
const WAYFORPAY_DEFAULT_TEST_SECRET_KEY = 'flk3409refn54t54t*FNJRET';

export function getWayForPayRuntimeConfig(config: PaymentConfigDto, secrets?: PaymentSecretsDto) {
  const mode = config.wayforpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE;
  return {
    mode,
    merchantAccount:
      (mode === 'test'
        ? config.wayforpay?.testMerchantAccount?.trim()
        : config.wayforpay?.liveMerchantAccount?.trim()) ||
      getLegacyOrModeEnv(
        mode,
        'WAYFORPAY_LIVE_MERCHANT_ACCOUNT',
        'WAYFORPAY_TEST_MERCHANT_ACCOUNT',
        'WAYFORPAY_MERCHANT_ACCOUNT',
      ) ||
      (mode === 'test' ? WAYFORPAY_DEFAULT_TEST_ACCOUNT : undefined),
    merchantDomainName:
      (mode === 'test'
        ? config.wayforpay?.testMerchantDomainName?.trim()
        : config.wayforpay?.liveMerchantDomainName?.trim()) ||
      getLegacyOrModeEnv(
        mode,
        'WAYFORPAY_LIVE_MERCHANT_DOMAIN',
        'WAYFORPAY_TEST_MERCHANT_DOMAIN',
        'WAYFORPAY_MERCHANT_DOMAIN',
      ) ||
      cleanOptional(process.env['WEB_APP_URL']),
    secretKey:
      getSecretOrEnv(
        mode === 'test' ? secrets?.wayforpay?.testSecretKey : secrets?.wayforpay?.liveSecretKey,
        getLegacyOrModeEnv(
          mode,
          'WAYFORPAY_LIVE_SECRET_KEY',
          'WAYFORPAY_TEST_SECRET_KEY',
          'WAYFORPAY_SECRET_KEY',
        ),
      ) || (mode === 'test' ? WAYFORPAY_DEFAULT_TEST_SECRET_KEY : undefined),
  };
}

export function getLemonSqueezyRuntimeConfig(config: PaymentConfigDto, secrets?: PaymentSecretsDto) {
  const mode = config.lemonsqueezy?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE;
  return {
    mode,
    apiKey: getSecretOrEnv(
      mode === 'test' ? secrets?.lemonsqueezy?.testApiKey : secrets?.lemonsqueezy?.liveApiKey,
      getLegacyOrModeEnv(
        mode,
        'LEMONSQUEEZY_LIVE_API_KEY',
        'LEMONSQUEEZY_TEST_API_KEY',
        'LEMONSQUEEZY_API_KEY',
      ),
    ),
    webhookSecret: getSecretOrEnv(
      mode === 'test'
        ? secrets?.lemonsqueezy?.testWebhookSecret
        : secrets?.lemonsqueezy?.liveWebhookSecret,
      getLegacyOrModeEnv(
        mode,
        'LEMONSQUEEZY_LIVE_WEBHOOK_SECRET',
        'LEMONSQUEEZY_TEST_WEBHOOK_SECRET',
        'LEMONSQUEEZY_WEBHOOK_SECRET',
      ),
    ),
    storeId:
      mode === 'test'
        ? config.lemonsqueezy?.testStoreId?.trim() || undefined
        : config.lemonsqueezy?.liveStoreId?.trim() || undefined,
    variantId:
      mode === 'test'
        ? config.lemonsqueezy?.testVariantId?.trim() || undefined
        : config.lemonsqueezy?.liveVariantId?.trim() || undefined,
    testMode: mode === 'test',
  };
}

export function getPaddleRuntimeConfig(config: PaymentConfigDto, secrets?: PaymentSecretsDto) {
  const mode = config.paddle?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE;
  return {
    mode,
    apiKey: getSecretOrEnv(
      mode === 'test' ? secrets?.paddle?.testApiKey : secrets?.paddle?.liveApiKey,
      getLegacyOrModeEnv(
        mode,
        'PADDLE_LIVE_API_KEY',
        'PADDLE_TEST_API_KEY',
        'PADDLE_API_KEY',
      ),
    ),
    webhookSecret: getSecretOrEnv(
      mode === 'test' ? secrets?.paddle?.testWebhookSecret : secrets?.paddle?.liveWebhookSecret,
      getLegacyOrModeEnv(
        mode,
        'PADDLE_LIVE_WEBHOOK_SECRET',
        'PADDLE_TEST_WEBHOOK_SECRET',
        'PADDLE_WEBHOOK_SECRET',
      ),
    ),
    apiBaseUrl:
      mode === 'test'
        ? 'https://sandbox-api.paddle.com'
        : 'https://api.paddle.com',
  };
}

export function getMonoPayRuntimeConfig(config: PaymentConfigDto, secrets?: PaymentSecretsDto) {
  const mode = config.monopay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE;
  return {
    mode,
    token: getSecretOrEnv(
      mode === 'test' ? secrets?.monopay?.testToken : secrets?.monopay?.liveToken,
      getLegacyOrModeEnv(mode, 'MONOPAY_LIVE_TOKEN', 'MONOPAY_TEST_TOKEN', 'MONOPAY_TOKEN'),
    ),
    apiBaseUrl: 'https://api.monobank.ua',
  };
}

export function getPayPalRuntimeConfig(config: PaymentConfigDto, secrets?: PaymentSecretsDto) {
  const mode = config.paypal?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE;
  return {
    mode,
    clientId:
      getSecretOrEnv(
        undefined,
        mode === 'test'
          ? config.paypal?.testClientId?.trim()
          : config.paypal?.liveClientId?.trim(),
      ) ||
      getLegacyOrModeEnv(mode, 'PAYPAL_LIVE_CLIENT_ID', 'PAYPAL_TEST_CLIENT_ID', 'PAYPAL_CLIENT_ID'),
    clientSecret: getSecretOrEnv(
      mode === 'test' ? secrets?.paypal?.testClientSecret : secrets?.paypal?.liveClientSecret,
      getLegacyOrModeEnv(
        mode,
        'PAYPAL_LIVE_CLIENT_SECRET',
        'PAYPAL_TEST_CLIENT_SECRET',
        'PAYPAL_CLIENT_SECRET',
      ),
    ),
    webhookId: getSecretOrEnv(
      mode === 'test' ? secrets?.paypal?.testWebhookId : secrets?.paypal?.liveWebhookId,
      getLegacyOrModeEnv(
        mode,
        'PAYPAL_LIVE_WEBHOOK_ID',
        'PAYPAL_TEST_WEBHOOK_ID',
        'PAYPAL_WEBHOOK_ID',
      ),
    ),
    apiBaseUrl:
      mode === 'test'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com',
  };
}

export function parsePaymentConfig(raw: unknown): PaymentConfigDto {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PAYMENT_CONFIG };
  const obj = raw as Record<string, unknown>;
  const stripe = (obj['stripe'] as Record<string, unknown> | undefined) ?? undefined;
  const liqpay = (obj['liqpay'] as Record<string, unknown> | undefined) ?? undefined;
  const wayforpay = (obj['wayforpay'] as Record<string, unknown> | undefined) ?? undefined;
  const lemonsqueezy = (obj['lemonsqueezy'] as Record<string, unknown> | undefined) ?? undefined;
  const paddle = (obj['paddle'] as Record<string, unknown> | undefined) ?? undefined;
  const monopay = (obj['monopay'] as Record<string, unknown> | undefined) ?? undefined;
  const paypal = (obj['paypal'] as Record<string, unknown> | undefined) ?? undefined;
  const packages = Array.isArray(obj['packages'])
    ? obj['packages']
        .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
        .map((p) => ({
          id: String(p['id'] ?? ''),
          lessons: Number(p['lessons'] ?? 0),
          label: String(p['label'] ?? ''),
          currency: p['currency'] != null ? String(p['currency']) : undefined,
          amountMinor: p['amountMinor'] != null ? Number(p['amountMinor']) : undefined,
        }))
        .filter((p) => p.id && p.lessons > 0)
    : [];

  const legacyInferred = inferDefaultPriceFromLegacyPackages(packages);
  const defaultPricePerLessonMinor =
    typeof obj['defaultPricePerLessonMinor'] === 'number'
      ? Math.max(0, Math.round(obj['defaultPricePerLessonMinor']))
      : legacyInferred;

  const allowedCurrencies = normalizeAllowedCurrencies(
    Array.isArray(obj['allowedCurrencies'])
      ? obj['allowedCurrencies'].map((c) => String(c))
      : [DEFAULT_PAYMENT_CONFIG.defaultCurrency],
  );
  let defaultCurrency =
    typeof obj['defaultCurrency'] === 'string' && obj['defaultCurrency'].trim()
      ? obj['defaultCurrency'].trim().toUpperCase()
      : DEFAULT_PAYMENT_CONFIG.defaultCurrency;
  if (!allowedCurrencies.includes(defaultCurrency as PaymentCurrencyCode)) {
    defaultCurrency = allowedCurrencies[0];
  }

  const minPackageLessons =
    typeof obj['minPackageLessons'] === 'number' && obj['minPackageLessons'] >= 1
      ? Math.round(obj['minPackageLessons'])
      : DEFAULT_MIN_PACKAGE_LESSONS;

  const rawPriceRows = Array.isArray(obj['pricePerLessonByCurrency'])
    ? obj['pricePerLessonByCurrency']
        .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
        .map((row) => ({
          currency: String(row['currency'] ?? '').toUpperCase(),
          pricePerLessonMinor: Math.max(0, Math.round(Number(row['pricePerLessonMinor'] ?? 0))),
        }))
        .filter(
          (row): row is { currency: PaymentCurrencyCode; pricePerLessonMinor: number } =>
            isPaymentCurrencyCode(row.currency),
        )
    : [];

  return finalizePaymentConfig({
    packages: packages.map(({ id, lessons, label, currency }) => ({
      id,
      lessons,
      label,
      currency:
        currency && isPaymentCurrencyCode(currency.toUpperCase())
          ? currency.toUpperCase()
          : undefined,
    })),
    defaultPricePerLessonMinor,
    pricePerLessonByCurrency: rawPriceRows,
    defaultCurrency,
    allowedCurrencies,
    minPackageLessons,
    manualInvoiceMethods: parseManualInvoiceMethods(obj['manualInvoiceMethods'], {
      instructionsUk: (obj['manualInvoice'] as Record<string, unknown> | undefined)?.['instructionsUk'],
      receiptHintUk: (obj['manualInvoice'] as Record<string, unknown> | undefined)?.['receiptHintUk'],
    }),
    stripe: buildStripeConfig(stripe),
    liqpay: buildLiqPayConfig(liqpay, obj['liqpaySandbox'] === true),
    wayforpay: buildWayForPayConfig(wayforpay),
    lemonsqueezy: buildLemonSqueezyConfig(lemonsqueezy),
    paddle: buildPaddleConfig(paddle),
    monopay: buildMonoPayConfig(monopay),
    paypal: buildPayPalConfig(paypal),
  });
}

export function finalizePaymentConfig(config: PaymentConfigDto): PaymentConfigDto {
  const allowedCurrencies = normalizeAllowedCurrencies(config.allowedCurrencies);
  const defaultCurrency = allowedCurrencies.includes(
    config.defaultCurrency.toUpperCase() as PaymentCurrencyCode,
  )
    ? config.defaultCurrency.toUpperCase()
    : allowedCurrencies[0];
  const pricePerLessonByCurrency = normalizePricePerLessonByCurrency({
    allowedCurrencies,
    defaultCurrency: defaultCurrency as PaymentCurrencyCode,
    defaultPricePerLessonMinor: config.defaultPricePerLessonMinor,
    pricePerLessonByCurrency: config.pricePerLessonByCurrency,
  });
  const defaultPricePerLessonMinor = getPricePerLessonForCurrency(
    {
      defaultCurrency,
      defaultPricePerLessonMinor: config.defaultPricePerLessonMinor,
      pricePerLessonByCurrency,
    },
    defaultCurrency,
  );
  const packages = config.packages.map((pkg) => {
    const raw = pkg.currency?.trim().toUpperCase();
    const currency =
      raw && allowedCurrencies.includes(raw as PaymentCurrencyCode)
        ? raw
        : defaultCurrency;
    return { ...pkg, currency };
  });
  return {
    ...config,
    allowedCurrencies,
    defaultCurrency,
    pricePerLessonByCurrency,
    defaultPricePerLessonMinor,
    minPackageLessons: Math.max(1, config.minPackageLessons ?? DEFAULT_MIN_PACKAGE_LESSONS),
    packages,
  };
}

export function paymentConfigToJson(config: PaymentConfigDto): Record<string, unknown> {
  const normalized = finalizePaymentConfig(config);
  const allowedCurrencies = normalized.allowedCurrencies;
  const defaultCurrency = normalized.defaultCurrency;
  return {
    packages: normalized.packages,
    defaultPricePerLessonMinor: normalized.defaultPricePerLessonMinor,
    pricePerLessonByCurrency: normalized.pricePerLessonByCurrency,
    defaultCurrency,
    allowedCurrencies,
    minPackageLessons: normalized.minPackageLessons,
    manualInvoiceMethods: manualInvoiceMethodsToJson(normalized.manualInvoiceMethods),
    stripe: {
      mode: normalized.stripe?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
      livePublishableKey: normalized.stripe?.livePublishableKey?.trim() || undefined,
      testPublishableKey: normalized.stripe?.testPublishableKey?.trim() || undefined,
    },
    liqpay: {
      mode: normalized.liqpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
      livePublicKey: normalized.liqpay?.livePublicKey?.trim() || undefined,
      testPublicKey: normalized.liqpay?.testPublicKey?.trim() || undefined,
    },
    wayforpay: {
      mode: normalized.wayforpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
      liveMerchantAccount: normalized.wayforpay?.liveMerchantAccount?.trim() || undefined,
      liveMerchantDomainName: normalized.wayforpay?.liveMerchantDomainName?.trim() || undefined,
      testMerchantAccount: normalized.wayforpay?.testMerchantAccount?.trim() || undefined,
      testMerchantDomainName: normalized.wayforpay?.testMerchantDomainName?.trim() || undefined,
    },
    lemonsqueezy: {
      mode: normalized.lemonsqueezy?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
      liveStoreId: normalized.lemonsqueezy?.liveStoreId?.trim() || undefined,
      liveVariantId: normalized.lemonsqueezy?.liveVariantId?.trim() || undefined,
      liveVariantCurrency: normalized.lemonsqueezy?.liveVariantCurrency?.trim().toUpperCase() || undefined,
      testStoreId: normalized.lemonsqueezy?.testStoreId?.trim() || undefined,
      testVariantId: normalized.lemonsqueezy?.testVariantId?.trim() || undefined,
      testVariantCurrency: normalized.lemonsqueezy?.testVariantCurrency?.trim().toUpperCase() || undefined,
    },
    paddle: {
      mode: normalized.paddle?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
    },
    monopay: {
      mode: normalized.monopay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
    },
    paypal: {
      mode: normalized.paypal?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
      liveClientId: normalized.paypal?.liveClientId?.trim() || undefined,
      testClientId: normalized.paypal?.testClientId?.trim() || undefined,
    },
  };
}

export function resolvePackagesForPrice(
  config: PaymentConfigDto,
  pricePerLessonMinor: number,
  isCustomPrice: boolean,
  packages?: LessonPackageDto[],
): ResolvedLessonPackageDto[] {
  const list = packages ?? config.packages;
  return list.map((pkg) => {
    const currency = pkg.currency ?? config.defaultCurrency;
    const platformPrice = getPricePerLessonForCurrency(config, currency);
    const resolvedPrice = isCustomPrice ? pricePerLessonMinor : platformPrice;
    return {
      ...pkg,
      currency,
      pricePerLessonMinor: resolvedPrice,
      amountMinor: pkg.lessons * resolvedPrice,
      isCustomPrice,
      lessonsLocked: false,
    };
  });
}

export function getPaymentMethodStatuses(
  config: PaymentConfigDto,
  enabledMethods: PaymentMethodKindDto[],
  secrets?: PaymentSecretsDto,
): PaymentMethodStatusDto[] {
  const all: PaymentMethodKindDto[] = [
    'manual_invoice',
    'stripe',
    'liqpay',
    'wayforpay',
    'lemonsqueezy',
    'paddle',
    'monopay',
    'paypal',
  ];
  return all.map((id) => {
    const enabled = enabledMethods.includes(id);
    if (id === 'manual_invoice') {
      const configuredCount = config.manualInvoiceMethods.filter(isManualInvoiceMethodConfigured).length;
      const ok = configuredCount > 0;
      return {
        id,
        enabled,
        configured: ok,
        configuredLabel: formatManualInvoiceConfiguredLabel(config.manualInvoiceMethods),
        mode: null,
      };
    }
    if (id === 'stripe') {
      const stripe = getStripeRuntimeConfig(config, secrets);
      const hasSecret = Boolean(stripe.secretKey);
      const hasPublishable = Boolean(stripe.publishableKey);
      const ok = hasSecret;
      let label = `${getConfigModeLabel(stripe.mode)} configured`;
      if (!hasSecret) {
        label =
          stripe.mode === 'test'
            ? 'Test mode: missing Stripe secret key'
            : 'Live mode: missing Stripe secret key';
      } else if (!hasPublishable) {
        label = `${getConfigModeLabel(stripe.mode)}: add publishable key`;
      }
      return { id, enabled, configured: ok, configuredLabel: label, mode: stripe.mode };
    }
    if (id === 'liqpay') {
      const liqpay = getLiqPayRuntimeConfig(config, secrets);
      const hasPrivate = Boolean(liqpay.privateKey);
      const hasPublic = Boolean(liqpay.publicKey);
      const ok = hasPrivate && hasPublic;
      let label = `${getConfigModeLabel(liqpay.mode)} configured`;
      if (!hasPrivate) {
        label =
          liqpay.mode === 'test'
            ? 'Test mode: missing LiqPay private key'
            : 'Live mode: missing LiqPay private key';
      } else if (!hasPublic) {
        label = `${getConfigModeLabel(liqpay.mode)}: missing LiqPay public key`;
      }
      return { id, enabled, configured: ok, configuredLabel: label, mode: liqpay.mode };
    }
    if (id === 'wayforpay') {
      const wayforpay = getWayForPayRuntimeConfig(config, secrets);
      const hasSecret = Boolean(wayforpay.secretKey);
      const hasAccount = Boolean(wayforpay.merchantAccount);
      const hasDomain = Boolean(wayforpay.merchantDomainName);
      const ok = hasSecret && hasAccount && hasDomain;
      let label = `${getConfigModeLabel(wayforpay.mode)} configured`;
      if (!hasSecret) {
        label =
          wayforpay.mode === 'test'
            ? 'Test mode: missing WayForPay secret key'
            : 'Live mode: missing WayForPay secret key';
      } else if (!hasAccount) {
        label = `${getConfigModeLabel(wayforpay.mode)}: missing merchant account`;
      } else if (!hasDomain) {
        label = `${getConfigModeLabel(wayforpay.mode)}: missing merchant domain`;
      }
      return { id, enabled, configured: ok, configuredLabel: label, mode: wayforpay.mode };
    }
    if (id === 'lemonsqueezy') {
      const lemonsqueezy = getLemonSqueezyRuntimeConfig(config, secrets);
      const hasApiKey = Boolean(lemonsqueezy.apiKey);
      const hasWebhookSecret = Boolean(lemonsqueezy.webhookSecret);
      const hasStoreId = Boolean(lemonsqueezy.storeId);
      const hasVariantId = Boolean(lemonsqueezy.variantId);
      const ok = hasApiKey && hasWebhookSecret && hasStoreId && hasVariantId;
      let label = `${getConfigModeLabel(lemonsqueezy.mode)} configured`;
      if (!hasApiKey) {
        label =
          lemonsqueezy.mode === 'test'
            ? 'Test mode: missing Lemon Squeezy API key'
            : 'Live mode: missing Lemon Squeezy API key';
      } else if (!hasWebhookSecret) {
        label =
          lemonsqueezy.mode === 'test'
            ? 'Test mode: missing Lemon Squeezy webhook secret'
            : 'Live mode: missing Lemon Squeezy webhook secret';
      } else if (!hasStoreId) {
        label = `${getConfigModeLabel(lemonsqueezy.mode)}: missing store ID`;
      } else if (!hasVariantId) {
        label = `${getConfigModeLabel(lemonsqueezy.mode)}: missing variant ID`;
      }
      return { id, enabled, configured: ok, configuredLabel: label, mode: lemonsqueezy.mode };
    }
    if (id === 'paddle') {
      const paddle = getPaddleRuntimeConfig(config, secrets);
      const hasApiKey = Boolean(paddle.apiKey);
      const hasWebhookSecret = Boolean(paddle.webhookSecret);
      const ok = hasApiKey && hasWebhookSecret;
      let label = `${getConfigModeLabel(paddle.mode)} configured`;
      if (!hasApiKey) {
        label =
          paddle.mode === 'test'
            ? 'Test mode: missing Paddle API key'
            : 'Live mode: missing Paddle API key';
      } else if (!hasWebhookSecret) {
        label =
          paddle.mode === 'test'
            ? 'Test mode: missing Paddle webhook secret'
            : 'Live mode: missing Paddle webhook secret';
      }
      return { id, enabled, configured: ok, configuredLabel: label, mode: paddle.mode };
    }
    if (id === 'monopay') {
      const monopay = getMonoPayRuntimeConfig(config, secrets);
      const ok = Boolean(monopay.token);
      const label = ok
        ? `${getConfigModeLabel(monopay.mode)} configured`
        : `${getConfigModeLabel(monopay.mode)}: missing MonoPay token`;
      return { id, enabled, configured: ok, configuredLabel: label, mode: monopay.mode };
    }
    const paypal = getPayPalRuntimeConfig(config, secrets);
    const hasClientId = Boolean(paypal.clientId);
    const hasClientSecret = Boolean(paypal.clientSecret);
    const hasWebhookId = Boolean(paypal.webhookId);
    const ok = hasClientId && hasClientSecret && hasWebhookId;
    let label = `${getConfigModeLabel(paypal.mode)} configured`;
    if (!hasClientId) {
      label = `${getConfigModeLabel(paypal.mode)}: missing PayPal client ID`;
    } else if (!hasClientSecret) {
      label = `${getConfigModeLabel(paypal.mode)}: missing PayPal client secret`;
    } else if (!hasWebhookId) {
      label = `${getConfigModeLabel(paypal.mode)}: missing PayPal webhook ID`;
    }
    return { id, enabled, configured: ok, configuredLabel: label, mode: paypal.mode };
  });
}

export function shouldChargeLesson(status: string, credited: boolean): boolean {
  if (status === 'COMPLETED') return true;
  if (status === 'CANCELLED' && credited) return true;
  return false;
}
