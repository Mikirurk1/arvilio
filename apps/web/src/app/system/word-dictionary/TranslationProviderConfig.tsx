'use client';

import { Button, Field } from '../../../components/ui';
import type {
  PlatformIntegrationSecretsDto,
  PlatformIntegrationSettingsDto,
  PlatformTranslationConfigDto,
  TranslationApiUrlsDto,
  TranslationProviderId,
  TranslationSettingsDto,
} from '@pkg/types';
import { IntegrationSecretField } from '../connections/integration-ui';
import { ProviderSetupGuide } from '../payment/ProviderSetupGuide';
import { TRANSLATION_SETUP_GUIDES } from '../word-dictionary-setup-guides';
import { PaidProviderKeyWarning, SubscriptionBadge, TranslationEndpointField } from './word-dictionary-ui';
import styles from '../WordDictionaryPanel.module.scss';

interface Props {
  configProvider: TranslationProviderId | undefined;
  apiUrls: TranslationApiUrlsDto;
  translation: PlatformTranslationConfigDto;
  setTranslation: (next: PlatformTranslationConfigDto) => void;
  integrationSettings: PlatformIntegrationSettingsDto | null;
  secrets: PlatformIntegrationSecretsDto;
  setSecrets: React.Dispatch<React.SetStateAction<PlatformIntegrationSecretsDto>>;
  selectedProviderInfo: TranslationSettingsDto['providers'][number] | undefined;
  saving: boolean;
  feedback: { type: 'error' | 'success'; text: string } | null;
  onSave: () => void;
}

export function TranslationProviderConfig({
  configProvider, apiUrls, translation, setTranslation,
  integrationSettings, secrets, setSecrets,
  selectedProviderInfo, saving, feedback, onSave,
}: Props) {
  return (
    <section className={styles.panel} aria-labelledby="translation-config-heading">
      <div className={styles.panelHead}>
        <h2 id="translation-config-heading" className={styles.panelTitle}>Provider configuration</h2>
        <p className={styles.panelBlurb}>
          Settings for {selectedProviderInfo?.name ?? 'selected provider'}.
          {selectedProviderInfo?.requiresServiceSubscription ? <> <SubscriptionBadge /></> : null}
        </p>
      </div>
      <div className={styles.panelBody}>
        {configProvider && TRANSLATION_SETUP_GUIDES[configProvider] ? (
          <ProviderSetupGuide guide={TRANSLATION_SETUP_GUIDES[configProvider]} />
        ) : null}

        {configProvider === 'deepl' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label="API URL" url={apiUrls.deeplApiUrl} />
            {!integrationSettings?.secretStatuses.deeplAuthKey.configured ? <PaidProviderKeyWarning providerName="DeepL" /> : null}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-deepl-key" label="DeepL Auth Key" status={integrationSettings?.secretStatuses.deeplAuthKey} value={secrets.deeplAuthKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, deeplAuthKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'google' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label="API URL" url={apiUrls.googleTranslateApiUrl} />
            {!integrationSettings?.secretStatuses.googleTranslateApiKey.configured ? <PaidProviderKeyWarning providerName="Google Cloud Translation" /> : null}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-google-key" label="Google Cloud API key" status={integrationSettings?.secretStatuses.googleTranslateApiKey} value={secrets.googleTranslateApiKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, googleTranslateApiKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'microsoft' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label="API URL" url={apiUrls.microsoftTranslatorApiUrl} />
            <p className={styles.muted}>Set <code>AZURE_TRANSLATOR_REGION</code> in deployment env (e.g. <code>eastus</code>) together with the subscription key below.</p>
            {!integrationSettings?.secretStatuses.azureTranslatorKey.configured ? <PaidProviderKeyWarning providerName="Microsoft Translator" /> : null}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-azure-key" label="Azure subscription key" status={integrationSettings?.secretStatuses.azureTranslatorKey} value={secrets.azureTranslatorKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, azureTranslatorKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'reverso' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label="API URL" url={apiUrls.reversoApiUrl} />
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="translation-reverso-target">Context target (ISO)</label>
              <Field id="translation-reverso-target" className={styles.input} placeholder="uk" value={translation.reversoContextTargetLang} onChange={(e) => setTranslation({ ...translation, reversoContextTargetLang: e.target.value.trim() || 'uk' })} />
            </div>
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-reverso-key" label="API key (optional)" status={integrationSettings?.secretStatuses.reversoApiKey} value={secrets.reversoApiKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, reversoApiKey: v }))} />
            </div>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={translation.reversoContextResults} onChange={(e) => setTranslation({ ...translation, reversoContextResults: e.target.checked })} />
              <span>Include contextual example sentences</span>
            </label>
          </div>
        ) : null}

        {configProvider === 'mymemory' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label="MyMemory URL" url={apiUrls.myMemoryUrl} />
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="translation-email">MyMemory email</label>
              <Field id="translation-email" type="email" className={styles.input} placeholder="Raises free quota" value={translation.apiEmail ?? ''} onChange={(e) => setTranslation({ ...translation, apiEmail: e.target.value || null })} />
            </div>
          </div>
        ) : null}

        {configProvider === 'libretranslate' ? (
          <div className={styles.fieldGrid}>
            {apiUrls.libreTranslateUrl ? (
              <TranslationEndpointField label="LibreTranslate URL" url={apiUrls.libreTranslateUrl} />
            ) : (
              <p className={styles.muted}>LibreTranslate URL is not configured on the server. Add <code>LIBRETRANSLATE_URL</code> to deployment env to enable this step in the fallback chain.</p>
            )}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-libre-key" label="LibreTranslate API key" status={integrationSettings?.secretStatuses.libreTranslateApiKey} value={secrets.libreTranslateApiKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, libreTranslateApiKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'gtx' ? (
          <p className={styles.reversoCallout}>Google Translate (GTX) has no configuration fields. It runs automatically as a fallback step when earlier providers in the chain fail.</p>
        ) : null}

        <footer className={styles.panelFooter}>
          <Button type="button" variant="primary" loading={saving} loadingLabel="Saving…" disabled={configProvider === 'gtx' || configProvider === undefined} onClick={onSave}>Save language settings</Button>
          {feedback ? <p className={feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess} role="status">{feedback.text}</p> : null}
        </footer>
      </div>
    </section>
  );
}
