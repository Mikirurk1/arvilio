'use client';

import type { PaymentMethodKindDto } from '@pkg/types';
import { useCampusT } from '../../lib/cms';
import styles from './PaymentMethodLogos.module.scss';

const METHOD_META: Partial<
  Record<PaymentMethodKindDto, { src: string; label: string }>
> = {
  stripe: { src: '/brand/payments/stripe.svg', label: 'Stripe' },
  liqpay: { src: '/brand/payments/liqpay.svg', label: 'LiqPay' },
  wayforpay: { src: '/brand/payments/wayforpay.svg', label: 'WayForPay' },
  lemonsqueezy: { src: '/brand/payments/lemonsqueezy.svg', label: 'Lemon Squeezy' },
  paddle: { src: '/brand/payments/paddle.svg', label: 'Paddle' },
  monopay: { src: '/brand/payments/monopay.svg', label: 'MonoPay' },
  paypal: { src: '/brand/payments/paypal.svg', label: 'PayPal' },
};

export function PaymentMethodLogos({
  methods,
  caption,
}: {
  methods: PaymentMethodKindDto[];
  caption?: string;
}) {
  const t = useCampusT();
  const resolvedCaption = caption ?? t('payment.secureCheckout');
  const logos = methods
    .map((id) => (METHOD_META[id] ? { id, ...METHOD_META[id]! } : null))
    .filter((x): x is { id: PaymentMethodKindDto; src: string; label: string } => x != null);

  if (logos.length === 0) return null;

  return (
    <div className={styles.strip} role="group" aria-label={t('payment.acceptedMethodsAria')}>
      <p className={styles.caption}>{resolvedCaption}</p>
      <ul className={styles.list}>
        {logos.map((logo) => (
          <li key={logo.id} className={styles.item}>
            <img src={logo.src} alt={logo.label} className={styles.logo} height={28} />
          </li>
        ))}
      </ul>
    </div>
  );
}
