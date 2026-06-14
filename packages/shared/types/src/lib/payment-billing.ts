import type {
  LessonCreditTrackDto,
  ManualInvoiceMethodDto,
  PaymentMethodKindDto,
} from './shared-types';

/** ISO 4217 codes supported in payment settings UI. */
export const PAYMENT_CURRENCY_OPTIONS = ['UAH', 'USD', 'EUR', 'GBP', 'PLN'] as const;

export type PaymentCurrencyCode = (typeof PAYMENT_CURRENCY_OPTIONS)[number];

export const DEFAULT_ALLOWED_CURRENCIES: PaymentCurrencyCode[] = ['UAH', 'USD', 'EUR'];

export const DEFAULT_MIN_PACKAGE_LESSONS = 3;

export function parseLessonCreditTrack(raw: unknown): LessonCreditTrackDto {
  return raw === 'group' ? 'group' : 'individual';
}

export function getDefaultGroupPricePerLessonMinor(config: {
  groupLessons?: { defaultPriceMinor?: number };
}): number {
  return Math.max(0, Math.round(config.groupLessons?.defaultPriceMinor ?? 0));
}

export type LessonPriceByCurrencyDto = {
  currency: PaymentCurrencyCode;
  /** Minor units for one lesson in this currency (e.g. kopiyky, cents). */
  pricePerLessonMinor: number;
};

/** Checkout currencies each online provider accepts in SoEnglish today. */
export const PAYMENT_PROVIDER_CHECKOUT_CURRENCIES: Record<
  Exclude<PaymentMethodKindDto, 'manual_invoice'>,
  readonly PaymentCurrencyCode[] | 'variant'
> = {
  stripe: PAYMENT_CURRENCY_OPTIONS,
  paypal: PAYMENT_CURRENCY_OPTIONS,
  paddle: PAYMENT_CURRENCY_OPTIONS,
  liqpay: ['UAH', 'USD', 'EUR'],
  wayforpay: ['UAH', 'USD', 'EUR'],
  monopay: ['UAH', 'USD', 'EUR'],
  lemonsqueezy: 'variant',
};

export type StudentBillingModeDto = 'per_lesson' | 'packages' | 'both';

export const STUDENT_BILLING_MODE_OPTIONS: Array<{
  value: StudentBillingModeDto;
  label: string;
  description: string;
}> = [
  {
    value: 'per_lesson',
    label: 'Per lesson',
    description: 'Charged by price per lesson only (no self-serve packages).',
  },
  {
    value: 'packages',
    label: 'Packages only',
    description: 'Student tops up via fixed lesson packages (online checkout).',
  },
  {
    value: 'both',
    label: 'Per lesson and packages',
    description: 'Per-lesson rate applies; student may also buy lesson packages.',
  },
];

export type StudentPackageOverrideDto = {
  packageId: string;
  /** Lesson count for this student (when set or locked). */
  lessons: number | null;
  /** Student cannot change package size at checkout. */
  lessonsLocked: boolean;
  /** Include this platform package for the student. */
  enabled: boolean;
};

export function isPaymentCurrencyCode(value: string): value is PaymentCurrencyCode {
  return (PAYMENT_CURRENCY_OPTIONS as readonly string[]).includes(value);
}

export function normalizeAllowedCurrencies(codes: string[]): PaymentCurrencyCode[] {
  const seen = new Set<PaymentCurrencyCode>();
  for (const code of codes) {
    const upper = code.trim().toUpperCase();
    if (isPaymentCurrencyCode(upper)) seen.add(upper);
  }
  if (seen.size === 0) return [...DEFAULT_ALLOWED_CURRENCIES];
  return [...seen];
}

export function getPaymentProviderDisplayName(method: PaymentMethodKindDto): string {
  if (method === 'manual_invoice') return 'Manual invoice';
  if (method === 'liqpay') return 'LiqPay';
  if (method === 'wayforpay') return 'WayForPay';
  if (method === 'monopay') return 'MonoPay';
  if (method === 'lemonsqueezy') return 'Lemon Squeezy';
  if (method === 'paddle') return 'Paddle';
  if (method === 'paypal') return 'PayPal';
  if (method === 'stripe') return 'Stripe';
  return method;
}

