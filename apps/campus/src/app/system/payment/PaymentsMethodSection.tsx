'use client';

import {
  getPaymentProviderDisplayName,
  PAYMENT_PROVIDER_CHECKOUT_CURRENCIES,
  type PaymentCurrencyCode,
  type PaymentMethodKindDto,
} from '@pkg/types';
import { useCampusT } from '../../../lib/cms';
import { PaymentMethodCard } from './PaymentMethodCard';
import { getProviderCurrencyHint } from './payment-panel-utils';
import styles from '../page.module.scss';

type MethodStatus = {
  id: PaymentMethodKindDto;
  enabled: boolean;
  configured: boolean;
  configuredLabel: string;
  mode: 'live' | 'test' | null;
};

interface Props {
  methodStatuses: MethodStatus[];
  allowedCurrencies: PaymentCurrencyCode[];
  lemonVariantCurrency: string | null;
  providerSupportsCurrency: (method: PaymentMethodKindDto, code: PaymentCurrencyCode) => boolean;
  onToggle: (method: PaymentMethodKindDto) => void;
  onOpenConfig: (method: PaymentMethodKindDto) => void;
}

export function PaymentsMethodSection({
  methodStatuses,
  allowedCurrencies,
  lemonVariantCurrency,
  providerSupportsCurrency,
  onToggle,
  onOpenConfig,
}: Props) {
  const t = useCampusT();

  return (
    <section className={styles.methodSection}>
      <div className={styles.pricingSectionHead}>
        <div>
          <h3 className={styles.sectionTitle}>{t('system.payments.methods.title')}</h3>
          <p className={styles.hint}>{t('system.payments.methods.subtitle')}</p>
        </div>
      </div>
      <div className={styles.methodGrid}>
        {methodStatuses.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onToggleEnabled={() => onToggle(method.id)}
            onOpenConfig={() => onOpenConfig(method.id)}
          />
        ))}
      </div>
      <div className={styles.providerCurrencyMatrix}>
        <div className={styles.providerCurrencyMatrixTitle}>{t('system.payments.methods.currencyMatrixTitle')}</div>
        <div className={styles.providerCurrencyMatrixRows}>
          {(
            ['stripe', 'paypal', 'paddle', 'liqpay', 'wayforpay', 'monopay', 'lemonsqueezy'] as Exclude<PaymentMethodKindDto, 'manual_invoice'>[]
          ).map((methodId) => {
            const supported = PAYMENT_PROVIDER_CHECKOUT_CURRENCIES[methodId];
            const label =
              supported === 'variant'
                ? lemonVariantCurrency
                  ? t('system.payments.methods.variantCurrency', { currency: lemonVariantCurrency })
                  : t('system.payments.methods.setVariantCurrency')
                : supported.join(', ');
            return (
              <div key={methodId} className={styles.providerCurrencyMatrixRow}>
                <strong>{getPaymentProviderDisplayName(methodId)}</strong>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
      {methodStatuses.some((m) => m.enabled) ? (
        <div className={styles.providerCurrencyHints}>
          {methodStatuses
            .filter((m) => m.enabled)
            .map((method) => (
              <div key={method.id} className={styles.providerCurrencyHint}>
                <strong>{method.id.replace('_', ' ')}</strong>
                <span>{getProviderCurrencyHint(method.id, t)}</span>
                {allowedCurrencies.some((code) => !providerSupportsCurrency(method.id, code)) ? (
                  <span className={styles.providerCurrencyHintWarn}>
                    {t('system.payments.methods.currencyIncompatible')}
                  </span>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}
    </section>
  );
}
