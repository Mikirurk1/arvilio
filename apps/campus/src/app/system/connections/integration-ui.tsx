'use client';

import type { IntegrationSecretFieldStatusDto } from '@pkg/types';
import { Field } from '../../../components/ui';
import { useCampusT } from '../../../lib/cms';
import styles from './ConnectionsPanel.module.scss';

export function secretStatusHint(
  status: IntegrationSecretFieldStatusDto | undefined,
  t: (key: string) => string,
): string {
  if (!status?.configured) return t('system.connections.secret.notSet');
  if (status.source === 'stored') return t('system.connections.secret.savedInPlatform');
  if (status.source === 'env') return t('system.connections.secret.fromEnv');
  return '—';
}

export function secretFieldPlaceholder(
  _status: IntegrationSecretFieldStatusDto | undefined,
  t: (key: string) => string,
): string {
  return t('system.connections.secret.placeholder');
}

export function SecretStatusLine({
  status,
}: {
  status: IntegrationSecretFieldStatusDto | undefined;
}) {
  const t = useCampusT();
  const configured = Boolean(status?.configured);
  return (
    <div
      className={`${styles.secretStatus} ${
        configured ? styles.secretStatusConfigured : styles.secretStatusMissing
      }`}
      role="status"
    >
      {secretStatusHint(status, t)}
    </div>
  );
}

type SecretFieldProps = {
  id: string;
  label: string;
  status: IntegrationSecretFieldStatusDto | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function IntegrationSecretField({
  id,
  label,
  status,
  value,
  onChange,
  placeholder,
}: SecretFieldProps) {
  const t = useCampusT();
  return (
    <div className={styles.fieldGroup}>
      <Field
        id={id}
        label={label}
        type="password"
        className={styles.input}
        autoComplete="off"
        value={value}
        placeholder={placeholder ?? secretFieldPlaceholder(status, t)}
        onChange={(e) => onChange(e.target.value)}
      />
      <SecretStatusLine status={status} />
    </div>
  );
}
