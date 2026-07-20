'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
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
  SmtpProviderPresetId,
  SystemMailStatusDto,
  VerifyPlatformConnectionResultDto,
} from '@pkg/types';
import {
  SMTP_PROVIDER_PRESETS,
  matchSmtpProviderPreset,
} from '@pkg/types';
import { ApiError } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import { IntegrationSecretField } from './connections/integration-ui';
import { secretsFromIntegrationSettings } from './connections/integration-secrets-state';
import { canVerifySmtp, smtpVerifyMutationVariables } from './smtp-verify-input';
import emailStyles from './EmailPanel.module.scss';
import pageStyles from './page.module.scss';

function smtpModeLabel(mode: string | null | undefined, t: (key: string) => string): string {
  return mode === 'custom' ? t('system.email.mode.custom') : t('system.email.mode.serverDefault');
}

export function EmailPanel() {
  const t = useCampusT();
  const smtpModeOptions = useMemo(
    (): { value: SmtpConfigModeDto; label: string }[] => [
      { value: 'server_default', label: t('system.email.mode.serverDefault') },
      { value: 'custom', label: t('system.email.mode.custom') },
    ],
    [t],
  );

  const [status, setStatus] = useState<SystemMailStatusDto | null>(null);
  const [settings, setSettings] = useState<PlatformIntegrationSettingsDto | null>(null);
  const [smtp, setSmtp] = useState<PlatformIntegrationConfigDto['smtp'] | null>(null);
  const [secrets, setSecrets] = useState<PlatformIntegrationSecretsDto>({});
  const [preset, setPreset] = useState<SmtpProviderPresetId>('custom');

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
        setLoadError(err instanceof Error ? err.message : t('system.email.loadStatusError'));
      }
    } finally {
      if (silent) {
        setRefreshingStatus(false);
      }
    }
  }, [t]);

  const loadSettings = useCallback(async () => {
    const data = await graphqlRequest<{ platformIntegrationSettings: PlatformIntegrationSettingsDto }>(
      PLATFORM_INTEGRATION_SETTINGS,
    );
    setSettings(data.platformIntegrationSettings);
    setSmtp(data.platformIntegrationSettings.config.smtp);
    setSecrets(secretsFromIntegrationSettings(data.platformIntegrationSettings));
    const s = data.platformIntegrationSettings.config.smtp;
    setPreset(matchSmtpProviderPreset(s.host, s.port));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await Promise.all([loadStatus(), loadSettings()]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('system.email.loadError'));
    } finally {
      setLoading(false);
    }
  }, [loadSettings, loadStatus, t]);

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
        text: data.verifySmtpConnection.message || t('system.email.verifySuccess'),
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : t('system.email.verifyFailed');
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
      setConfigFeedback({ type: 'success', text: t('system.email.saveSuccess') });
      await loadStatus(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : t('common.saveFailed');
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
          text: result.message ?? t('system.email.test.success'),
        });
      } else {
        setTestFeedback({ type: 'error', text: result.message ?? t('system.email.test.failed') });
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : t('system.email.test.failed');
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
          <div className={pageStyles.panelTitle}>{t('system.email.title')}</div>
          <p className={emailStyles.intro}>{t('system.email.intro')}</p>
        </div>
      </header>

      {loading && !status ? <p className={emailStyles.muted}>{t('system.email.loading')}</p> : null}
      {loadError ? <p className={emailStyles.feedbackError}>{loadError}</p> : null}

      {status ? (
        <div
          className={`${emailStyles.runtimeBar} ${refreshingStatus ? emailStyles.runtimeBarRefreshing : ''}`}
          aria-busy={refreshingStatus}
          role="status"
        >
          <Badge variant={status.configured ? 'green' : 'amber'} size="sm">
            {status.configured ? t('system.email.badge.ready') : t('system.email.badge.notConfigured')}
          </Badge>
          <span className={emailStyles.runtimeEndpoint}>
            {status.smtpHost ? `${status.smtpHost}:${status.smtpPort ?? '—'}` : t('system.email.runtime.noHost')}
          </span>
          <span className={emailStyles.runtimeMeta}>
            {t('system.email.runtime.meta', {
              mode: smtpModeLabel(status.smtpMode, t),
              mailFrom: status.mailFrom,
            })}
          </span>
          <div className={emailStyles.runtimeActions}>
            <Button
              type="button"
              variant="ghost"
              startIcon={<RefreshCw size={14} aria-hidden />}
              loading={refreshingStatus}
              loadingLabel={t('system.email.refreshing')}
              onClick={() => void loadStatus(true)}
            >
              {t('common.refresh')}
            </Button>
          </div>
        </div>
      ) : null}

      {smtp ? (
        <div className={emailStyles.columns}>
          <section className={emailStyles.panel} aria-labelledby="email-smtp-config-heading">
            <div className={emailStyles.panelHead}>
              <h2 id="email-smtp-config-heading" className={emailStyles.panelTitle}>
                {t('system.email.smtpConfig.title')}
              </h2>
              <p className={emailStyles.panelBlurb}>{t('system.email.smtpConfig.blurb')}</p>
            </div>

            <div className={emailStyles.panelBody}>
              <SegmentedControl
                className={emailStyles.modeNav}
                ariaLabel={t('system.email.mode.aria')}
                value={smtp.mode}
                onValueChange={(mode) => setSmtp({ ...smtp, mode })}
                options={smtpModeOptions}
              />

              {custom && settings && !settings.secretsStorageAvailable ? (
                <p className={emailStyles.encryptionWarn} role="status">
                  {t('system.email.encryptionWarn')}
                </p>
              ) : null}

              {!custom ? (
                <p className={emailStyles.envCallout}>{t('system.email.envCallout')}</p>
              ) : null}

              <div className={emailStyles.fieldGrid}>
                <div className={emailStyles.fieldGroup}>
                  <label className={emailStyles.label} htmlFor="smtp-mail-from">
                    {t('system.email.field.fromAddress')}
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
                    <div className={emailStyles.fieldGroupWide}>
                      <label className={emailStyles.label} htmlFor="smtp-preset">
                        {t('system.email.field.preset')}
                      </label>
                      <Field
                        as="select"
                        id="smtp-preset"
                        className={emailStyles.input}
                        value={preset}
                        onChange={(e) => {
                          const id = e.target.value as SmtpProviderPresetId;
                          setPreset(id);
                          const next = SMTP_PROVIDER_PRESETS.find((p) => p.id === id);
                          if (!next || id === 'custom') return;
                          setSmtp({
                            ...smtp,
                            mode: 'custom',
                            host: next.host,
                            port: next.port,
                            secure: next.secure,
                            user: next.suggestedUser ?? smtp.user,
                          });
                        }}
                      >
                        {SMTP_PROVIDER_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </Field>
                      {SMTP_PROVIDER_PRESETS.find((p) => p.id === preset)?.hint ? (
                        <p className={emailStyles.envCallout}>
                          {SMTP_PROVIDER_PRESETS.find((p) => p.id === preset)?.hint}
                        </p>
                      ) : null}
                    </div>
                    <div className={emailStyles.fieldGroup}>
                      <label className={emailStyles.label} htmlFor="smtp-host">
                        {t('system.email.field.host')}
                      </label>
                      <Field
                        id="smtp-host"
                        className={emailStyles.input}
                        value={smtp.host ?? ''}
                        onChange={(e) => {
                          setPreset('custom');
                          setSmtp({ ...smtp, host: e.target.value || null });
                        }}
                      />
                    </div>
                    <div className={emailStyles.fieldGroup}>
                      <label className={emailStyles.label} htmlFor="smtp-port">
                        {t('system.email.field.port')}
                      </label>
                      <Field
                        id="smtp-port"
                        type="number"
                        className={emailStyles.input}
                        value={smtp.port ?? 587}
                        onChange={(e) => {
                          setPreset('custom');
                          setSmtp({
                            ...smtp,
                            port: e.target.value ? Number(e.target.value) : null,
                          });
                        }}
                      />
                    </div>
                    <div className={emailStyles.fieldGroup}>
                      <label className={emailStyles.label} htmlFor="smtp-user">
                        {t('system.email.field.username')}
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
                        label={t('system.email.field.password')}
                        status={settings?.secretStatuses.smtpPass}
                        value={secrets.smtpPass ?? ''}
                        onChange={(v) => setSecrets({ smtpPass: v })}
                      />
                    </div>
                    <Field
                      as="checkbox"
                      checked={smtp.secure}
                      onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })}
                      label={t('system.email.field.tls')}
                      rootClassName={emailStyles.checkboxRow}
                    />
                  </>
                ) : null}
              </div>

              <footer className={emailStyles.panelFooter}>
                <Button
                  type="button"
                  variant="ghost"
                  loading={verifying}
                  loadingLabel={t('system.email.verifying')}
                  disabled={!canVerifySmtp(verifyDraft)}
                  onClick={() => void onVerify()}
                >
                  {t('system.email.verifyConnection')}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  loading={saving}
                  loadingLabel={t('system.email.saving')}
                  onClick={() => void onSave()}
                >
                  {t('system.email.saveSmtp')}
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
                {t('system.email.test.title')}
              </h2>
              <p className={emailStyles.panelBlurb}>{t('system.email.test.blurb')}</p>
            </div>

            <div className={emailStyles.panelBody}>
              <ol className={emailStyles.steps}>
                <li>{t('system.email.test.step1')}</li>
                <li>{t('system.email.test.step2')}</li>
                <li>{t('system.email.test.step3')}</li>
              </ol>

              <form className={emailStyles.testForm} onSubmit={onSendTest} noValidate>
                <div className={emailStyles.fieldGroup}>
                  <label className={emailStyles.label} htmlFor="system-test-email">
                    {t('system.email.test.recipient')}
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
                    loadingLabel={t('system.email.test.sending')}
                    disabled={!status?.configured}
                  >
                    {t('system.email.test.send')}
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
                  <p className={emailStyles.muted}>{t('system.email.test.configureFirst')}</p>
                ) : null}
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
