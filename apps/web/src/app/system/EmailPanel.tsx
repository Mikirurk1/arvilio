'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { Badge, Button, Field, SegmentedControl, SurfaceCard } from '../../components/ui';
import { graphqlRequest } from '../../lib/graphql-client';
import {
  PLATFORM_INTEGRATION_SETTINGS,
  SEND_TEST_WELCOME_EMAIL,
  SYSTEM_MAIL_STATUS,
  UPDATE_PLATFORM_INTEGRATION_SETTINGS,
  VERIFY_SMTP_CONNECTION,
} from '../../graphql/operations';
import type {
  PlatformIntegrationConfigDto,
  PlatformIntegrationSecretsDto,
  PlatformIntegrationSettingsDto,
  SendTestEmailResultDto,
  SmtpConfigModeDto,
  SystemMailStatusDto,
  VerifyPlatformConnectionResultDto,
} from '@pkg/types';
import { ApiError } from '../../lib/api';
import { IntegrationSecretField } from './connections/integration-ui';
import { secretsFromIntegrationSettings } from './connections/integration-secrets-state';
import { canVerifySmtp, smtpVerifyMutationVariables } from './smtp-verify-input';
import emailStyles from './EmailPanel.module.scss';
import pageStyles from './page.module.scss';

const SMTP_MODE_OPTIONS: { value: SmtpConfigModeDto; label: string }[] = [
  { value: 'server_default', label: 'Server default' },
  { value: 'custom', label: 'Custom SMTP' },
];

function smtpModeLabel(mode: string | null | undefined): string {
  return mode === 'custom' ? 'Custom SMTP' : 'Server default';
}

