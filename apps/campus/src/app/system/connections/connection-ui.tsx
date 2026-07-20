'use client';

import { useRef, useState, type ReactNode } from 'react';
import { CircleHelp, ExternalLink } from 'lucide-react';
import { Field, Tooltip } from '../../../components/ui';
import type { IntegrationSecretFieldStatusDto } from '@pkg/types';
import { SecretStatusLine, secretFieldPlaceholder } from './integration-ui';
import styles from './ConnectionsPanel.module.scss';

export function FieldLabelHint({ label, tooltip, htmlFor }: { label: string; tooltip: string; htmlFor?: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className={styles.labelRow}>
      {htmlFor ? (
        <label className={styles.fieldLabel} htmlFor={htmlFor}>
          {label}
        </label>
      ) : (
        <span className={styles.fieldLabel}>{label}</span>
      )}
      <button
        ref={buttonRef}
        type="button"
        className={styles.infoBtn}
        aria-label={`How to get ${label}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <CircleHelp size={14} aria-hidden />
      </button>
      <Tooltip
        open={open}
        targetEl={buttonRef.current}
        content={tooltip}
        placement="top"
        className={styles.fieldTooltip}
      />
    </div>
  );
}

type ConnectionFieldProps = {
  id: string;
  label: string;
  tooltip: string;
  wide?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export function ConnectionField({ id, label, tooltip, wide, children, footer }: ConnectionFieldProps) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <FieldLabelHint label={label} tooltip={tooltip} htmlFor={id} />
      {children}
      {footer ? <div className={styles.fieldFooter}>{footer}</div> : null}
    </div>
  );
}

type SecretFieldProps = {
  id: string;
  label: string;
  tooltip: string;
  status: IntegrationSecretFieldStatusDto | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function ConnectionSecretField({
  id,
  label,
  tooltip,
  status,
  value,
  onChange,
  placeholder,
}: SecretFieldProps) {
  return (
    <ConnectionField
      id={id}
      label={label}
      tooltip={tooltip}
      footer={<SecretStatusLine status={status} />}
    >
      <Field
        id={id}
        type="password"
        className={styles.input}
        autoComplete="off"
        value={value}
        placeholder={placeholder ?? secretFieldPlaceholder(status)}
        onChange={(e) => onChange(e.target.value)}
      />
    </ConnectionField>
  );
}

export function ConnectionTextField({
  id,
  label,
  tooltip,
  wide,
  value,
  placeholder,
  type = 'text',
  onChange,
}: {
  id: string;
  label: string;
  tooltip: string;
  wide?: boolean;
  value: string;
  placeholder?: string;
  type?: 'text' | 'email';
  onChange: (value: string) => void;
}) {
  return (
    <ConnectionField id={id} label={label} tooltip={tooltip} wide={wide}>
      <Field
        id={id}
        type={type}
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </ConnectionField>
  );
}

export function DocsLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className={styles.docsLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
    >
      Docs
      <ExternalLink size={13} aria-hidden />
    </a>
  );
}
