'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui';
import type { TranslationProviderId, TranslationSettingsDto } from '@pkg/types';
import { useCampusT } from '../../../lib/cms';
import { SubscriptionBadge } from './word-dictionary-ui';
import styles from '../WordDictionaryPanel.module.scss';

interface Props {
  translationSettings: TranslationSettingsDto;
  selectedProvider: TranslationProviderId | null;
  setSelectedProvider: (id: TranslationProviderId) => void;
  saving: boolean;
  dirty: boolean;
  feedback: { type: 'error' | 'success'; text: string } | null;
  onSave: () => void;
}

export function TranslationSourceSection({ translationSettings, selectedProvider, setSelectedProvider, saving, dirty, feedback, onSave }: Props) {
  const t = useCampusT();

  return (
    <section className={styles.panel} aria-labelledby="translation-source-heading">
      <div className={styles.panelHead}>
        <h2 id="translation-source-heading" className={styles.panelTitle}>{t('system.dictionary.source.translation.title')}</h2>
        <p className={styles.panelBlurb}>{t('system.dictionary.source.translation.blurb')}</p>
      </div>
      <div className={styles.panelBody}>
        <div className={styles.providerList}>
          {translationSettings.providers.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const isActive = translationSettings.activeProvider === provider.id;
            return (
              <label key={provider.id} className={styles.providerCard}>
                <input type="radio" name="translationProvider" className={styles.providerRadio} checked={isSelected} onChange={() => setSelectedProvider(provider.id)} />
                <div className={styles.providerBody}>
                  <div className={styles.providerTitleRow}>
                    <span className={styles.providerName}>{provider.name}</span>
                    {isActive ? <span className={styles.providerBadge}>{t('system.dictionary.badge.active')}</span> : null}
                    {provider.requiresServiceSubscription ? <SubscriptionBadge /> : null}
                  </div>
                  <p className={styles.providerDesc}>{provider.description}</p>
                  <Link href={provider.docsUrl} target="_blank" rel="noopener noreferrer" className={styles.providerLink} onClick={(e) => e.stopPropagation()}>
                    {t('system.dictionary.link.documentation')}<ExternalLink size={12} aria-hidden />
                  </Link>
                </div>
              </label>
            );
          })}
        </div>
        <footer className={styles.panelFooter}>
          <Button type="button" variant="primary" loading={saving} loadingLabel={t('system.dictionary.saving')} disabled={!dirty} onClick={onSave}>{t('system.dictionary.source.translation.save')}</Button>
          {feedback ? <p className={feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess} role="status">{feedback.text}</p> : null}
        </footer>
      </div>
    </section>
  );
}
