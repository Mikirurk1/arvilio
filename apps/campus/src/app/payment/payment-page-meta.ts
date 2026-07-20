import type { PaymentMethodKindDto } from '@pkg/types';
import type { TranslateFn } from '../../lib/cms/nav-i18n';

export function buildPaymentMethodStudentMeta(t: TranslateFn): Record<
  PaymentMethodKindDto,
  { title: string; shortTitle: string; description: string }
> {
  return {
    manual_invoice: {
      title: t('payment.method.bank.title'),
      shortTitle: t('payment.method.bank.short'),
      description: t('payment.method.bank.desc'),
    },
    stripe: {
      title: t('payment.method.stripe.title'),
      shortTitle: 'Stripe',
      description: t('payment.method.stripe.desc'),
    },
    liqpay: {
      title: 'LiqPay',
      shortTitle: 'LiqPay',
      description: t('payment.method.liqpay.desc'),
    },
    wayforpay: {
      title: 'WayForPay',
      shortTitle: 'WayForPay',
      description: t('payment.method.wayforpay.desc'),
    },
    lemonsqueezy: {
      title: 'Lemon Squeezy',
      shortTitle: 'Lemon Squeezy',
      description: t('payment.method.lemonsqueezy.desc'),
    },
    paddle: {
      title: 'Paddle',
      shortTitle: 'Paddle',
      description: t('payment.method.paddle.desc'),
    },
    monopay: {
      title: 'MonoPay',
      shortTitle: 'MonoPay',
      description: t('payment.method.monopay.desc'),
    },
    paypal: {
      title: 'PayPal',
      shortTitle: 'PayPal',
      description: t('payment.method.paypal.desc'),
    },
  };
}

export const CHECKOUT_METHODS: PaymentMethodKindDto[] = [
  'stripe',
  'liqpay',
  'wayforpay',
  'lemonsqueezy',
  'paddle',
  'monopay',
  'paypal',
];
