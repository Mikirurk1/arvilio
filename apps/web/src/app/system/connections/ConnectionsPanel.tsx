'use client';

import { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button, SurfaceCard } from '../../../components/ui';
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
      setError(err instanceof Error ? err.message : 'Failed to load connection settings');
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
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Verification failed';
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
      setSuccess('Saved. New credentials apply immediately.');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Save failed';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <SurfaceCard className={pageStyles.card}>
        {loading ? <p className={pageStyles.muted}>Loading…</p> : null}
        {error ? <span className={pageStyles.error}>{error}</span> : null}
      </SurfaceCard>
    );
  }

  const g = googleMeta.fields;
  const gAdv = googleMeta.advancedFields;
  const f = facebookMeta.fields;
  const t = telegramMeta.fields;
  const z = zoomMeta.fields;

  return (
    <SurfaceCard className={pageStyles.card}>
      <header className={pageStyles.panelHeader}>
        <Link2 size={18} />
        <div>
          <div className={pageStyles.panelTitle}>Connections</div>
          <p className={styles.panelIntro}>
            Platform OAuth and Telegram bot. Hover the <strong>?</strong> next to each label for where
            to find the value. Verify before saving when you change secrets.
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Button
          type="button"
          className={pageStyles.submitBtn}
          loading={saving}
          loadingLabel="Saving…"
          onClick={() => void onSave()}
        >
          Save
        </Button>
        <Button
          type="button"
          className={pageStyles.verifyBtn}
          loading={verifying !== null}
          loadingLabel="Checking…"
          onClick={() => void onVerifyAll()}
        >
          Verify all
        </Button>
        <Button
          type="button"
          className={pageStyles.verifyBtn}
          onClick={() => void load()}
          loading={loading}
          loadingLabel="…"
        >
          Refresh
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
            label={g.googleClientId.label}
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
            label={g.googleClientSecret.label}
            tooltip={g.googleClientSecret.tooltip}
            status={settings?.secretStatuses.googleClientSecret}
            value={secrets.googleClientSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, googleClientSecret: v }))}
          />
          <ConnectionTextField
            id="google-callback"
            label={g.googleCallbackUrl.label}
            tooltip={g.googleCallbackUrl.tooltip}
            wide
            value={config.google.callbackUrl}
            onChange={(value) =>
              setConfig({ ...config, google: { ...config.google, callbackUrl: value } })
            }
          />
          {gAdv ? (
            <details className={styles.advanced}>
              <summary className={styles.advancedSummary}>Redirect URLs (optional)</summary>
              <div className={styles.advancedFields}>
                <ConnectionTextField
                  id="google-success"
                  label={gAdv.googleSuccessRedirect.label}
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
            label={f.facebookAppId.label}
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
            label={f.facebookAppSecret.label}
            tooltip={f.facebookAppSecret.tooltip}
            status={settings?.secretStatuses.facebookAppSecret}
            value={secrets.facebookAppSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, facebookAppSecret: v }))}
          />
          <ConnectionTextField
            id="facebook-callback"
            label={f.facebookCallbackUrl.label}
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
            label={t.telegramBotToken.label}
            tooltip={t.telegramBotToken.tooltip}
            status={settings?.secretStatuses.telegramBotToken}
            value={secrets.telegramBotToken ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, telegramBotToken: v }))}
          />
          <ConnectionTextField
            id="telegram-username"
            label={t.telegramBotUsername.label}
            tooltip={t.telegramBotUsername.tooltip}
            placeholder="my_school_bot"
            value={config.telegram.botUsername ?? ''}
            onChange={(value) =>
              setConfig({
                ...config,
                telegram: { ...config.telegram, botUsername: value || null },
              })
            }
          />
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <div className={styles.checkboxField}>
              <input
                id="telegram-dev-polling"
                type="checkbox"
                className={styles.checkboxControl}
                checked={config.telegram.devPolling}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    telegram: { ...config.telegram, devPolling: e.target.checked },
                  })
                }
              />
              <div className={styles.checkboxCopy}>
                <FieldLabelHint
                  label={t.telegramDevPolling.label}
                  tooltip={t.telegramDevPolling.tooltip}
                />
              </div>
            </div>
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
            label={z.zoomClientId.label}
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
            label={z.zoomClientSecret.label}
            tooltip={z.zoomClientSecret.tooltip}
            status={settings?.secretStatuses.zoomClientSecret}
            value={secrets.zoomClientSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, zoomClientSecret: v }))}
          />
          <ConnectionSecretField
            id="zoom-webhook-secret"
            label={z.zoomWebhookSecret.label}
            tooltip={z.zoomWebhookSecret.tooltip}
            status={settings?.secretStatuses.zoomWebhookSecret}
            value={secrets.zoomWebhookSecret ?? ''}
            onChange={(v) => setSecrets((s) => ({ ...s, zoomWebhookSecret: v }))}
          />
          <ConnectionTextField
            id="zoom-callback"
            label={z.zoomCallbackUrl.label}
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
            <div className={styles.checkboxField}>
              <input
                id="zoom-server-to-server"
                type="checkbox"
                className={styles.checkboxControl}
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
              />
              <div className={styles.checkboxCopy}>
                <FieldLabelHint
                  label={z.zoomUseServerToServer.label}
                  tooltip={z.zoomUseServerToServer.tooltip}
                />
              </div>
            </div>
          </div>
        </ConnectionProviderSection>

      </div>
    </SurfaceCard>
  );
}
