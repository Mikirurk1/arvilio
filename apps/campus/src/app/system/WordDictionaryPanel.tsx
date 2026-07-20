'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Badge, Button, SurfaceCard } from '../../components/ui';
import { graphqlRequest } from '../../lib/graphql-client';
import {
  PLATFORM_INTEGRATION_SETTINGS,
  TRANSLATION_SETTINGS,
  UPDATE_PLATFORM_INTEGRATION_SETTINGS,
  UPDATE_WORD_DICTIONARY_PROVIDER,
  WORD_DICTIONARY_SETTINGS,
} from '../../graphql/operations';
import type {
  PlatformIntegrationConfigDto,
  PlatformIntegrationSecretsDto,
  PlatformIntegrationSettingsDto,
  TranslationProviderId,
  TranslationSettingsDto,
  WordDictionaryProviderId,
  WordDictionarySettingsDto,
} from '@pkg/types';
import { ApiError } from '../../lib/api';
import { secretsFromIntegrationSettings } from './connections/integration-secrets-state';
import { DictionarySourceSection } from './word-dictionary/DictionarySourceSection';
import { TranslationSourceSection } from './word-dictionary/TranslationSourceSection';
import { TranslationProviderConfig } from './word-dictionary/TranslationProviderConfig';
import { normalizeTranslationSettings } from './word-dictionary/word-dictionary-ui';
import styles from './WordDictionaryPanel.module.scss';
import pageStyles from './page.module.scss';

type Feedback = { type: 'error' | 'success'; text: string } | null;

