'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Video } from 'lucide-react';
import {
  Button,
  Field,
  SegmentedControl,
  SurfaceCard,
} from '../../components/ui';
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

const PROVIDER_OPTIONS: Array<{ value: VideoMeetingProviderId; label: string }> = [
  { value: 'livekit', label: 'Built-in (LiveKit)' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'google', label: 'Google Meet' },
];

const PROVIDER_LABEL: Record<VideoMeetingProviderId, string> = {
  livekit: 'Built-in (LiveKit)',
  zoom: 'Zoom',
  google: 'Google Meet',
};

type Props = {
  onOpenConnections?: () => void;
};

export function VideoMeetingsPanel({ onOpenConnections }: Props = {}) {
  const [config, setConfig] = useState<PlatformIntegrationConfigDto | null>(null);
  const [settings, setSettings] = useState<PlatformIntegrationSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setSuccess('Saved.');
      window.setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <SurfaceCard>
        <p className={pageStyles.muted}>Loading video meetings…</p>
      </SurfaceCard>
    );
  }

  const vm = config.videoMeeting;
  const statuses = settings?.secretStatuses;

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
    // livekit: configured via env / docker-compose — always ready
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
        <Video size={16} aria-hidden /> Video meetings
      </h2>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        Pick the provider used to create video meeting links for new scheduled
        lessons. Zoom and Google Meet credentials are configured under{' '}
        <strong>Connections</strong>. Built-in (LiveKit) runs via Docker and
        requires no additional configuration here.
      </p>
      <div className={pageStyles.formGrid}>
        <SegmentedControl<VideoMeetingProviderId>
          ariaLabel="Video meeting provider"
          value={vm.provider}
          options={PROVIDER_OPTIONS}
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
              <strong>{PROVIDER_LABEL[vm.provider]}</strong> is selected but
              not fully configured. Open the{' '}
              <button
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
                Connections
              </button>{' '}
              tab and fill in the {PROVIDER_LABEL[vm.provider]} credentials so
              new lessons can create meeting links.
            </div>
          </div>
        ) : null}

        <div className={pageStyles.actionsRow}>
          <Button type="button" onClick={() => void onSave()} loading={saving}>
            Save
          </Button>
          {success ? <span className={pageStyles.successText}>{success}</span> : null}
          {error ? <span className={pageStyles.errorText}>{error}</span> : null}
        </div>
      </div>
    </SurfaceCard>
  );
}
