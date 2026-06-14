'use client';

import { useState } from 'react';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { graphqlRequest } from '../../lib/graphql-client';
import { UPDATE_PLATFORM_INTEGRATION_SETTINGS } from '../../graphql/operations';
import type {
  PlatformIntegrationConfigDto,
  PlatformIntegrationSecretsDto,
  PlatformIntegrationSettingsDto,
} from '@pkg/types';
import { IntegrationSecretField } from './connections/integration-ui';
import styles from './WordDictionaryPanel.module.scss';

type Props = {
  config: PlatformIntegrationConfigDto['mediaCaptions'];
  secrets: PlatformIntegrationSecretsDto;
  secretStatuses: PlatformIntegrationSettingsDto['secretStatuses'];
  secretsStorageAvailable: boolean;
  onSaved: (settings: PlatformIntegrationSettingsDto) => void;
};

export function MediaCaptionsPanel({
  config,
  secrets,
  secretStatuses,
  secretsStorageAvailable,
  onSaved,
}: Props) {
  const [draft, setDraft] = useState(config);
  const [draftSecrets, setDraftSecrets] = useState(secrets);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const data = await graphqlRequest<{
        updatePlatformIntegrationSettings: PlatformIntegrationSettingsDto;
      }>(UPDATE_PLATFORM_INTEGRATION_SETTINGS, {
        input: {
          config: {
            mediaCaptions: {
              enabled: draft.enabled,
              sttProvider: draft.sttProvider,
              sourceLanguage: draft.sourceLanguage,
              targetLanguages: draft.targetLanguages,
            },
          },
          secrets: {
            openaiWhisperApiKey: draftSecrets.openaiWhisperApiKey,
          },
        },
      });
      onSaved(data.updatePlatformIntegrationSettings);
      setFeedback({ type: 'success', text: 'Media captions settings saved.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save media captions settings',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SurfaceCard className={styles.sectionCard}>
      <h3 className={styles.sectionTitle}>Media captions (audio / video)</h3>
      <p className={styles.sectionHint}>
        Auto-generate subtitles after library audio/video upload. Use <strong>Local Whisper</strong>{' '}
        (whisper.cpp on the server, no API key) or OpenAI Whisper API. Translated tracks use the
        active translation provider above.
      </p>
      <div className={styles.fieldGrid}>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) =>
              setDraft((current) => ({ ...current, enabled: event.target.checked }))
            }
          />
          <span>Enable auto captions</span>
        </label>
        <div className={styles.fieldGroup}>
          <span className={styles.label}>STT provider</span>
          <select
            className={styles.select}
            value={draft.sttProvider}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                sttProvider: event.target.value as PlatformIntegrationConfigDto['mediaCaptions']['sttProvider'],
              }))
            }
          >
            <option value="local_whisper">Local Whisper (whisper.cpp)</option>
            <option value="openai_whisper">OpenAI Whisper API</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        {draft.sttProvider === 'openai_whisper' ? (
          <IntegrationSecretField
            id="media-captions-whisper-key"
            label="OpenAI Whisper API key"
            status={secretStatuses.openaiWhisperApiKey}
            value={draftSecrets.openaiWhisperApiKey ?? ''}
            onChange={(value) =>
              setDraftSecrets((current) => ({ ...current, openaiWhisperApiKey: value || undefined }))
            }
          />
        ) : draft.sttProvider === 'local_whisper' ? (
          <p className={styles.sectionHint}>
            Requires <code>whisper-cli</code> and <code>MATERIAL_WHISPER_MODEL</code> in server .env
            (see .env.example). No API key needed.
          </p>
        ) : null}
        <Field
          label="Source language (optional)"
          hint="Leave empty for auto-detect"
          value={draft.sourceLanguage ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              sourceLanguage: event.target.value.trim() || null,
            }))
          }
        />
        <Field
          label="Target languages (comma-separated ISO codes)"
          value={draft.targetLanguages.join(', ')}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              targetLanguages: event.target.value
                .split(',')
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean),
            }))
          }
        />
      </div>
      {feedback ? (
        <p className={feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}>
          {feedback.text}
        </p>
      ) : null}
      <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
        {saving ? 'Saving…' : 'Save media captions'}
      </Button>
    </SurfaceCard>
  );
}