export function EmailPanel() {
  const [status, setStatus] = useState<SystemMailStatusDto | null>(null);
  const [settings, setSettings] = useState<PlatformIntegrationSettingsDto | null>(null);
  const [smtp, setSmtp] = useState<PlatformIntegrationConfigDto['smtp'] | null>(null);
  const [secrets, setSecrets] = useState<PlatformIntegrationSecretsDto>({});

  const [loading, setLoading] = useState(true);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [configFeedback, setConfigFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null,
  );
  const [testFeedback, setTestFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [testTo, setTestTo] = useState('');

  const loadStatus = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshingStatus(true);
    }
    try {
      const data = await graphqlRequest<{ systemMailStatus: SystemMailStatusDto }>(SYSTEM_MAIL_STATUS);
      setStatus(data.systemMailStatus);
    } catch (err) {
      if (!silent) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load mail status');
      }
    } finally {
      if (silent) {
        setRefreshingStatus(false);
      }
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const data = await graphqlRequest<{ platformIntegrationSettings: PlatformIntegrationSettingsDto }>(
      PLATFORM_INTEGRATION_SETTINGS,
    );
    setSettings(data.platformIntegrationSettings);
    setSmtp(data.platformIntegrationSettings.config.smtp);
    setSecrets(secretsFromIntegrationSettings(data.platformIntegrationSettings));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await Promise.all([loadStatus(), loadSettings()]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load email settings');
    } finally {
      setLoading(false);
    }
  }, [loadSettings, loadStatus]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const onVerify = async () => {
    if (!smtp) return;
    setVerifying(true);
    setConfigFeedback(null);
    try {
      const data = await graphqlRequest<{
        verifySmtpConnection: VerifyPlatformConnectionResultDto;
      }>(VERIFY_SMTP_CONNECTION, smtpVerifyMutationVariables({ smtp, secrets }));
      setConfigFeedback({
        type: 'success',
        text: data.verifySmtpConnection.message || 'SMTP connection verified.',
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Verification failed';
      setConfigFeedback({ type: 'error', text: message });
    } finally {
      setVerifying(false);
    }
  };

  const onSave = async () => {
    if (!smtp) return;
    setSaving(true);
    setConfigFeedback(null);
    try {
      const hasSecrets = secrets.smtpPass !== undefined && secrets.smtpPass !== '';
      const data = await graphqlRequest<{
        updatePlatformIntegrationSettings: PlatformIntegrationSettingsDto;
      }>(UPDATE_PLATFORM_INTEGRATION_SETTINGS, {
        input: {
          config: { smtp },
          secrets: hasSecrets ? { smtpPass: secrets.smtpPass } : undefined,
        },
      });
      setSettings(data.updatePlatformIntegrationSettings);
      setSmtp(data.updatePlatformIntegrationSettings.config.smtp);
      setSecrets(secretsFromIntegrationSettings(data.updatePlatformIntegrationSettings));
      setConfigFeedback({ type: 'success', text: 'SMTP settings saved.' });
      await loadStatus(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Save failed';
      setConfigFeedback({ type: 'error', text: message });
    } finally {
      setSaving(false);
    }
  };

  const onSendTest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingTest(true);
    setTestFeedback(null);
    try {
      const data = await graphqlRequest<{ sendTestWelcomeEmail: SendTestEmailResultDto }>(
        SEND_TEST_WELCOME_EMAIL,
        { input: { to: testTo.trim().toLowerCase() } },
      );
      const result = data.sendTestWelcomeEmail;
      if (result.sent) {
        setTestFeedback({
          type: 'success',
          text: result.message ?? 'Test email sent. Check your inbox (e.g. Mailtrap).',
        });
      } else {
        setTestFeedback({ type: 'error', text: result.message ?? 'Failed to send test email' });
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to send test email';
      setTestFeedback({ type: 'error', text: message });
    } finally {
      setSendingTest(false);
    }
  };

  const custom = smtp?.mode === 'custom';
  const verifyDraft = smtp ? { smtp, secrets } : null;

  return (
    <SurfaceCard className={pageStyles.card}>
      <header className={pageStyles.panelHeader}>
        <Mail size={18} aria-hidden />
        <div>
          <div className={pageStyles.panelTitle}>Email (SMTP)</div>
          <p className={emailStyles.intro}>
            Transactional mail for welcome and account flows. Configure delivery here, verify the endpoint, then
            send a sample message.
          </p>
        </div>
      </header>

      {loading && !status ? <p className={emailStyles.muted}>Loading email settings…</p> : null}
      {loadError ? <p className={emailStyles.feedbackError}>{loadError}</p> : null}

      {status ? (
        <div
          className={`${emailStyles.runtimeBar} ${refreshingStatus ? emailStyles.runtimeBarRefreshing : ''}`}
          aria-busy={refreshingStatus}
          role="status"
        >
          <Badge variant={status.configured ? 'green' : 'amber'} size="sm">
            {status.configured ? 'Ready to send' : 'Not configured'}
          </Badge>
          <span className={emailStyles.runtimeEndpoint}>
            {status.smtpHost ? `${status.smtpHost}:${status.smtpPort ?? '—'}` : 'No SMTP host'}
          </span>
          <span className={emailStyles.runtimeMeta}>
            {smtpModeLabel(status.smtpMode)} · From {status.mailFrom}
          </span>
          <div className={emailStyles.runtimeActions}>
            <Button
              type="button"
              variant="ghost"
              startIcon={<RefreshCw size={14} aria-hidden />}
              loading={refreshingStatus}
              loadingLabel="Refreshing…"
              onClick={() => void loadStatus(true)}
            >
              Refresh
            </Button>
          </div>
        </div>
      ) : null}

      {smtp ? (
        <div className={emailStyles.columns}>
          <section className={emailStyles.panel} aria-labelledby="email-smtp-config-heading">
            <div className={emailStyles.panelHead}>
              <h2 id="email-smtp-config-heading" className={emailStyles.panelTitle}>
                SMTP configuration
              </h2>
              <p className={emailStyles.panelBlurb}>
                Server default reads <code>SMTP_*</code> from the API host. Custom stores encrypted credentials in
                the database.
              </p>
            </div>

            <div className={emailStyles.panelBody}>
              <SegmentedControl
                className={emailStyles.modeNav}
                ariaLabel="SMTP mode"
                value={smtp.mode}
                onValueChange={(mode) => setSmtp({ ...smtp, mode })}
                options={SMTP_MODE_OPTIONS}
              />

              {custom && settings && !settings.secretsStorageAvailable ? (
                <p className={emailStyles.encryptionWarn} role="status">
                  Set <code>PLATFORM_SECRETS_ENCRYPTION_KEY</code> (or{' '}
                  <code>PAYMENT_SECRETS_ENCRYPTION_KEY</code>) in the API <code>.env</code> and restart the API to
                  save a custom password.
                </p>
              ) : null}

              {!custom ? (
                <p className={emailStyles.envCallout}>
                  Using deployment environment variables. Switch to <strong>Custom SMTP</strong> to override host,
                  port, and credentials in platform settings.
                </p>
              ) : null}

              <div className={emailStyles.fieldGrid}>
                <div className={emailStyles.fieldGroup}>
                  <label className={emailStyles.label} htmlFor="smtp-mail-from">
                    From address
                  </label>
                  <Field
                    id="smtp-mail-from"
                    className={emailStyles.input}
                    value={smtp.mailFrom}
                    onChange={(e) => setSmtp({ ...smtp, mailFrom: e.target.value })}
                  />
                </div>

                {custom ? (
                  <>
                    <div className={emailStyles.fieldGroup}>
                      <label className={emailStyles.label} htmlFor="smtp-host">
                        Host
                      </label>
                      <Field
                        id="smtp-host"
                        className={emailStyles.input}
                        value={smtp.host ?? ''}
                        onChange={(e) => setSmtp({ ...smtp, host: e.target.value || null })}
                      />
                    </div>
                    <div className={emailStyles.fieldGroup}>
                      <label className={emailStyles.label} htmlFor="smtp-port">
                        Port
                      </label>
                      <Field
                        id="smtp-port"
                        type="number"
                        className={emailStyles.input}
                        value={smtp.port ?? 587}
                        onChange={(e) =>
                          setSmtp({ ...smtp, port: e.target.value ? Number(e.target.value) : null })
                        }
                      />
                    </div>
                    <div className={emailStyles.fieldGroup}>
                      <label className={emailStyles.label} htmlFor="smtp-user">
                        Username
                      </label>
                      <Field
                        id="smtp-user"
                        className={emailStyles.input}
                        value={smtp.user ?? ''}
                        onChange={(e) => setSmtp({ ...smtp, user: e.target.value || null })}
                      />
                    </div>
                    <div className={emailStyles.fieldGroupWide}>
                      <IntegrationSecretField
                        id="smtp-pass"
                        label="Password"
                        status={settings?.secretStatuses.smtpPass}
                        value={secrets.smtpPass ?? ''}
                        onChange={(v) => setSecrets({ smtpPass: v })}
                      />
                    </div>
                    <label className={emailStyles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={smtp.secure}
                        onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })}
                      />
                      <span>Use TLS/SSL (typical for port 465)</span>
                    </label>
                  </>
                ) : null}
              </div>

              <footer className={emailStyles.panelFooter}>
                <Button
                  type="button"
                  variant="ghost"
                  loading={verifying}
                  loadingLabel="Verifying…"
                  disabled={!canVerifySmtp(verifyDraft)}
                  onClick={() => void onVerify()}
                >
                  Verify connection
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  loading={saving}
                  loadingLabel="Saving…"
                  onClick={() => void onSave()}
                >
                  Save SMTP
                </Button>
                {configFeedback ? (
                  <p
                    className={
                      configFeedback.type === 'error'
                        ? emailStyles.feedbackError
                        : emailStyles.feedbackSuccess
                    }
                    role="status"
                  >
                    {configFeedback.text}
                  </p>
                ) : null}
              </footer>
            </div>
          </section>

          <section className={emailStyles.panel} aria-labelledby="email-test-heading">
            <div className={emailStyles.panelHead}>
              <h2 id="email-test-heading" className={emailStyles.panelTitle}>
                Test delivery
              </h2>
              <p className={emailStyles.panelBlurb}>
                Sends the <code>welcome-account</code> template with sample password{' '}
                <code>Example-Temp-Pass1</code>.
              </p>
            </div>

            <div className={emailStyles.panelBody}>
              <ol className={emailStyles.steps}>
                <li>Verify connection with the values in the form (does not send mail).</li>
                <li>Save SMTP so the runtime banner matches your settings.</li>
                <li>Send a test message to your inbox or Mailtrap.</li>
              </ol>

              <form className={emailStyles.testForm} onSubmit={onSendTest} noValidate>
                <div className={emailStyles.fieldGroup}>
                  <label className={emailStyles.label} htmlFor="system-test-email">
                    Recipient
                  </label>
                  <Field
                    id="system-test-email"
                    type="email"
                    className={emailStyles.input}
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                  />
                </div>

                <div className={emailStyles.testActions}>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={sendingTest}
                    loadingLabel="Sending…"
                    disabled={!status?.configured}
                  >
                    Send test welcome email
                  </Button>
                </div>

                {testFeedback ? (
                  <p
                    className={
                      testFeedback.type === 'error' ? emailStyles.feedbackError : emailStyles.feedbackSuccess
                    }
                    role="status"
                  >
                    {testFeedback.text}
                  </p>
                ) : null}

                {!status?.configured ? (
                  <p className={emailStyles.muted}>Configure SMTP before sending a test message.</p>
                ) : null}
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
