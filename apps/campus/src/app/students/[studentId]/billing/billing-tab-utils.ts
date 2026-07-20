import type { ManualInvoiceMethodDto, ManualInvoiceMethodKindDto, PaymentMethodKindDto } from '@pkg/types';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodKindDto, string> = {
  manual_invoice: 'Manual invoice',
  stripe: 'Stripe',
  liqpay: 'LiqPay',
  wayforpay: 'WayForPay',
  lemonsqueezy: 'Lemon Squeezy',
  paddle: 'Paddle',
  monopay: 'MonoPay',
  paypal: 'PayPal',
};

export const MANUAL_METHOD_KIND_LABELS: Record<ManualInvoiceMethodKindDto, string> = {
  iban_sepa: 'IBAN / SEPA',
  swift_wire: 'SWIFT wire',
  card_transfer: 'Card transfer',
  custom: 'Manual invoice',
};

export function getManualMethodSummary(method: ManualInvoiceMethodDto): string {
  if (method.kind === 'iban_sepa') {
    return [method.bankName, method.bankCountry, method.iban].filter(Boolean).join(' · ') || 'IBAN / SEPA';
  }
  if (method.kind === 'swift_wire') {
    return [method.bankName, method.swiftBic, method.iban ?? method.accountNumber].filter(Boolean).join(' · ') || 'SWIFT wire';
  }
  if (method.kind === 'card_transfer') {
    return [method.bankName, method.cardNumber].filter(Boolean).join(' · ') || 'Card transfer';
  }
  return method.label.trim() || 'Manual invoice';
}

export function isManualMethodReadyForStudent(method: ManualInvoiceMethodDto): boolean {
  if (!method.id.trim() || !method.label.trim()) return false;
  if (method.kind === 'iban_sepa') {
    return Boolean(method.beneficiaryName.trim() && method.iban.trim());
  }
  if (method.kind === 'swift_wire') {
    return Boolean(
      method.beneficiaryName.trim() &&
        (method.accountNumber.trim() || method.iban?.trim()) &&
        method.swiftBic.trim(),
    );
  }
  if (method.kind === 'card_transfer') {
    return Boolean(method.beneficiaryName.trim() && method.bankName.trim() && method.cardNumber.trim());
  }
  return Boolean(method.instructionsUk.trim());
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

export function formatMinor(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}
