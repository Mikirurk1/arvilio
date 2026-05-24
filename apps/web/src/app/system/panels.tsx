'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { graphqlRequest } from '../../lib/graphql-client';
import {
  SEND_TEST_WELCOME_EMAIL,
  SYSTEM_MAIL_STATUS,
  VERIFY_SMTP_CONNECTION,
} from '../../graphql/operations';
import type { SendTestEmailResultDto, SystemMailStatusDto } from '@pkg/types';
import { ApiError } from '../../lib/api';
import styles from './page.module.scss';

export function EmailTestPanel() {
  const [status, setStatus] = useState<SystemMailStatusDto | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const data = await graphqlRequest<{ systemMailStatus: SystemMailStatusDto }>(SYSTEM_MAIL_STATUS);
      setStatus(data.systemMailStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mail status');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const onVerify = async () => {
    setVerifyBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await graphqlRequest(VERIFY_SMTP_CONNECTION);
      setSuccess('SMTP connection verified successfully.');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setVerifyBusy(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await graphqlRequest<{ sendTestWelcomeEmail: SendTestEmailResultDto }>(
        SEND_TEST_WELCOME_EMAIL,
        { input: { to: to.trim().toLowerCase() } },
      );
      const result = data.sendTestWelcomeEmail;
      if (result.sent) {
        setSuccess(result.message ?? 'Test email sent. Check your inbox (e.g. Mailtrap).');
      } else {
        setError(result.message ?? 'Failed to send test email');
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to send test email';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SurfaceCard className={styles.card}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Mail size={18} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--fs-15)' }}>Email (SMTP)</div>
          <div className={styles.hint}>
            Sends the <code>welcome-account</code> template with sample credentials. Use Mailtrap inbox to inspect.
          </div>
        </div>
      </header>

      {loadingStatus ? <p className={styles.muted}>Loading configuration…</p> : null}

      {status ? (
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>SMTP</div>
            <div className={status.configured ? styles.statusOk : styles.statusWarn}>
              {status.configured ? 'Configured' : 'Not configured'}
            </div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>Host</div>
            <div className={styles.statusValue}>{status.smtpHost ?? '—'}</div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>Port</div>
            <div className={styles.statusValue}>{status.smtpPort ?? '—'}</div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>From</div>
            <div className={styles.statusValue}>{status.mailFrom}</div>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="system-test-email">
            Send test to
          </label>
          <Field
            id="system-test-email"
            type="email"
            className={styles.input}
            autoComplete="off"
            required
            placeholder="you@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <p className={styles.hint}>
            Sample password in the email: <code>Example-Temp-Pass1</code> (not a real account).
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            type="button"
            className={styles.verifyBtn}
            disabled={verifyBusy || !status?.configured}
            onClick={() => void onVerify()}
          >
            {verifyBusy ? 'Verifying…' : 'Verify SMTP'}
          </Button>
          <Button type="submit" className={styles.submitBtn} disabled={busy || !status?.configured}>
            {busy ? 'Sending…' : 'Send test welcome email'}
          </Button>
          <Button type="button" className={styles.verifyBtn} onClick={() => void loadStatus()}>
            Refresh status
          </Button>
          {error ? <span className={styles.error}>{error}</span> : null}
          {success ? <span className={styles.success}>{success}</span> : null}
        </div>
      </form>
    </SurfaceCard>
  );
}
