'use client';

import { Building2, CreditCard, Settings, Wallet } from 'lucide-react';
import { Badge, Button } from '../../../components/ui';
import type { PaymentMethodKindDto, PaymentMethodStatusDto } from '@pkg/types';
import { useCampusT } from '../../../lib/cms';
import { PAYMENT_PROVIDER_META, resolvePaymentProviderUiMeta } from './payment-provider-meta';
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
  const t = useCampusT();
  const iconMeta = META[method.id];
  const providerUi = resolvePaymentProviderUiMeta(method.id, t);
  const providerTitle = method.id === 'manual_invoice' ? providerUi.title : PAYMENT_PROVIDER_META[method.id].title;
  const providerDescription = method.id === 'manual_invoice' ? providerUi.description : PAYMENT_PROVIDER_META[method.id].description;
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
          aria-label={t('system.payments.method.configureAria', { provider: providerTitle })}
          onClick={onOpenConfig}
        >
          <Settings size={18} aria-hidden />
        </Button>
      </div>

      <h4 className={styles.methodCardTitle}>{providerTitle}</h4>
      <p className={styles.methodCardDesc}>{providerDescription}</p>

      <div className={styles.methodCardBadges}>
        <Badge variant={method.enabled ? 'green' : 'neutral'} size="sm">
          {method.enabled ? t('system.payments.method.enabled') : t('system.payments.method.disabled')}
        </Badge>
        <Badge variant={method.configured ? 'green' : 'amber'} size="sm">
          {method.configured ? t('system.payments.method.configured') : t('system.payments.method.notConfigured')}
        </Badge>
        {method.mode ? (
          <Badge variant={method.mode === 'test' ? 'blue' : 'neutral'} size="sm">
            {method.mode === 'test' ? t('system.payments.method.testMode') : t('system.payments.method.liveMode')}
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
        {method.enabled ? t('system.payments.method.disable') : t('system.payments.method.enable')}
      </Button>
    </article>
  );
}
