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
import { useCampusT } from '../../../lib/cms';
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
  const t = useCampusT();

  return (
    <section className={styles.panel} aria-labelledby="translation-config-heading">
      <div className={styles.panelHead}>
        <h2 id="translation-config-heading" className={styles.panelTitle}>{t('system.dictionary.config.title')}</h2>
        <p className={styles.panelBlurb}>
          {t('system.dictionary.config.blurb', {
            providerName: selectedProviderInfo?.name ?? t('system.dictionary.config.selectedProvider'),
          })}
          {selectedProviderInfo?.requiresServiceSubscription ? <> <SubscriptionBadge /></> : null}
        </p>
      </div>
      <div className={styles.panelBody}>
        {configProvider && TRANSLATION_SETUP_GUIDES[configProvider] ? (
          <ProviderSetupGuide guide={TRANSLATION_SETUP_GUIDES[configProvider]} />
        ) : null}

        {configProvider === 'deepl' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label={t('system.dictionary.field.apiUrl')} url={apiUrls.deeplApiUrl} />
            {!integrationSettings?.secretStatuses.deeplAuthKey.configured ? <PaidProviderKeyWarning providerName="DeepL" /> : null}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-deepl-key" label={t('system.dictionary.field.deeplAuthKey')} status={integrationSettings?.secretStatuses.deeplAuthKey} value={secrets.deeplAuthKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, deeplAuthKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'google' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label={t('system.dictionary.field.apiUrl')} url={apiUrls.googleTranslateApiUrl} />
            {!integrationSettings?.secretStatuses.googleTranslateApiKey.configured ? <PaidProviderKeyWarning providerName="Google Cloud Translation" /> : null}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-google-key" label={t('system.dictionary.field.googleApiKey')} status={integrationSettings?.secretStatuses.googleTranslateApiKey} value={secrets.googleTranslateApiKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, googleTranslateApiKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'microsoft' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label={t('system.dictionary.field.apiUrl')} url={apiUrls.microsoftTranslatorApiUrl} />
            <p className={styles.muted}>{t('system.dictionary.microsoft.envHint')}</p>
            {!integrationSettings?.secretStatuses.azureTranslatorKey.configured ? <PaidProviderKeyWarning providerName="Microsoft Translator" /> : null}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-azure-key" label={t('system.dictionary.field.azureKey')} status={integrationSettings?.secretStatuses.azureTranslatorKey} value={secrets.azureTranslatorKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, azureTranslatorKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'reverso' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label={t('system.dictionary.field.apiUrl')} url={apiUrls.reversoApiUrl} />
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="translation-reverso-target">{t('system.dictionary.field.reversoTarget')}</label>
              <Field id="translation-reverso-target" className={styles.input} placeholder="uk" value={translation.reversoContextTargetLang} onChange={(e) => setTranslation({ ...translation, reversoContextTargetLang: e.target.value.trim() || 'uk' })} />
            </div>
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-reverso-key" label={t('system.dictionary.field.reversoKey')} status={integrationSettings?.secretStatuses.reversoApiKey} value={secrets.reversoApiKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, reversoApiKey: v }))} />
            </div>
            <Field
              as="checkbox"
              checked={translation.reversoContextResults}
              onChange={(e) =>
                setTranslation({ ...translation, reversoContextResults: e.target.checked })
              }
              label={t('system.dictionary.field.reversoContext')}
              rootClassName={styles.checkboxRow}
            />
          </div>
        ) : null}

        {configProvider === 'mymemory' ? (
          <div className={styles.fieldGrid}>
            <TranslationEndpointField label={t('system.dictionary.field.myMemoryUrl')} url={apiUrls.myMemoryUrl} />
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="translation-email">{t('system.dictionary.field.myMemoryEmail')}</label>
              <Field id="translation-email" type="email" className={styles.input} placeholder={t('system.dictionary.field.myMemoryEmailPlaceholder')} value={translation.apiEmail ?? ''} onChange={(e) => setTranslation({ ...translation, apiEmail: e.target.value || null })} />
            </div>
          </div>
        ) : null}

        {configProvider === 'libretranslate' ? (
          <div className={styles.fieldGrid}>
            {apiUrls.libreTranslateUrl ? (
              <TranslationEndpointField label={t('system.dictionary.field.libreTranslateUrl')} url={apiUrls.libreTranslateUrl} />
            ) : (
              <p className={styles.muted}>{t('system.dictionary.libretranslate.notConfigured')}</p>
            )}
            <div className={styles.fieldGroupWide}>
              <IntegrationSecretField id="translation-libre-key" label={t('system.dictionary.field.libreTranslateKey')} status={integrationSettings?.secretStatuses.libreTranslateApiKey} value={secrets.libreTranslateApiKey ?? ''} onChange={(v) => setSecrets((s) => ({ ...s, libreTranslateApiKey: v }))} />
            </div>
          </div>
        ) : null}

        {configProvider === 'gtx' ? (
          <p className={styles.reversoCallout}>{t('system.dictionary.gtx.noConfig')}</p>
        ) : null}

        <footer className={styles.panelFooter}>
          <Button type="button" variant="primary" loading={saving} loadingLabel={t('system.dictionary.saving')} disabled={configProvider === 'gtx' || configProvider === undefined} onClick={onSave}>{t('system.dictionary.saveLanguageSettings')}</Button>
          {feedback ? <p className={feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess} role="status">{feedback.text}</p> : null}
        </footer>
      </div>
    </section>
  );
}