export function getLemonSqueezyActiveVariantCurrency(
  config: { mode?: string; liveVariantCurrency?: string; testVariantCurrency?: string } | undefined,
): PaymentCurrencyCode | null {
  if (!config) return null;
  const mode = config.mode === 'test' ? 'test' : 'live';
  const raw = mode === 'test' ? config.testVariantCurrency : config.liveVariantCurrency;
  const upper = raw?.trim().toUpperCase();
  return upper && isPaymentCurrencyCode(upper) ? upper : null;
}

export function providerSupportsCheckoutCurrency(
  method: PaymentMethodKindDto,
  currency: string,
  options?: { lemonSqueezyVariantCurrency?: string | null },
): boolean {
  if (method === 'manual_invoice') return true;
  const upper = currency.trim().toUpperCase();
  if (!isPaymentCurrencyCode(upper)) return false;
  const supported = PAYMENT_PROVIDER_CHECKOUT_CURRENCIES[method];
  if (supported === 'variant') {
    const variantCurrency = options?.lemonSqueezyVariantCurrency?.trim().toUpperCase();
    if (!variantCurrency || !isPaymentCurrencyCode(variantCurrency)) return false;
    return upper === variantCurrency;
  }
  return supported.includes(upper);
}

export function getPricePerLessonForCurrency(
  config: {
    defaultCurrency: string;
    defaultPricePerLessonMinor: number;
    pricePerLessonByCurrency?: LessonPriceByCurrencyDto[];
  },
  currency: string,
): number {
  const upper = currency.trim().toUpperCase();
  const fromMap = (config.pricePerLessonByCurrency ?? []).find(
    (row) => row.currency === upper,
  )?.pricePerLessonMinor;
  if (fromMap != null) return fromMap;
  if (upper === config.defaultCurrency.trim().toUpperCase()) {
    return config.defaultPricePerLessonMinor;
  }
  return 0;
}

export function normalizePricePerLessonByCurrency(input: {
  allowedCurrencies: PaymentCurrencyCode[];
  defaultCurrency: PaymentCurrencyCode;
  defaultPricePerLessonMinor: number;
  pricePerLessonByCurrency?: LessonPriceByCurrencyDto[];
}): LessonPriceByCurrencyDto[] {
  const priceMap = new Map<PaymentCurrencyCode, number>();
  for (const row of input.pricePerLessonByCurrency ?? []) {
    if (isPaymentCurrencyCode(row.currency)) {
      priceMap.set(row.currency, Math.max(0, Math.round(row.pricePerLessonMinor)));
    }
  }
  if (!priceMap.has(input.defaultCurrency)) {
    priceMap.set(
      input.defaultCurrency,
      Math.max(0, Math.round(input.defaultPricePerLessonMinor)),
    );
  }
  return input.allowedCurrencies.map((currency) => ({
    currency,
    pricePerLessonMinor: priceMap.get(currency) ?? 0,
  }));
}

