'use client';

import { Building2, CreditCard, Settings, Wallet } from 'lucide-react';
import { Badge, Button } from '../../../components/ui';
import type { PaymentMethodKindDto, PaymentMethodStatusDto } from '@pkg/types';
import { PAYMENT_PROVIDER_META } from './payment-provider-meta';
import styles from '../page.module.scss';

const META: Record<
  PaymentMethodKindDto,
  { icon: typeof CreditCard }
> = {
  manual_invoice: {
    icon: Building2,
  },
  stripe: {
    icon: CreditCard,
  },
  liqpay: {
    icon: Wallet,
  },
  wayforpay: {
    icon: CreditCard,
  },
  lemonsqueezy: {
    icon: Wallet,
  },
  paddle: {
    icon: CreditCard,
  },
  monopay: {
    icon: Wallet,
  },
  paypal: {
    icon: CreditCard,
  },
};

type Props = {
  method: PaymentMethodStatusDto;
  onToggleEnabled: () => void;
  onOpenConfig: () => void;
};

export function PaymentMethodCard({ method, onToggleEnabled, onOpenConfig }: Props) {
  const iconMeta = META[method.id];
  const providerMeta = PAYMENT_PROVIDER_META[method.id];
  const Icon = iconMeta.icon;

  return (
    <article
      className={`${styles.methodCard} ${method.enabled ? styles.methodCardEnabled : ''} ${method.configured ? styles.methodCardConfigured : styles.methodCardUnconfigured}`}
    >
      <div className={styles.methodCardTop}>
        <div className={styles.methodCardIcon}>
          <Icon size={20} aria-hidden />
        </div>
        <Button
          type="button"
          variant="ghost"
          className={styles.methodCardGear}
          aria-label={`Configure ${providerMeta.title}`}
          onClick={onOpenConfig}
        >
          <Settings size={18} aria-hidden />
        </Button>
      </div>

      <h4 className={styles.methodCardTitle}>{providerMeta.title}</h4>
      <p className={styles.methodCardDesc}>{providerMeta.description}</p>

      <div className={styles.methodCardBadges}>
        <Badge variant={method.enabled ? 'green' : 'neutral'} size="sm">
          {method.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
        <Badge variant={method.configured ? 'green' : 'amber'} size="sm">
          {method.configured ? 'Configured' : 'Not configured'}
        </Badge>
        {method.mode ? (
          <Badge variant={method.mode === 'test' ? 'blue' : 'neutral'} size="sm">
            {method.mode === 'test' ? 'Test mode' : 'Live mode'}
          </Badge>
        ) : null}
      </div>
      {!method.configured || method.id === 'manual_invoice' ? (
        <p className={styles.methodCardStatusHint}>{method.configuredLabel}</p>
      ) : null}

      <Button
        type="button"
        variant={method.enabled ? 'danger' : 'default'}
        className={styles.methodCardToggle}
        onClick={onToggleEnabled}
      >
        {method.enabled ? 'Disable' : 'Enable'}
      </Button>
    </article>
  );
}