export function WordDictionaryPanel() {
  const [dictSettings, setDictSettings] = useState<WordDictionarySettingsDto | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<WordDictionaryProviderId | null>(null);
  const [translationSettings, setTranslationSettings] = useState<TranslationSettingsDto | null>(null);
  const [selectedTranslationProvider, setSelectedTranslationProvider] = useState<TranslationProviderId | null>(null);
  const [integrationSettings, setIntegrationSettings] = useState<PlatformIntegrationSettingsDto | null>(null);
  const [translation, setTranslation] = useState<PlatformIntegrationConfigDto['translation'] | null>(null);
  const [secrets, setSecrets] = useState<PlatformIntegrationSecretsDto>({});
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState(false);
  const [savingTranslationProvider, setSavingTranslationProvider] = useState(false);
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [providerFeedback, setProviderFeedback] = useState<Feedback>(null);
  const [translationProviderFeedback, setTranslationProviderFeedback] = useState<Feedback>(null);
  const [languageFeedback, setLanguageFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setProviderFeedback(null);
    try {
      const [dictData, translationData, integrationData] = await Promise.all([
        graphqlRequest<{ wordDictionarySettings: WordDictionarySettingsDto }>(WORD_DICTIONARY_SETTINGS),
        graphqlRequest<{ translationSettings: TranslationSettingsDto }>(TRANSLATION_SETTINGS),
        graphqlRequest<{ platformIntegrationSettings: PlatformIntegrationSettingsDto }>(PLATFORM_INTEGRATION_SETTINGS),
      ]);
      setDictSettings(dictData.wordDictionarySettings);
      setSelectedProvider(dictData.wordDictionarySettings.activeProvider);
      setTranslationSettings(normalizeTranslationSettings(translationData.translationSettings));
      setSelectedTranslationProvider(translationData.translationSettings.activeProvider);
      setIntegrationSettings(integrationData.platformIntegrationSettings);
      setTranslation(integrationData.platformIntegrationSettings.config.translation);
      setSecrets(secretsFromIntegrationSettings(integrationData.platformIntegrationSettings));
    } catch (err) {
      setProviderFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load dictionary settings' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const providerDirty = Boolean(dictSettings && selectedProvider && selectedProvider !== dictSettings.activeProvider);
  const translationProviderDirty = Boolean(translationSettings && selectedTranslationProvider && selectedTranslationProvider !== translationSettings.activeProvider);

  const onSaveProvider = async () => {
    if (!selectedProvider || !dictSettings || !providerDirty) return;
    setSavingProvider(true);
    setProviderFeedback(null);
    try {
      const data = await graphqlRequest<{ updateWordDictionaryProvider: WordDictionarySettingsDto }>(UPDATE_WORD_DICTIONARY_PROVIDER, { input: { provider: selectedProvider } });
      setDictSettings(data.updateWordDictionaryProvider);
      setSelectedProvider(data.updateWordDictionaryProvider.activeProvider);
      setProviderFeedback({ type: 'success', text: 'Dictionary provider updated. New lookups use this source.' });
    } catch (err) {
      setProviderFeedback({ type: 'error', text: err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSavingProvider(false);
    }
  };

  const onSaveTranslationProvider = async () => {
    if (!selectedTranslationProvider || !translationSettings || !translationProviderDirty) return;
    setSavingTranslationProvider(true);
    setTranslationProviderFeedback(null);
    try {
      const data = await graphqlRequest<{ updatePlatformIntegrationSettings: PlatformIntegrationSettingsDto }>(UPDATE_PLATFORM_INTEGRATION_SETTINGS, { input: { config: { translation: { activeProvider: selectedTranslationProvider } } } });
      setIntegrationSettings(data.updatePlatformIntegrationSettings);
      setTranslation(data.updatePlatformIntegrationSettings.config.translation);
      const refreshed = await graphqlRequest<{ translationSettings: TranslationSettingsDto }>(TRANSLATION_SETTINGS);
      setTranslationSettings(normalizeTranslationSettings(refreshed.translationSettings));
      setSelectedTranslationProvider(selectedTranslationProvider);
      setTranslationProviderFeedback({ type: 'success', text: 'Translation provider updated. New translations try this source first.' });
    } catch (err) {
      setTranslationProviderFeedback({ type: 'error', text: err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSavingTranslationProvider(false);
    }
  };

  const onSaveLanguage = async () => {
    if (!translation) return;
    setSavingLanguage(true);
    setLanguageFeedback(null);
    try {
      const secretPatch: PlatformIntegrationSecretsDto = {};
      if (secrets.libreTranslateApiKey) secretPatch.libreTranslateApiKey = secrets.libreTranslateApiKey;
      if (secrets.reversoApiKey) secretPatch.reversoApiKey = secrets.reversoApiKey;
      if (secrets.deeplAuthKey) secretPatch.deeplAuthKey = secrets.deeplAuthKey;
      if (secrets.googleTranslateApiKey) secretPatch.googleTranslateApiKey = secrets.googleTranslateApiKey;
      if (secrets.azureTranslatorKey) secretPatch.azureTranslatorKey = secrets.azureTranslatorKey;
      const data = await graphqlRequest<{ updatePlatformIntegrationSettings: PlatformIntegrationSettingsDto }>(UPDATE_PLATFORM_INTEGRATION_SETTINGS, { input: { config: { translation }, secrets: Object.keys(secretPatch).length > 0 ? secretPatch : undefined } });
      setIntegrationSettings(data.updatePlatformIntegrationSettings);
      setTranslation(data.updatePlatformIntegrationSettings.config.translation);
      setSecrets(secretsFromIntegrationSettings(data.updatePlatformIntegrationSettings));
      setLanguageFeedback({ type: 'success', text: 'Language settings saved.' });
    } catch (err) {
      setLanguageFeedback({ type: 'error', text: err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSavingLanguage(false);
    }
  };

  const activeProviderName = dictSettings?.providers.find((p) => p.id === dictSettings.activeProvider)?.name ?? '—';
  const activeTranslationProviderName = translationSettings?.providers.find((p) => p.id === translationSettings.activeProvider)?.name ?? '—';
  const configProvider = selectedTranslationProvider ?? translationSettings?.activeProvider;
  const apiUrls = translationSettings?.apiUrls;
  const selectedProviderInfo = translationSettings?.providers.find((p) => p.id === configProvider);

  return (
    <SurfaceCard className={pageStyles.card}>
      <header className={pageStyles.panelHeader}>
        <BookOpen size={18} aria-hidden />
        <div>
          <div className={pageStyles.panelTitle}>Word dictionary</div>
          <p className={styles.intro}>English definitions and gloss translations when staff or students add vocabulary. Changes apply to new lookups; existing words keep stored data until re-enriched.</p>
        </div>
      </header>

      {loading && !dictSettings ? <p className={styles.muted}>Loading dictionary settings…</p> : null}

      {dictSettings && translation && translationSettings && apiUrls ? (
        <>
          <div className={styles.runtimeBar} role="status">
            <Badge variant="blue" size="sm">{activeProviderName}</Badge>
            <Badge variant="green" size="sm">{activeTranslationProviderName}</Badge>
            <span className={styles.runtimeMeta}>Context target: {translation.reversoContextTargetLang.toUpperCase()}</span>
            <div className={styles.runtimeActions}>
              <Button type="button" variant="ghost" startIcon={<RefreshCw size={14} aria-hidden />} loading={loading} loadingLabel="Refreshing…" onClick={() => void load()}>Refresh</Button>
            </div>
          </div>
          <div className={styles.sections}>
            <DictionarySourceSection
              dictSettings={dictSettings} selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider}
              saving={savingProvider} dirty={providerDirty} feedback={providerFeedback} onSave={() => void onSaveProvider()}
            />
            <TranslationSourceSection
              translationSettings={translationSettings} selectedProvider={selectedTranslationProvider} setSelectedProvider={setSelectedTranslationProvider}
              saving={savingTranslationProvider} dirty={translationProviderDirty} feedback={translationProviderFeedback} onSave={() => void onSaveTranslationProvider()}
            />
            <TranslationProviderConfig
              configProvider={configProvider} apiUrls={apiUrls} translation={translation} setTranslation={setTranslation}
              integrationSettings={integrationSettings} secrets={secrets} setSecrets={setSecrets}
              selectedProviderInfo={selectedProviderInfo} saving={savingLanguage} feedback={languageFeedback} onSave={() => void onSaveLanguage()}
            />
          </div>
        </>
      ) : null}
    </SurfaceCard>
  );
}