export function getPaymentSettingsCurrencyIssues(input: {
  enabledMethods: PaymentMethodKindDto[];
  config: {
    defaultCurrency: string;
    allowedCurrencies: string[];
    minPackageLessons: number;
    packages: Array<{ label: string; currency?: string }>;
    pricePerLessonByCurrency?: LessonPriceByCurrencyDto[];
    defaultPricePerLessonMinor: number;
    lemonsqueezy?: {
      mode?: string;
      liveVariantCurrency?: string;
      testVariantCurrency?: string;
    };
  };
}): string[] {
  const issues: string[] = [];
  const allowedCurrencies = normalizeAllowedCurrencies(input.config.allowedCurrencies);
  const defaultCurrency = allowedCurrencies.includes(
    input.config.defaultCurrency.toUpperCase() as PaymentCurrencyCode,
  )
    ? (input.config.defaultCurrency.toUpperCase() as PaymentCurrencyCode)
    : allowedCurrencies[0];

  const prices = normalizePricePerLessonByCurrency({
    allowedCurrencies,
    defaultCurrency,
    defaultPricePerLessonMinor: input.config.defaultPricePerLessonMinor,
    pricePerLessonByCurrency: input.config.pricePerLessonByCurrency,
  });

  for (const row of prices) {
    if (row.pricePerLessonMinor <= 0) {
      issues.push(`Set a lesson price greater than 0 for ${row.currency}.`);
    }
  }

  const lemonVariantCurrency = getLemonSqueezyActiveVariantCurrency(input.config.lemonsqueezy);

  for (const pkg of input.config.packages) {
    const pkgCurrency = (pkg.currency ?? defaultCurrency).toUpperCase();
    if (!isPaymentCurrencyCode(pkgCurrency)) {
      issues.push(`Package "${pkg.label || 'Untitled'}" has an invalid currency.`);
      continue;
    }
    if (!allowedCurrencies.includes(pkgCurrency)) {
      issues.push(
        `Package "${pkg.label || 'Untitled'}" uses ${pkgCurrency}, which is not in allowed currencies.`,
      );
    }
    const pkgPrice = prices.find((row) => row.currency === pkgCurrency)?.pricePerLessonMinor ?? 0;
    if (pkgPrice <= 0) {
      issues.push(`Package "${pkg.label || 'Untitled'}" needs a lesson price for ${pkgCurrency}.`);
    }
  }

  const onlineMethods = input.enabledMethods.filter((method) => method !== 'manual_invoice');
  for (const method of onlineMethods) {
    if (method === 'lemonsqueezy' && !lemonVariantCurrency) {
      issues.push('Set Lemon Squeezy variant currency in payment method settings.');
    }
    for (const pkg of input.config.packages) {
      const pkgCurrency = (pkg.currency ?? defaultCurrency).toUpperCase() as PaymentCurrencyCode;
      if (!isPaymentCurrencyCode(pkgCurrency)) continue;
      if (
        !providerSupportsCheckoutCurrency(method, pkgCurrency, {
          lemonSqueezyVariantCurrency: lemonVariantCurrency,
        })
      ) {
        issues.push(
          `${getPaymentProviderDisplayName(method)} does not support checkout for package "${pkg.label || 'Untitled'}" in ${pkgCurrency}.`,
        );
      }
    }
  }

  return issues;
}

export function getManualInvoiceMethodSetupIssues(method: ManualInvoiceMethodDto): string[] {
  const issues: string[] = [];
  if (!method.id.trim()) issues.push('ID');
  if (!method.label.trim()) issues.push('Label');

  if (method.kind === 'iban_sepa') {
    if (!method.beneficiaryName.trim()) issues.push('Beneficiary name');
    if (!method.iban.trim()) issues.push('IBAN');
    return issues;
  }

  if (method.kind === 'swift_wire') {
    if (!method.beneficiaryName.trim()) issues.push('Beneficiary name');
    if (!method.accountNumber.trim() && !method.iban?.trim()) {
      issues.push('Account number or IBAN');
    }
    if (!method.swiftBic.trim()) issues.push('SWIFT / BIC');
    return issues;
  }

  if (method.kind === 'card_transfer') {
    if (!method.beneficiaryName.trim()) issues.push('Cardholder name');
    if (!method.bankName.trim()) issues.push('Bank name');
    if (!method.cardNumber.trim()) issues.push('Card number');
    return issues;
  }

  if (!method.instructionsUk.trim()) issues.push('Instructions (UK)');
  return issues;
}

export function isManualInvoiceMethodConfigured(method: ManualInvoiceMethodDto): boolean {
  return getManualInvoiceMethodSetupIssues(method).length === 0;
}

export function formatManualInvoiceConfiguredLabel(
  methods: ManualInvoiceMethodDto[],
): string {
  const totalCount = methods.length;
  if (totalCount === 0) return 'Add at least one manual method';

  const configuredCount = methods.filter(isManualInvoiceMethodConfigured).length;
  if (configuredCount === 0) {
    return totalCount === 1
      ? '1 manual method — fill required fields'
      : `${totalCount} manual methods — fill required fields`;
  }
  if (configuredCount === totalCount) {
    return `${configuredCount} manual method${configuredCount === 1 ? '' : 's'} configured`;
  }
  return `${configuredCount} of ${totalCount} manual methods ready`;
}
