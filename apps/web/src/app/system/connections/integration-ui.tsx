'use client';

import type { IntegrationSecretFieldStatusDto } from '@pkg/types';
import { Field } from '../../../components/ui';
import styles from './ConnectionsPanel.module.scss';

export function secretStatusHint(status: IntegrationSecretFieldStatusDto | undefined): string {
  if (!status?.configured) return 'Not set';
  if (status.source === 'stored') return 'Saved in platform settings';
  if (status.source === 'env') return 'From server .env (fallback)';
  return '—';
}

export function secretFieldPlaceholder(_status: IntegrationSecretFieldStatusDto | undefined): string {
  return 'Enter value to change';
}

export function SecretStatusLine({
  status,
}: {
  status: IntegrationSecretFieldStatusDto | undefined;
}) {
  const configured = Boolean(status?.configured);
  return (
    <div
      className={`${styles.secretStatus} ${
        configured ? styles.secretStatusConfigured : styles.secretStatusMissing
      }`}
      role="status"
    >
      {secretStatusHint(status)}
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
  return (
    <div className={styles.fieldGroup}>
      <Field
        id={id}
        label={label}
        type="password"
        className={styles.input}
        autoComplete="off"
        value={value}
        placeholder={placeholder ?? secretFieldPlaceholder(status)}
        onChange={(e) => onChange(e.target.value)}
      />
      <SecretStatusLine status={status} />
    </div>
  );
}
