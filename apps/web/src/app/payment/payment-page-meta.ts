import type { PaymentMethodKindDto } from '@pkg/types';

export const PAYMENT_METHOD_STUDENT_META: Record<
  PaymentMethodKindDto,
  { title: string; shortTitle: string; description: string }
> = {
  manual_invoice: {
    title: 'Bank transfer',
    shortTitle: 'Bank',
    description: 'Pay by transfer using the details below, then send your receipt to the school.',
  },
  stripe: {
    title: 'Card (Stripe)',
    shortTitle: 'Stripe',
    description: 'Pay by card in a secure Stripe checkout.',
  },
  liqpay: {
    title: 'LiqPay',
    shortTitle: 'LiqPay',
    description: 'Pay with LiqPay (cards and local methods).',
  },
  wayforpay: {
    title: 'WayForPay',
    shortTitle: 'WayForPay',
    description: 'Pay with WayForPay.',
  },
  lemonsqueezy: {
    title: 'Lemon Squeezy',
    shortTitle: 'Lemon Squeezy',
    description: 'Pay through Lemon Squeezy checkout.',
  },
  paddle: {
    title: 'Paddle',
    shortTitle: 'Paddle',
    description: 'Pay through Paddle checkout.',
  },
  monopay: {
    title: 'MonoPay',
    shortTitle: 'MonoPay',
    description: 'Pay with MonoPay.',
  },
  paypal: {
    title: 'PayPal',
    shortTitle: 'PayPal',
    description: 'Pay with your PayPal account.',
  },
};

export const CHECKOUT_METHODS: PaymentMethodKindDto[] = [
  'stripe',
  'liqpay',
  'wayforpay',
  'lemonsqueezy',
  'paddle',
  'monopay',
  'paypal',
];
