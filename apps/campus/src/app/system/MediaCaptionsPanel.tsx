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
import { useCampusT } from '../../lib/cms';
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
  secretsStorageAvailable: _secretsStorageAvailable,
  onSaved,
}: Props) {
  const t = useCampusT();
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
      setFeedback({ type: 'success', text: t('system.dictionary.captions.saveSuccess') });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : t('system.dictionary.captions.saveFailed'),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SurfaceCard className={styles.sectionCard}>
      <h3 className={styles.sectionTitle}>{t('system.dictionary.captions.title')}</h3>
      <p className={styles.sectionHint}>{t('system.dictionary.captions.hint')}</p>
      <div className={styles.fieldGrid}>
        <Field
          as="checkbox"
          checked={draft.enabled}
          onChange={(event) =>
            setDraft((current) => ({ ...current, enabled: event.target.checked }))
          }
          label={t('system.dictionary.captions.enable')}
          rootClassName={styles.checkboxRow}
        />
        <div className={styles.fieldGroup}>
          <span className={styles.label}>{t('system.dictionary.captions.sttProvider')}</span>
          <Field
            as="select"
            className={styles.select}
            value={draft.sttProvider}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                sttProvider: event.target.value as PlatformIntegrationConfigDto['mediaCaptions']['sttProvider'],
              }))
            }
          >
            <option value="local_whisper">{t('system.dictionary.captions.stt.localWhisper')}</option>
            <option value="openai_whisper">{t('system.dictionary.captions.stt.openaiWhisper')}</option>
            <option value="disabled">{t('system.dictionary.captions.stt.disabled')}</option>
          </Field>
        </div>
        {draft.sttProvider === 'openai_whisper' ? (
          <IntegrationSecretField
            id="media-captions-whisper-key"
            label={t('system.dictionary.captions.whisperKey')}
            status={secretStatuses.openaiWhisperApiKey}
            value={draftSecrets.openaiWhisperApiKey ?? ''}
            onChange={(value) =>
              setDraftSecrets((current) => ({ ...current, openaiWhisperApiKey: value || undefined }))
            }
          />
        ) : draft.sttProvider === 'local_whisper' ? (
          <p className={styles.sectionHint}>{t('system.dictionary.captions.localWhisperHint')}</p>
        ) : null}
        <Field
          label={t('system.dictionary.captions.sourceLanguage')}
          hint={t('system.dictionary.captions.sourceLanguageHint')}
          value={draft.sourceLanguage ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              sourceLanguage: event.target.value.trim() || null,
            }))
          }
        />
        <Field
          label={t('system.dictionary.captions.targetLanguages')}
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
      <Button type="button" variant="primary" loading={saving} loadingLabel={t('system.dictionary.captions.saving')} onClick={() => void save()}>
        {t('system.dictionary.captions.save')}
      </Button>
    </SurfaceCard>
  );
}
