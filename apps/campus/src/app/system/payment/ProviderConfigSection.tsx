'use client';

import { Field } from '../../../components/ui';
import {
  DEFAULT_PAYMENT_ENVIRONMENT_MODE,
  PAYMENT_CURRENCY_OPTIONS,
  type PaymentConfigDto,
  type PaymentMethodKindDto,
  type PaymentSecretStatusesDto,
  type PaymentSecretsDto,
} from '@pkg/types';
import { PAYMENT_PROVIDER_META, type ProviderFieldHelpKey } from './payment-provider-meta';
import { ConfigField, ProviderModeSwitch, SecretField } from './payment-config-primitives';
import styles from '../page.module.scss';

interface Props {
  method: PaymentMethodKindDto;
  config: PaymentConfigDto;
  secretStatuses: PaymentSecretStatusesDto;
  secretDraft: PaymentSecretsDto;
  onChange: (config: PaymentConfigDto) => void;
  onSecretsChange: (secrets: PaymentSecretsDto) => void;
}

export function ProviderConfigSection({ method, config, secretStatuses, secretDraft, onChange, onSecretsChange }: Props) {
  const meta = PAYMENT_PROVIDER_META[method];

  const updateConfig = <K extends keyof PaymentConfigDto>(key: K, patch: Partial<NonNullable<PaymentConfigDto[K]>>) => {
    onChange({ ...config, [key]: { ...(config[key] as object ?? {}), ...patch } });
  };

  const updateSecrets = <K extends keyof PaymentSecretsDto>(key: K, patch: Partial<NonNullable<PaymentSecretsDto[K]>>) => {
    onSecretsChange({ ...secretDraft, [key]: { ...(secretDraft[key] as object ?? {}), ...patch } });
  };

  if (method === 'stripe') {
    return (
      <>
        <ProviderModeSwitch value={config.stripe?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE} onChange={(v) => updateConfig('stripe', { mode: v })} tooltip={meta.fieldHelp.mode} />
        <div className={styles.providerSectionTitle}>School merchant details</div>
        <div className={styles.providerFieldGrid}>
          <ConfigField label="Live publishable key" tooltip={meta.fieldHelp['stripe.livePublishableKey']}>
            <Field className={styles.input} value={config.stripe?.livePublishableKey ?? ''} onChange={(e) => updateConfig('stripe', { livePublishableKey: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Test publishable key" tooltip={meta.fieldHelp['stripe.testPublishableKey']}>
            <Field className={styles.input} value={config.stripe?.testPublishableKey ?? ''} onChange={(e) => updateConfig('stripe', { testPublishableKey: e.target.value || undefined })} />
          </ConfigField>
        </div>
        <div className={styles.providerSectionTitle}>School secure secrets</div>
        <div className={styles.providerFieldGrid}>
          <SecretField label="Live secret key" tooltip={meta.fieldHelp['stripe.liveSecretKey' as ProviderFieldHelpKey]} value={secretDraft.stripe?.liveSecretKey} status={secretStatuses.stripe.liveSecretKey} onChange={(v) => updateSecrets('stripe', { liveSecretKey: v || undefined })} />
          <SecretField label="Live webhook secret" tooltip={meta.fieldHelp['stripe.liveWebhookSecret' as ProviderFieldHelpKey]} value={secretDraft.stripe?.liveWebhookSecret} status={secretStatuses.stripe.liveWebhookSecret} onChange={(v) => updateSecrets('stripe', { liveWebhookSecret: v || undefined })} />
          <SecretField label="Test secret key" tooltip={meta.fieldHelp['stripe.testSecretKey' as ProviderFieldHelpKey]} value={secretDraft.stripe?.testSecretKey} status={secretStatuses.stripe.testSecretKey} onChange={(v) => updateSecrets('stripe', { testSecretKey: v || undefined })} />
          <SecretField label="Test webhook secret" tooltip={meta.fieldHelp['stripe.testWebhookSecret' as ProviderFieldHelpKey]} value={secretDraft.stripe?.testWebhookSecret} status={secretStatuses.stripe.testWebhookSecret} onChange={(v) => updateSecrets('stripe', { testWebhookSecret: v || undefined })} />
        </div>
      </>
    );
  }

  if (method === 'liqpay') {
    return (
      <>
        <ProviderModeSwitch value={config.liqpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE} onChange={(v) => updateConfig('liqpay', { mode: v })} tooltip={meta.fieldHelp.mode} />
        <div className={styles.providerSectionTitle}>School merchant details</div>
        <div className={styles.providerFieldGrid}>
          <ConfigField label="Live public key" tooltip={meta.fieldHelp['liqpay.livePublicKey']}>
            <Field className={styles.input} value={config.liqpay?.livePublicKey ?? ''} onChange={(e) => updateConfig('liqpay', { livePublicKey: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Test public key" tooltip={meta.fieldHelp['liqpay.testPublicKey']}>
            <Field className={styles.input} value={config.liqpay?.testPublicKey ?? ''} onChange={(e) => updateConfig('liqpay', { testPublicKey: e.target.value || undefined })} />
          </ConfigField>
        </div>
        <div className={styles.providerSectionTitle}>School secure secrets</div>
        <div className={styles.providerFieldGrid}>
          <SecretField label="Live private key" tooltip={meta.fieldHelp['liqpay.livePrivateKey' as ProviderFieldHelpKey]} value={secretDraft.liqpay?.livePrivateKey} status={secretStatuses.liqpay.livePrivateKey} onChange={(v) => updateSecrets('liqpay', { livePrivateKey: v || undefined })} />
          <SecretField label="Test private key" tooltip={meta.fieldHelp['liqpay.testPrivateKey' as ProviderFieldHelpKey]} value={secretDraft.liqpay?.testPrivateKey} status={secretStatuses.liqpay.testPrivateKey} onChange={(v) => updateSecrets('liqpay', { testPrivateKey: v || undefined })} />
        </div>
      </>
    );
  }

  if (method === 'wayforpay') {
    return (
      <>
        <ProviderModeSwitch value={config.wayforpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE} onChange={(v) => updateConfig('wayforpay', { mode: v })} tooltip={meta.fieldHelp.mode} />
        <div className={styles.providerSectionTitle}>School merchant details</div>
        <div className={styles.providerFieldGrid}>
          <ConfigField label="Live merchant account" tooltip={meta.fieldHelp['wayforpay.liveMerchantAccount']}>
            <Field className={styles.input} value={config.wayforpay?.liveMerchantAccount ?? ''} onChange={(e) => updateConfig('wayforpay', { liveMerchantAccount: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Live merchant domain" tooltip={meta.fieldHelp['wayforpay.liveMerchantDomainName']}>
            <Field className={styles.input} placeholder="soenglish.com" value={config.wayforpay?.liveMerchantDomainName ?? ''} onChange={(e) => updateConfig('wayforpay', { liveMerchantDomainName: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Test merchant account" tooltip={meta.fieldHelp['wayforpay.testMerchantAccount']}>
            <Field className={styles.input} value={config.wayforpay?.testMerchantAccount ?? ''} onChange={(e) => updateConfig('wayforpay', { testMerchantAccount: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Test merchant domain" tooltip={meta.fieldHelp['wayforpay.testMerchantDomainName']}>
            <Field className={styles.input} placeholder="soenglish.local" value={config.wayforpay?.testMerchantDomainName ?? ''} onChange={(e) => updateConfig('wayforpay', { testMerchantDomainName: e.target.value || undefined })} />
          </ConfigField>
        </div>
        <div className={styles.providerSectionTitle}>School secure secrets</div>
        <div className={styles.providerFieldGrid}>
          <SecretField label="Live merchant secret" tooltip={meta.fieldHelp['wayforpay.liveSecretKey' as ProviderFieldHelpKey]} value={secretDraft.wayforpay?.liveSecretKey} status={secretStatuses.wayforpay.liveSecretKey} onChange={(v) => updateSecrets('wayforpay', { liveSecretKey: v || undefined })} />
          <SecretField label="Test merchant secret" tooltip={meta.fieldHelp['wayforpay.testSecretKey' as ProviderFieldHelpKey]} value={secretDraft.wayforpay?.testSecretKey} status={secretStatuses.wayforpay.testSecretKey} onChange={(v) => updateSecrets('wayforpay', { testSecretKey: v || undefined })} />
        </div>
      </>
    );
  }

  if (method === 'lemonsqueezy') {
    const CurrencySelect = ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
      <Field as="select" className={styles.input} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select currency</option>
        {PAYMENT_CURRENCY_OPTIONS.map((code) => <option key={code} value={code}>{code}</option>)}
      </Field>
    );
    return (
      <>
        <ProviderModeSwitch value={config.lemonsqueezy?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE} onChange={(v) => updateConfig('lemonsqueezy', { mode: v })} tooltip={meta.fieldHelp.mode} />
        <div className={styles.providerSectionTitle}>School merchant details</div>
        <div className={styles.providerFieldGrid}>
          <ConfigField label="Live store ID" tooltip={meta.fieldHelp['lemonsqueezy.liveStoreId']}>
            <Field className={styles.input} value={config.lemonsqueezy?.liveStoreId ?? ''} onChange={(e) => updateConfig('lemonsqueezy', { liveStoreId: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Live variant ID" tooltip={meta.fieldHelp['lemonsqueezy.liveVariantId']}>
            <Field className={styles.input} value={config.lemonsqueezy?.liveVariantId ?? ''} onChange={(e) => updateConfig('lemonsqueezy', { liveVariantId: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Live variant currency" tooltip={meta.fieldHelp['lemonsqueezy.liveVariantCurrency']}>
            <CurrencySelect value={config.lemonsqueezy?.liveVariantCurrency} onChange={(v) => updateConfig('lemonsqueezy', { liveVariantCurrency: v || undefined })} />
          </ConfigField>
          <ConfigField label="Test store ID" tooltip={meta.fieldHelp['lemonsqueezy.testStoreId']}>
            <Field className={styles.input} value={config.lemonsqueezy?.testStoreId ?? ''} onChange={(e) => updateConfig('lemonsqueezy', { testStoreId: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Test variant ID" tooltip={meta.fieldHelp['lemonsqueezy.testVariantId']}>
            <Field className={styles.input} value={config.lemonsqueezy?.testVariantId ?? ''} onChange={(e) => updateConfig('lemonsqueezy', { testVariantId: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Test variant currency" tooltip={meta.fieldHelp['lemonsqueezy.testVariantCurrency']}>
            <CurrencySelect value={config.lemonsqueezy?.testVariantCurrency} onChange={(v) => updateConfig('lemonsqueezy', { testVariantCurrency: v || undefined })} />
          </ConfigField>
        </div>
        <div className={styles.providerSectionTitle}>School secure secrets</div>
        <div className={styles.providerFieldGrid}>
          <SecretField label="Live API key" tooltip={meta.fieldHelp['lemonsqueezy.liveApiKey' as ProviderFieldHelpKey]} value={secretDraft.lemonsqueezy?.liveApiKey} status={secretStatuses.lemonsqueezy.liveApiKey} onChange={(v) => updateSecrets('lemonsqueezy', { liveApiKey: v || undefined })} />
          <SecretField label="Live webhook secret" tooltip={meta.fieldHelp['lemonsqueezy.liveWebhookSecret' as ProviderFieldHelpKey]} value={secretDraft.lemonsqueezy?.liveWebhookSecret} status={secretStatuses.lemonsqueezy.liveWebhookSecret} onChange={(v) => updateSecrets('lemonsqueezy', { liveWebhookSecret: v || undefined })} />
          <SecretField label="Test API key" tooltip={meta.fieldHelp['lemonsqueezy.testApiKey' as ProviderFieldHelpKey]} value={secretDraft.lemonsqueezy?.testApiKey} status={secretStatuses.lemonsqueezy.testApiKey} onChange={(v) => updateSecrets('lemonsqueezy', { testApiKey: v || undefined })} />
          <SecretField label="Test webhook secret" tooltip={meta.fieldHelp['lemonsqueezy.testWebhookSecret' as ProviderFieldHelpKey]} value={secretDraft.lemonsqueezy?.testWebhookSecret} status={secretStatuses.lemonsqueezy.testWebhookSecret} onChange={(v) => updateSecrets('lemonsqueezy', { testWebhookSecret: v || undefined })} />
        </div>
      </>
    );
  }

  if (method === 'paddle') {
    return (
      <>
        <ProviderModeSwitch value={config.paddle?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE} onChange={(v) => updateConfig('paddle', { mode: v })} tooltip={meta.fieldHelp.mode} />
        <div className={styles.providerSectionTitle}>School secure secrets</div>
        <div className={styles.providerFieldGrid}>
          <SecretField label="Live API key" tooltip={meta.fieldHelp['paddle.liveApiKey' as ProviderFieldHelpKey]} value={secretDraft.paddle?.liveApiKey} status={secretStatuses.paddle.liveApiKey} onChange={(v) => updateSecrets('paddle', { liveApiKey: v || undefined })} />
          <SecretField label="Live webhook secret" tooltip={meta.fieldHelp['paddle.liveWebhookSecret' as ProviderFieldHelpKey]} value={secretDraft.paddle?.liveWebhookSecret} status={secretStatuses.paddle.liveWebhookSecret} onChange={(v) => updateSecrets('paddle', { liveWebhookSecret: v || undefined })} />
          <SecretField label="Test API key" tooltip={meta.fieldHelp['paddle.testApiKey' as ProviderFieldHelpKey]} value={secretDraft.paddle?.testApiKey} status={secretStatuses.paddle.testApiKey} onChange={(v) => updateSecrets('paddle', { testApiKey: v || undefined })} />
          <SecretField label="Test webhook secret" tooltip={meta.fieldHelp['paddle.testWebhookSecret' as ProviderFieldHelpKey]} value={secretDraft.paddle?.testWebhookSecret} status={secretStatuses.paddle.testWebhookSecret} onChange={(v) => updateSecrets('paddle', { testWebhookSecret: v || undefined })} />
        </div>
      </>
    );
  }

  if (method === 'monopay') {
    return (
      <>
        <ProviderModeSwitch value={config.monopay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE} onChange={(v) => updateConfig('monopay', { mode: v })} tooltip={meta.fieldHelp.mode} />
        <div className={styles.providerSectionTitle}>School secure secrets</div>
        <div className={styles.providerFieldGrid}>
          <SecretField label="Live merchant token" tooltip={meta.fieldHelp['monopay.liveToken' as ProviderFieldHelpKey]} value={secretDraft.monopay?.liveToken} status={secretStatuses.monopay.liveToken} onChange={(v) => updateSecrets('monopay', { liveToken: v || undefined })} />
          <SecretField label="Test merchant token" tooltip={meta.fieldHelp['monopay.testToken' as ProviderFieldHelpKey]} value={secretDraft.monopay?.testToken} status={secretStatuses.monopay.testToken} onChange={(v) => updateSecrets('monopay', { testToken: v || undefined })} />
        </div>
      </>
    );
  }

  if (method === 'paypal') {
    return (
      <>
        <ProviderModeSwitch value={config.paypal?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE} onChange={(v) => updateConfig('paypal', { mode: v })} tooltip={meta.fieldHelp.mode} />
        <div className={styles.providerSectionTitle}>School merchant details</div>
        <div className={styles.providerFieldGrid}>
          <ConfigField label="Live client ID" tooltip={meta.fieldHelp['paypal.liveClientId']}>
            <Field className={styles.input} value={config.paypal?.liveClientId ?? ''} onChange={(e) => updateConfig('paypal', { liveClientId: e.target.value || undefined })} />
          </ConfigField>
          <ConfigField label="Test client ID" tooltip={meta.fieldHelp['paypal.testClientId']}>
            <Field className={styles.input} value={config.paypal?.testClientId ?? ''} onChange={(e) => updateConfig('paypal', { testClientId: e.target.value || undefined })} />
          </ConfigField>
        </div>
        <div className={styles.providerSectionTitle}>School secure secrets</div>
        <div className={styles.providerFieldGrid}>
          <SecretField label="Live client secret" tooltip={meta.fieldHelp['paypal.liveClientSecret' as ProviderFieldHelpKey]} value={secretDraft.paypal?.liveClientSecret} status={secretStatuses.paypal.liveClientSecret} onChange={(v) => updateSecrets('paypal', { liveClientSecret: v || undefined })} />
          <SecretField label="Live webhook ID" tooltip={meta.fieldHelp['paypal.liveWebhookId' as ProviderFieldHelpKey]} value={secretDraft.paypal?.liveWebhookId} status={secretStatuses.paypal.liveWebhookId} onChange={(v) => updateSecrets('paypal', { liveWebhookId: v || undefined })} />
          <SecretField label="Test client secret" tooltip={meta.fieldHelp['paypal.testClientSecret' as ProviderFieldHelpKey]} value={secretDraft.paypal?.testClientSecret} status={secretStatuses.paypal.testClientSecret} onChange={(v) => updateSecrets('paypal', { testClientSecret: v || undefined })} />
          <SecretField label="Test webhook ID" tooltip={meta.fieldHelp['paypal.testWebhookId' as ProviderFieldHelpKey]} value={secretDraft.paypal?.testWebhookId} status={secretStatuses.paypal.testWebhookId} onChange={(v) => updateSecrets('paypal', { testWebhookId: v || undefined })} />
        </div>
      </>
    );
  }

  return null;
}
