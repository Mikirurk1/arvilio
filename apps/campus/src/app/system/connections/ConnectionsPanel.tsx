'use client';

import { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../../../components/ui';
import { graphqlRequest } from '../../../lib/graphql-client';
import {
  PLATFORM_INTEGRATION_SETTINGS,
  UPDATE_PLATFORM_INTEGRATION_SETTINGS,
  VERIFY_PLATFORM_CONNECTION,
} from '../../../graphql/operations';
import type {
  PlatformConnectionProviderId,
  PlatformIntegrationConfigDto,
  PlatformIntegrationSecretsDto,
  PlatformIntegrationSettingsDto,
  VerifyPlatformConnectionResultDto,
} from '@pkg/types';
import { ApiError } from '../../../lib/api';
import { useCampusT } from '../../../lib/cms';
import { getConnectionMeta } from './connection-provider-meta';
import { ConnectionProviderSection } from './ConnectionProviderSection';
import {
  ConnectionSecretField,
  ConnectionTextField,
  FieldLabelHint,
} from './connection-ui';
import { secretsFromIntegrationSettings } from './integration-secrets-state';
import styles from './ConnectionsPanel.module.scss';
import pageStyles from '../page.module.scss';

type VerifyState = Partial<
  Record<PlatformConnectionProviderId, VerifyPlatformConnectionResultDto | null>
>;

const googleMeta = getConnectionMeta('google');
const facebookMeta = getConnectionMeta('facebook');
const telegramMeta = getConnectionMeta('telegram');
const zoomMeta = getConnectionMeta('zoom');

export function ConnectionsPanel() {
  const t = useCampusT();
  const [settings, setSettings] = useState<PlatformIntegrationSettingsDto | null>(null);
  const [config, setConfig] = useState<PlatformIntegrationConfigDto | null>(null);
  const [secrets, setSecrets] = useState<PlatformIntegrationSecretsDto>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState<PlatformConnectionProviderId | null>(null);
  const [verifyResults, setVerifyResults] = useState<VerifyState>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<{ platformIntegrationSettings: PlatformIntegrationSettingsDto }>(
        PLATFORM_INTEGRATION_SETTINGS,
      );
      setSettings(data.platformIntegrationSettings);
      setConfig(data.platformIntegrationSettings.config);
      setSecrets(secretsFromIntegrationSettings(data.platformIntegrationSettings));
      setVerifyResults({});
    } catch (err) {
      setError(err instanceof Error ? err.message : t('system.connections.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const connectionInput = () => ({
    config: config
      ? {
          telegram: config.telegram,
          google: config.google,
          facebook: config.facebook,
          videoMeeting: {
            zoom: config.videoMeeting.zoom,
          },
        }
      : undefined,
    secrets: Object.values(secrets).some((v) => v !== undefined && v !== '') ? secrets : undefined,
  });

  const onVerify = async (provider: PlatformConnectionProviderId) => {
    if (!config) return;
    setVerifying(provider);
    setError(null);
    try {
      const data = await graphqlRequest<{
        verifyPlatformConnection: VerifyPlatformConnectionResultDto;
      }>(VERIFY_PLATFORM_CONNECTION, {
        input: { provider, ...connectionInput() },
      });
      setVerifyResults((prev) => ({ ...prev, [provider]: data.verifyPlatformConnection }));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : t('system.connections.verifyFailed');
      setVerifyResults((prev) => ({ ...prev, [provider]: { ok: false, message } }));
    } finally {
      setVerifying(null);
    }
  };

  const onVerifyAll = async () => {
    for (const provider of ['google', 'facebook', 'telegram', 'zoom'] as const) {
      await onVerify(provider);
    }
  };

  const onSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await graphqlRequest<{
        updatePlatformIntegrationSettings: PlatformIntegrationSettingsDto;
      }>(UPDATE_PLATFORM_INTEGRATION_SETTINGS, { input: connectionInput() });
      setSettings(data.updatePlatformIntegrationSettings);
      setConfig(data.updatePlatformIntegrationSettings.config);
      setSecrets(secretsFromIntegrationSettings(data.updatePlatformIntegrationSettings));
      setSuccess(t('system.connections.saveSuccess'));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : t('common.saveFailed');
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <SurfaceCard className={pageStyles.card}>
        {loading ? <p className={pageStyles.muted}>{t('common.loading')}</p> : null}
        {error ? <span className={pageStyles.error}>{error}</span> : null}
      </SurfaceCard>
    );
  }

  const g = googleMeta.fields;
  const gAdv = googleMeta.advancedFields;
  const f = facebookMeta.fields;
  const tg = telegramMeta.fields;
  const z = zoomMeta.fields;

  return (
    <SurfaceCard className={pageStyles.card}>
      <header className={pageStyles.panelHeader}>
        <Link2 size={18} />
        <div>
          <div className={pageStyles.panelTitle}>{t('system.connections.title')}</div>
          <p className={styles.panelIntro}>{t('system.connections.intro')}</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Button
          type="button"
          className={pageStyles.submitBtn}
          loading={saving}
          loadingLabel={t('common.saving')}
          onClick={() => void onSave()}
        >
          {t('common.save')}
        </Button>
        <Button
          type="button"
          className={pageStyles.verifyBtn}
          loading={verifying !== null}
          loadingLabel={t('system.connections.checking')}
          onClick={() => void onVerifyAll()}
        >
          {t('system.connections.verifyAll')}
        </Button>
        <Button
          type="button"
          className={pageStyles.verifyBtn}
          onClick={() => void load()}
          loading={loading}
          loadingLabel="…"
        >
          {t('common.refresh')}
        </Button>
        {error ? <p className={styles.feedbackError}>{error}</p> : null}
        {success ? <p className={styles.feedbackSuccess}>{success}</p> : null}
      </div>

      <div className={styles.sections}>
        <ConnectionProviderSection
          meta={googleMeta}
          verifying={verifying === 'google'}
          verifyResult={verifyResults.google}
          onVerify={() => void onVerify('google')}
        >
          <ConnectionTextField
            id="google-client-id"
            label={t(g.googleClientId.labelKey)}
            tooltip={g.googleClientId.tooltip}
            value={config.google.clientId ?? ''}
            onChange={(value) =>
              setConfig({
                ...config,
                google: { ...config.google, clientId: value || null },
              })
            }
          />
          <ConnectionSecretField
            id="google-client-secret"
            label={t(g.googleClientSecret.labelKey)}
            tooltip={g.googleClientSecret.tooltip}
            status={settings?.secretStatuses.googleClientSecret}
            value={secrets.googleClientSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, googleClientSecret: v }))}
          />
          <ConnectionTextField
            id="google-callback"
            label={t(g.googleCallbackUrl.labelKey)}
            tooltip={g.googleCallbackUrl.tooltip}
            wide
            value={config.google.callbackUrl}
            onChange={(value) =>
              setConfig({ ...config, google: { ...config.google, callbackUrl: value } })
            }
          />
          {gAdv ? (
            <details className={styles.advanced}>
              <summary className={styles.advancedSummary}>{t('system.connections.advanced.redirectUrls')}</summary>
              <div className={styles.advancedFields}>
                <ConnectionTextField
                  id="google-success"
                  label={t(gAdv.googleSuccessRedirect.labelKey)}
                  tooltip={gAdv.googleSuccessRedirect.tooltip}
                  wide
                  value={config.google.successRedirect}
                  onChange={(value) =>
                    setConfig({
                      ...config,
                      google: { ...config.google, successRedirect: value },
                    })
                  }
                />
              </div>
            </details>
          ) : null}
        </ConnectionProviderSection>

        <ConnectionProviderSection
          meta={facebookMeta}
          verifying={verifying === 'facebook'}
          verifyResult={verifyResults.facebook}
          onVerify={() => void onVerify('facebook')}
        >
          <ConnectionTextField
            id="facebook-app-id"
            label={t(f.facebookAppId.labelKey)}
            tooltip={f.facebookAppId.tooltip}
            value={config.facebook.appId ?? ''}
            onChange={(value) =>
              setConfig({
                ...config,
                facebook: { ...config.facebook, appId: value || null },
              })
            }
          />
          <ConnectionSecretField
            id="facebook-app-secret"
            label={t(f.facebookAppSecret.labelKey)}
            tooltip={f.facebookAppSecret.tooltip}
            status={settings?.secretStatuses.facebookAppSecret}
            value={secrets.facebookAppSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, facebookAppSecret: v }))}
          />
          <ConnectionTextField
            id="facebook-callback"
            label={t(f.facebookCallbackUrl.labelKey)}
            tooltip={f.facebookCallbackUrl.tooltip}
            wide
            value={config.facebook.callbackUrl}
            onChange={(value) =>
              setConfig({
                ...config,
                facebook: { ...config.facebook, callbackUrl: value },
              })
            }
          />
        </ConnectionProviderSection>

        <ConnectionProviderSection
          meta={telegramMeta}
          verifying={verifying === 'telegram'}
          verifyResult={verifyResults.telegram}
          onVerify={() => void onVerify('telegram')}
        >
          <ConnectionSecretField
            id="telegram-bot-token"
            label={t(tg.telegramBotToken.labelKey)}
            tooltip={tg.telegramBotToken.tooltip}
            status={settings?.secretStatuses.telegramBotToken}
            value={secrets.telegramBotToken ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, telegramBotToken: v }))}
          />
          <ConnectionTextField
            id="telegram-username"
            label={t(tg.telegramBotUsername.labelKey)}
            tooltip={tg.telegramBotUsername.tooltip}
            placeholder={t('system.connections.placeholder.telegramBotUsername')}
            value={config.telegram.botUsername ?? ''}
            onChange={(value) =>
              setConfig({
                ...config,
                telegram: { ...config.telegram, botUsername: value || null },
              })
            }
          />
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <Field
              as="checkbox"
              id="telegram-dev-polling"
              checked={config.telegram.devPolling}
              onChange={(e) =>
                setConfig({
                  ...config,
                  telegram: { ...config.telegram, devPolling: e.target.checked },
                })
              }
              label={
                <FieldLabelHint
                  label={t(tg.telegramDevPolling.labelKey)}
                  tooltip={tg.telegramDevPolling.tooltip}
                />
              }
            />
          </div>
        </ConnectionProviderSection>

        <ConnectionProviderSection
          meta={zoomMeta}
          verifying={verifying === 'zoom'}
          verifyResult={verifyResults.zoom}
          onVerify={() => void onVerify('zoom')}
        >
          <ConnectionTextField
            id="zoom-client-id"
            label={t(z.zoomClientId.labelKey)}
            tooltip={z.zoomClientId.tooltip}
            value={config.videoMeeting.zoom.clientId ?? ''}
            onChange={(value) =>
              setConfig({
                ...config,
                videoMeeting: {
                  ...config.videoMeeting,
                  zoom: { ...config.videoMeeting.zoom, clientId: value || null },
                },
              })
            }
          />
          <ConnectionSecretField
            id="zoom-client-secret"
            label={t(z.zoomClientSecret.labelKey)}
            tooltip={z.zoomClientSecret.tooltip}
            status={settings?.secretStatuses.zoomClientSecret}
            value={secrets.zoomClientSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, zoomClientSecret: v }))}
          />
          <ConnectionSecretField
            id="zoom-webhook-secret"
            label={t(z.zoomWebhookSecret.labelKey)}
            tooltip={z.zoomWebhookSecret.tooltip}
            status={settings?.secretStatuses.zoomWebhookSecret}
            value={secrets.zoomWebhookSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, zoomWebhookSecret: v }))}
          />
          <ConnectionTextField
            id="zoom-callback"
            label={t(z.zoomCallbackUrl.labelKey)}
            tooltip={z.zoomCallbackUrl.tooltip}
            wide
            value={config.videoMeeting.zoom.callbackUrl}
            onChange={(value) =>
              setConfig({
                ...config,
                videoMeeting: {
                  ...config.videoMeeting,
                  zoom: { ...config.videoMeeting.zoom, callbackUrl: value },
                },
              })
            }
          />
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <Field
              as="checkbox"
              id="zoom-server-to-server"
              checked={config.videoMeeting.zoom.useServerToServer}
              onChange={(e) =>
                setConfig({
                  ...config,
                  videoMeeting: {
                    ...config.videoMeeting,
                    zoom: {
                      ...config.videoMeeting.zoom,
                      useServerToServer: e.target.checked,
                    },
                  },
                })
              }
              label={
                <FieldLabelHint
                  label={t(z.zoomUseServerToServer.labelKey)}
                  tooltip={z.zoomUseServerToServer.tooltip}
                />
              }
            />
          </div>
        </ConnectionProviderSection>

      </div>
    </SurfaceCard>
  );
}
