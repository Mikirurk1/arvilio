import {
  normalizePricePerLessonByCurrency,
  type LessonPackageDto,
  type PaymentConfigDto,
  type PaymentCurrencyCode,
  type PaymentMethodKindDto,
  type PaymentSettingsDto,
} from '@pkg/types';
import type { TranslateFn } from '../../../lib/cms/nav-i18n';

export function newPackageId(): string {
  return `pkg-${Date.now().toString(36)}`;
}

export function formatMoney(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export function groupBillingModeLabel(
  mode: 'per_member' | 'fixed_total',
  t?: TranslateFn,
): string {
  if (t) {
    return mode === 'per_member'
      ? t('students.groups.billing.perMember')
      : t('students.groups.billing.fixedTotal');
  }
  return mode === 'per_member' ? 'Per member (lesson credits)' : 'Fixed total per lesson';
}

export function groupSplitModeLabel(
  mode: 'equal_split' | 'single_payer',
  t?: TranslateFn,
): string {
  if (t) {
    return mode === 'equal_split'
      ? t('students.groups.editor.splitEqual')
      : t('students.groups.editor.splitSinglePayer');
  }
  return mode === 'equal_split' ? 'Split equally' : 'Single payer';
}

export function syncDraftPricing(
  draft: PaymentSettingsDto,
  patch: Partial<PaymentConfigDto>,
): PaymentSettingsDto {
  const merged = { ...draft.config, ...patch };
  const allowedCurrencies = merged.allowedCurrencies as PaymentCurrencyCode[];
  const defaultCurrency = allowedCurrencies.includes(merged.defaultCurrency as PaymentCurrencyCode)
    ? (merged.defaultCurrency as PaymentCurrencyCode)
    : allowedCurrencies[0];
  const pricePerLessonByCurrency = normalizePricePerLessonByCurrency({
    allowedCurrencies,
    defaultCurrency,
    defaultPricePerLessonMinor: merged.defaultPricePerLessonMinor,
    pricePerLessonByCurrency: merged.pricePerLessonByCurrency ?? [],
  });
  const defaultPricePerLessonMinor =
    pricePerLessonByCurrency.find((row) => row.currency === defaultCurrency)?.pricePerLessonMinor ?? 0;
  const packages = (merged.packages ?? []).map((pkg: LessonPackageDto) => {
    const raw = pkg.currency?.trim().toUpperCase();
    const pkgCurrency =
      raw && allowedCurrencies.includes(raw as PaymentCurrencyCode) ? raw : defaultCurrency;
    return { ...pkg, currency: pkgCurrency };
  });
  return {
    ...draft,
    config: { ...merged, allowedCurrencies, defaultCurrency, pricePerLessonByCurrency, defaultPricePerLessonMinor, packages },
  };
}

export function getProviderCurrencyHint(method: PaymentMethodKindDto, t?: TranslateFn): string {
  if (method === 'manual_invoice') {
    return t?.('system.payments.hint.anyCurrency') ?? 'Any currency';
  }
  if (method === 'lemonsqueezy') {
    return t?.('system.payments.hint.lemonVariantCurrency') ?? 'Variant currency in Lemon Squeezy';
  }
  return t?.('system.payments.hint.standardCurrencies') ?? 'UAH, USD, EUR';
}

export function getFeaturedPackageId(packages: Array<{ id: string; lessons: number }>): string | null {
  if (packages.length === 0) return null;
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  return sorted[Math.floor(sorted.length / 2)]?.id ?? null;
}

export function getPackageTone(
  packages: Array<{ id: string; lessons: number }>,
  packageId: string,
): 'starter' | 'popular' | 'premium' {
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  if (sorted.length <= 1) return 'popular';
  if (sorted[0]?.id === packageId) return 'starter';
  if (sorted[sorted.length - 1]?.id === packageId) return 'premium';
  return 'popular';
}

export function getMethodModeFromConfig(
  method: PaymentMethodKindDto,
  config: PaymentConfigDto,
): 'live' | 'test' | null {
  if (method === 'stripe') return config.stripe?.mode ?? 'live';
  if (method === 'liqpay') return config.liqpay?.mode ?? 'live';
  if (method === 'wayforpay') return config.wayforpay?.mode ?? 'live';
  if (method === 'lemonsqueezy') return config.lemonsqueezy?.mode ?? 'live';
  if (method === 'paddle') return config.paddle?.mode ?? 'live';
  if (method === 'monopay') return config.monopay?.mode ?? 'live';
  if (method === 'paypal') return config.paypal?.mode ?? 'live';
  return null;
}
