/** Operator-facing labels for Prisma `PaymentMethodKind` (uppercase API values). */

export type PlatformPaymentMethodMeta = {
  title: string;
  description: string;
  /** Brand tile background */
  brandBg: string;
  /** Brand mark / text color on tile */
  brandFg: string;
};

export const PLATFORM_PAYMENT_METHOD_META: Record<string, PlatformPaymentMethodMeta> = {
  MANUAL_INVOICE: {
    title: 'Manual invoice',
    description: 'Bank transfer; campus staff credits lessons by hand.',
    brandBg: '#eef1f5',
    brandFg: '#3d3d55',
  },
  STRIPE: {
    title: 'Stripe',
    description: 'Cards via Stripe Checkout.',
    brandBg: '#635bff',
    brandFg: '#ffffff',
  },
  PAYPAL: {
    title: 'PayPal',
    description: 'PayPal Checkout (Orders API).',
    brandBg: '#003087',
    brandFg: '#ffffff',
  },
  LIQPAY: {
    title: 'LiqPay',
    description: 'Ukrainian cards & wallets via LiqPay.',
    brandBg: '#1e88e5',
    brandFg: '#ffffff',
  },
  WAYFORPAY: {
    title: 'WayForPay',
    description: 'Hosted checkout via WayForPay.',
    brandBg: '#00a651',
    brandFg: '#ffffff',
  },
  MONOPAY: {
    title: 'MonoPay',
    description: 'Plata by mono invoice page.',
    brandBg: '#000000',
    brandFg: '#ffffff',
  },
  PADDLE: {
    title: 'Paddle',
    description: 'Merchant-of-record checkout.',
    brandBg: '#1a1a2e',
    brandFg: '#ffffff',
  },
  LEMON_SQUEEZY: {
    title: 'Lemon Squeezy',
    description: 'Hosted checkout via Lemon Squeezy.',
    brandBg: '#ffc233',
    brandFg: '#1a1a2e',
  },
};

export function getPlatformPaymentMethodMeta(method: string): PlatformPaymentMethodMeta {
  return (
    PLATFORM_PAYMENT_METHOD_META[method] ?? {
      title: method
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' '),
      description: 'Payment provider',
      brandBg: '#eef1f5',
      brandFg: '#3d3d55',
    }
  );
}
