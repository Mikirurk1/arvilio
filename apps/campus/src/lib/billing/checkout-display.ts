import {
  getPaymentProviderDisplayName,
  providerSupportsCheckoutCurrency,
  type PaymentMethodKindDto,
  type ResolvedLessonPackageDto,
} from '@pkg/types';
import type { TranslateFn } from '../cms/nav-i18n';

export function formatCheckoutAmount(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export function filterCheckoutMethodsForPackage(
  methods: PaymentMethodKindDto[],
  packageCurrency: string,
  lemonSqueezyVariantCurrency?: string | null,
): PaymentMethodKindDto[] {
  return methods.filter((method) =>
    providerSupportsCheckoutCurrency(method, packageCurrency, {
      lemonSqueezyVariantCurrency,
    }),
  );
}

export function getUnavailableCheckoutMethods(
  methods: PaymentMethodKindDto[],
  packageCurrency: string,
  lemonSqueezyVariantCurrency?: string | null,
): PaymentMethodKindDto[] {
  const compatible = new Set(
    filterCheckoutMethodsForPackage(methods, packageCurrency, lemonSqueezyVariantCurrency),
  );
  return methods.filter((method) => !compatible.has(method));
}

export function getUnavailableCheckoutReason(
  method: PaymentMethodKindDto,
  packageCurrency: string,
  t?: TranslateFn,
): string {
  const provider = getPaymentProviderDisplayName(method);
  if (t) {
    return t('payment.unavailable.currency', { provider, currency: packageCurrency });
  }
  return `${provider} is not available for ${packageCurrency} packages.`;
}

export function buildOrderSummary(pkg: ResolvedLessonPackageDto, t?: TranslateFn) {
  return {
    label: pkg.label,
    lessons: pkg.lessons,
    amountLabel: formatCheckoutAmount(pkg.amountMinor, pkg.currency),
    currency: pkg.currency,
    balanceAfterLabel: t
      ? t('payment.balanceAfter', { count: pkg.lessons })
      : `+${pkg.lessons} lesson${pkg.lessons === 1 ? '' : 's'} on your balance`,
  };
}

export function groupPackagesByCurrency<T extends { currency: string }>(
  packages: T[],
): Array<{ currency: string; packages: T[] }> {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  for (const pkg of packages) {
    if (!map.has(pkg.currency)) {
      map.set(pkg.currency, []);
      order.push(pkg.currency);
    }
    map.get(pkg.currency)!.push(pkg);
  }
  return order.map((currency) => ({ currency, packages: map.get(currency)! }));
}
