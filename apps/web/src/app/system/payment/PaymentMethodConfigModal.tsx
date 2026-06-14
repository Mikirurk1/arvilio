'use client';

import { Settings2, X } from 'lucide-react';
import { BodyPortal, Button } from '../../../components/ui';
import {
  type PaymentConfigDto,
  type PaymentMethodKindDto,
  type PaymentSecretStatusesDto,
  type PaymentSecretsDto,
} from '@pkg/types';
import { PAYMENT_PROVIDER_META } from './payment-provider-meta';
import { ProviderHelp } from './payment-config-primitives';
import { ManualInvoiceMethodConfig } from './ManualInvoiceMethodConfig';
import { ProviderConfigSection } from './ProviderConfigSection';
import styles from '../page.module.scss';

type Props = {
  method: PaymentMethodKindDto;
  config: PaymentConfigDto;
  secretStatuses: PaymentSecretStatusesDto;
  secretDraft: PaymentSecretsDto;
  onChange: (config: PaymentConfigDto) => void;
  onSecretsChange: (secrets: PaymentSecretsDto) => void;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
  onClose: () => void;
};

export function PaymentMethodConfigModal({
  method, config, secretStatuses, secretDraft,
  onChange, onSecretsChange, onSave, saving = false, onClose,
}: Props) {
  const providerMeta = PAYMENT_PROVIDER_META[method];

  return (
    <BodyPortal>
      <div className={styles.configModalBackdrop} onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-method-config-title"
          className={styles.configModal}
          onClick={(e) => e.stopPropagation()}
        >
          <header className={styles.configModalHead}>
            <div className={styles.configModalHeading}>
              <div className={styles.configModalEyebrow}>
                <Settings2 size={14} aria-hidden />
                Payment method
              </div>
              <h3 id="payment-method-config-title" className={styles.configModalTitle}>
                {providerMeta.title} settings
              </h3>
              <p className={styles.configModalSubtitle}>{providerMeta.description}</p>
            </div>
            <Button type="button" variant="ghost" className={styles.configModalClose} aria-label="Close payment method settings" onClick={onClose}>
              <X size={18} aria-hidden />
            </Button>
          </header>

          <div className={styles.configModalBody}>
            <ProviderHelp method={method} />

            {method === 'manual_invoice' ? (
              <ManualInvoiceMethodConfig config={config} onChange={onChange} />
            ) : (
              <ProviderConfigSection
                method={method}
                config={config}
                secretStatuses={secretStatuses}
                secretDraft={secretDraft}
                onChange={onChange}
                onSecretsChange={onSecretsChange}
              />
            )}
          </div>

          <div className={styles.configModalActions}>
            {method === 'manual_invoice' ? (
              <Button type="button" loading={saving} loadingLabel="Saving…" disabled={saving} onClick={() => void onSave?.()}>
                Save
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </BodyPortal>
  );
}
