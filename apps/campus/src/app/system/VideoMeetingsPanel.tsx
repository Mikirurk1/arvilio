'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Video } from 'lucide-react';
import {
  Button,
  SegmentedControl,
  SurfaceCard,
} from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { graphqlRequest } from '../../lib/graphql-client';
import {
  PLATFORM_INTEGRATION_SETTINGS,
  UPDATE_PLATFORM_INTEGRATION_SETTINGS,
} from '../../graphql/operations';
import type {
  PlatformIntegrationConfigDto,
  PlatformIntegrationSettingsDto,
  VideoMeetingProviderId,
} from '@pkg/types';
import pageStyles from './page.module.scss';

const PROVIDER_BRAND_LABEL: Record<Exclude<VideoMeetingProviderId, 'livekit'>, string> = {
  zoom: 'Zoom',
  google: 'Google Meet',
};

type Props = {
  onOpenConnections?: () => void;
};

export function VideoMeetingsPanel({ onOpenConnections }: Props = {}) {
  const t = useCampusT();
  const [config, setConfig] = useState<PlatformIntegrationConfigDto | null>(null);
  const [settings, setSettings] = useState<PlatformIntegrationSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const providerLabel = (provider: VideoMeetingProviderId) =>
    provider === 'livekit'
      ? t('system.general.videoMeetings.provider.livekit')
      : PROVIDER_BRAND_LABEL[provider];

  const providerOptions = useMemo(
    (): Array<{ value: VideoMeetingProviderId; label: string }> => [
      { value: 'livekit', label: t('system.general.videoMeetings.provider.livekit') },
      { value: 'zoom', label: PROVIDER_BRAND_LABEL.zoom },
      { value: 'google', label: PROVIDER_BRAND_LABEL.google },
    ],
    [t],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<{
        platformIntegrationSettings: PlatformIntegrationSettingsDto;
      }>(PLATFORM_INTEGRATION_SETTINGS);
      setSettings(data.platformIntegrationSettings);
      setConfig(data.platformIntegrationSettings.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await graphqlRequest<{
        updatePlatformIntegrationSettings: PlatformIntegrationSettingsDto;
      }>(UPDATE_PLATFORM_INTEGRATION_SETTINGS, {
        input: {
          config: {
            videoMeeting: {
              provider: config.videoMeeting.provider,
            },
          },
        },
      });
      setSettings(data.updatePlatformIntegrationSettings);
      setConfig(data.updatePlatformIntegrationSettings.config);
      setSuccess(t('common.saved'));
      window.setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <SurfaceCard>
        <p className={pageStyles.muted}>{t('system.general.videoMeetings.loading')}</p>
      </SurfaceCard>
    );
  }

  const vm = config.videoMeeting;
  const statuses = settings?.secretStatuses;
  const currentProviderLabel = providerLabel(vm.provider);

  const providerConfigured = (() => {
    if (vm.provider === 'google') {
      return (
        Boolean(config.google.clientId?.trim()) &&
        Boolean(statuses?.googleClientSecret?.configured)
      );
    }
    if (vm.provider === 'zoom') {
      return (
        Boolean(vm.zoom.clientId?.trim()) &&
        Boolean(statuses?.zoomClientSecret?.configured)
      );
    }
    return true;
  })();

  return (
    <SurfaceCard>
      <h2
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          margin: '0 0 6px',
        }}
      >
        <Video size={16} aria-hidden /> {t('system.general.videoMeetings.title')}
      </h2>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        {t('system.general.videoMeetings.hintIntro')}
        <strong>{t('system.tab.connections')}</strong>
        {t('system.general.videoMeetings.hintOutro')}
      </p>
      <div className={pageStyles.formGrid}>
        <SegmentedControl<VideoMeetingProviderId>
          ariaLabel={t('system.general.videoMeetings.providerAria')}
          value={vm.provider}
          options={providerOptions}
          onValueChange={(provider) =>
            setConfig({
              ...config,
              videoMeeting: { ...vm, provider },
            })
          }
        />

        {!providerConfigured ? (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--amber-light, #fff7ed)',
              border: '1px solid var(--amber, #f59e0b)',
              color: 'var(--text)',
            }}
          >
            <AlertTriangle
              size={18}
              aria-hidden
              style={{ flexShrink: 0, color: 'var(--amber, #f59e0b)' }}
            />
            <div>
              <strong>{currentProviderLabel}</strong>{' '}
              {t('system.general.videoMeetings.notConfiguredLead')}{' '}
              <Button
                variant="bare"
                type="button"
                onClick={onOpenConnections}
                className={pageStyles.inlineLink}
                style={{
                  background: 'none',
                  border: 0,
                  padding: 0,
                  font: 'inherit',
                  color: 'var(--blue, #2563eb)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                {t('system.tab.connections')}
              </Button>{' '}
              {t('system.general.videoMeetings.notConfiguredTail', {
                provider: currentProviderLabel,
              })}
            </div>
          </div>
        ) : null}

        <div className={pageStyles.actionsRow}>
          <Button type="button" onClick={() => void onSave()} loading={saving}>
            {t('common.save')}
          </Button>
          {success ? <span className={pageStyles.successText}>{success}</span> : null}
          {error ? <span className={pageStyles.errorText}>{error}</span> : null}
        </div>
      </div>
    </SurfaceCard>
  );
}
