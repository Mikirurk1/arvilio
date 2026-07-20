'use client';

import { useEffect, useState } from 'react';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { apiClient } from '../../lib/api';
import type {
  PlatformLlmConfigDto,
  SchoolLlmSettingsDto,
  UpdateSchoolLlmSettingsRequestDto,
} from '@pkg/types';
import { useCampusT } from '../../lib/cms';
import { IntegrationSecretField } from './connections/integration-ui';
import styles from './LlmAssistantPanel.module.scss';

function sourceBadgeClass(source: string): string {
  if (source === 'school') return `${styles.badge} ${styles.badgeSchool}`;
  if (source === 'env') return `${styles.badge} ${styles.badgeEnv}`;
  return `${styles.badge} ${styles.badgePlatform}`;
}

/**
 * Campus System — school LLM override (Pro). Defaults come from Platform Control Plane.
 */
export function LlmAssistantPanel() {
  const t = useCampusT();
  const [settings, setSettings] = useState<SchoolLlmSettingsDto | null>(null);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [draft, setDraft] = useState<PlatformLlmConfigDto | null>(null);
  const [llmApiKey, setLlmApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await apiClient.get<SchoolLlmSettingsDto>('/system/llm');
        if (cancelled) return;
        setSettings(s);
        setOverrideEnabled(s.override.overrideEnabled);
        setDraft(s.override.config);
        setLlmApiKey(s.override.secrets.llmApiKey ?? '');
        setAnthropicApiKey(s.override.secrets.anthropicApiKey ?? '');
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            type: 'error',
            text: error instanceof Error ? error.message : t('system.dictionary.loadError'),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setFeedback(null);
    try {
      const body: UpdateSchoolLlmSettingsRequestDto = {
        overrideEnabled,
        config: {
          enabled: draft.enabled,
          provider: draft.provider,
          baseUrl: draft.baseUrl,
          model: draft.model,
          maxTokens: draft.maxTokens,
          temperature: draft.temperature,
        },
        secrets: {
          ...(llmApiKey ? { llmApiKey } : {}),
          ...(anthropicApiKey ? { anthropicApiKey } : {}),
        },
      };
      const next = await apiClient.put<SchoolLlmSettingsDto>('/system/llm', body);
      setSettings(next);
      setOverrideEnabled(next.override.overrideEnabled);
      setDraft(next.override.config);
      setLlmApiKey(next.override.secrets.llmApiKey ?? '');
      setAnthropicApiKey(next.override.secrets.anthropicApiKey ?? '');
      setFeedback({ type: 'success', text: t('system.ai.saveSuccess') });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : t('system.ai.saveFailed'),
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!draft) return;
    setTesting(true);
    setFeedback(null);
    try {
      const result = await apiClient.post<{
        ok: boolean;
        message: string;
        latencyMs: number;
      }>('/system/llm/test', {
        overrideEnabled,
        config: overrideEnabled
          ? {
              enabled: draft.enabled,
              provider: draft.provider,
              baseUrl: draft.baseUrl,
              model: draft.model,
              maxTokens: draft.maxTokens,
              temperature: draft.temperature,
            }
          : undefined,
        secrets: overrideEnabled
          ? {
              ...(llmApiKey ? { llmApiKey } : {}),
              ...(anthropicApiKey ? { anthropicApiKey } : {}),
            }
          : undefined,
      });
      setFeedback({
        type: result.ok ? 'success' : 'error',
        text: `${result.ok ? t('system.ai.testSuccess') : t('system.ai.testFailed')}: ${result.message}${
          typeof result.latencyMs === 'number' ? ` (${result.latencyMs}ms)` : ''
        }`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : t('system.ai.testFailed'),
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !settings || !draft) {
    return (
      <SurfaceCard>
        <p className={styles.loading}>{t('system.dictionary.loading')}</p>
      </SurfaceCard>
    );
  }

  const defaults = settings.platformDefaults;
  const effective = settings.effective;

  return (
    <div className={styles.root}>
      <p className={styles.intro}>{t('system.ai.campusHint')}</p>

      <div className={styles.runtimeBar} role="status">
        <span className={styles.runtimeLabel}>{t('system.ai.runtime')}</span>
        <div className={styles.runtimeValue}>
          <span className={sourceBadgeClass(effective.source)}>
            {t(`system.ai.source.${effective.source}`)}
          </span>
          <span className={effective.enabled ? styles.badge : `${styles.badge} ${styles.badgeOff}`}>
            {effective.enabled ? t('system.ai.status.on') : t('system.ai.status.off')}
          </span>
          <span>
            {effective.provider} · {effective.model ?? '—'}
          </span>
          <span className={effective.apiKeyConfigured ? styles.keyOk : styles.keyMissing}>
            {effective.apiKeyConfigured
              ? t('system.ai.key.configured')
              : t('system.ai.key.missing')}
          </span>
        </div>
      </div>

      <div className={styles.sections}>
        <section className={`${styles.panel} ${styles.panelMuted}`}>
          <header className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>{t('system.ai.platformDefaults')}</h3>
              <p className={styles.panelBlurb}>{t('system.ai.platformDefaultsHint')}</p>
            </div>
            <span className={`${styles.badge} ${styles.badgePlatform}`}>
              {t('system.ai.source.platform')}
            </span>
          </header>
          <div className={styles.panelBody}>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>{t('system.ai.enable')}</span>
                <span className={styles.metaVal}>
                  {defaults.enabled ? t('system.ai.status.on') : t('system.ai.status.off')}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>{t('system.ai.provider')}</span>
                <span className={styles.metaVal}>{defaults.provider}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>{t('system.ai.model')}</span>
                <span className={styles.metaVal}>{defaults.model ?? '—'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>{t('system.ai.baseUrl')}</span>
                <span className={styles.metaVal}>{defaults.baseUrl ?? '—'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>{t('system.ai.maxTokens')}</span>
                <span className={styles.metaVal}>{defaults.maxTokens}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>{t('system.ai.key.label')}</span>
                <span className={styles.metaVal}>
                  {defaults.secretStatuses.llmApiKey.configured ||
                  defaults.secretStatuses.anthropicApiKey.configured
                    ? t('system.ai.key.configured')
                    : t('system.ai.key.missing')}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>{t('system.ai.schoolOverride')}</h3>
              <p className={styles.panelBlurb}>{t('system.ai.schoolOverrideHint')}</p>
            </div>
            {settings.canOverride ? (
              <span className={`${styles.badge} ${styles.badgePro}`}>Pro</span>
            ) : (
              <span className={`${styles.badge} ${styles.badgePro}`}>
                {t('system.ai.proBadge')}
              </span>
            )}
          </header>
          <div className={styles.panelBody}>
            {!settings.canOverride ? (
              <>
                <p className={styles.lockNote}>{t('system.ai.proRequired')}</p>
                <div className={styles.footer}>
                  <Button
                    type="button"
                    variant="ghost"
                    loading={testing}
                    loadingLabel={t('system.ai.testing')}
                    onClick={() => void testConnection()}
                  >
                    {t('system.ai.test')}
                  </Button>
                  {feedback ? (
                    <p
                      className={
                        feedback.type === 'error'
                          ? styles.feedbackError
                          : styles.feedbackSuccess
                      }
                    >
                      {feedback.text}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Field
                  as="checkbox"
                  variant="card"
                  checked={overrideEnabled}
                  onChange={(event) => setOverrideEnabled(event.target.checked)}
                  label={t('system.ai.useSchoolOverride')}
                  hint={t('system.ai.useSchoolOverrideHint')}
                />

                {overrideEnabled ? (
                  <>
                    <Field
                      as="checkbox"
                      variant="card"
                      checked={draft.enabled}
                      onChange={(event) =>
                        setDraft((current) =>
                          current ? { ...current, enabled: event.target.checked } : current,
                        )
                      }
                      label={t('system.ai.enable')}
                      hint={t('system.ai.enableHint')}
                    />

                    <div className={styles.providerList} role="radiogroup" aria-label={t('system.ai.provider')}>
                      <label className={styles.providerCard}>
                        <input
                          className={styles.providerRadio}
                          type="radio"
                          name="llm-provider"
                          checked={draft.provider === 'openai_compat'}
                          onChange={() =>
                            setDraft((current) =>
                              current ? { ...current, provider: 'openai_compat' } : current,
                            )
                          }
                        />
                        <span>
                          <span className={styles.providerName}>
                            {t('system.ai.provider.openaiCompat')}
                          </span>
                          <p className={styles.providerDesc}>
                            {t('system.ai.provider.openaiCompatHint')}
                          </p>
                        </span>
                      </label>
                      <label className={styles.providerCard}>
                        <input
                          className={styles.providerRadio}
                          type="radio"
                          name="llm-provider"
                          checked={draft.provider === 'anthropic'}
                          onChange={() =>
                            setDraft((current) =>
                              current ? { ...current, provider: 'anthropic' } : current,
                            )
                          }
                        />
                        <span>
                          <span className={styles.providerName}>
                            {t('system.ai.provider.anthropic')}
                          </span>
                          <p className={styles.providerDesc}>
                            {t('system.ai.provider.anthropicHint')}
                          </p>
                        </span>
                      </label>
                    </div>

                    <div className={styles.fieldGrid}>
                      {draft.provider === 'openai_compat' ? (
                        <div className={styles.fieldFull}>
                          <Field
                            label={t('system.ai.baseUrl')}
                            hint={t('system.ai.baseUrlHint')}
                            value={draft.baseUrl ?? ''}
                            onChange={(event) =>
                              setDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      baseUrl: event.target.value.trim() || null,
                                    }
                                  : current,
                              )
                            }
                          />
                        </div>
                      ) : null}
                      <Field
                        label={t('system.ai.model')}
                        value={draft.model ?? ''}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, model: event.target.value.trim() || null }
                              : current,
                          )
                        }
                      />
                      <Field
                        label={t('system.ai.maxTokens')}
                        type="number"
                        value={String(draft.maxTokens)}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  maxTokens: Math.min(
                                    2048,
                                    Math.max(64, Number(event.target.value) || 384),
                                  ),
                                }
                              : current,
                          )
                        }
                      />
                      <Field
                        label={t('system.ai.temperature')}
                        type="number"
                        value={String(draft.temperature)}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  temperature: Math.min(
                                    1,
                                    Math.max(0, Number(event.target.value) || 0.3),
                                  ),
                                }
                              : current,
                          )
                        }
                      />
                      <div className={styles.fieldFull}>
                        {draft.provider === 'openai_compat' ? (
                          <IntegrationSecretField
                            id="school-llm-api-key"
                            label={t('system.ai.llmApiKey')}
                            value={llmApiKey}
                            status={settings.override.secretStatuses.llmApiKey}
                            onChange={setLlmApiKey}
                          />
                        ) : (
                          <IntegrationSecretField
                            id="school-anthropic-api-key"
                            label={t('system.ai.anthropicApiKey')}
                            value={anthropicApiKey}
                            status={settings.override.secretStatuses.anthropicApiKey}
                            onChange={setAnthropicApiKey}
                          />
                        )}
                      </div>
                    </div>
                  </>
                ) : null}

                <div className={styles.footer}>
                  <Button
                    type="button"
                    variant="ghost"
                    loading={testing}
                    loadingLabel={t('system.ai.testing')}
                    disabled={saving}
                    onClick={() => void testConnection()}
                  >
                    {t('system.ai.test')}
                  </Button>
                  <Button
                    type="button"
                    loading={saving}
                    loadingLabel={t('system.ai.saving')}
                    disabled={testing || !settings.canOverride}
                    onClick={() => void save()}
                  >
                    {t('system.ai.save')}
                  </Button>
                  {feedback ? (
                    <p
                      className={
                        feedback.type === 'error'
                          ? styles.feedbackError
                          : styles.feedbackSuccess
                      }
                    >
                      {feedback.text}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
