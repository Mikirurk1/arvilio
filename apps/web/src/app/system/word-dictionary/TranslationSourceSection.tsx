'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui';
import type { TranslationProviderId, TranslationSettingsDto } from '@pkg/types';
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
  return (
    <section className={styles.panel} aria-labelledby="translation-source-heading">
      <div className={styles.panelHead}>
        <h2 id="translation-source-heading" className={styles.panelTitle}>Translation source</h2>
        <p className={styles.panelBlurb}>Primary translation provider; others follow in fixed fallback order when a request fails.</p>
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
                    {isActive ? <span className={styles.providerBadge}>Active</span> : null}
                    {provider.requiresServiceSubscription ? <SubscriptionBadge /> : null}
                  </div>
                  <p className={styles.providerDesc}>{provider.description}</p>
                  <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer" className={styles.providerLink} onClick={(e) => e.stopPropagation()}>
                    Documentation<ExternalLink size={12} aria-hidden />
                  </a>
                </div>
              </label>
            );
          })}
        </div>
        <footer className={styles.panelFooter}>
          <Button type="button" variant="primary" loading={saving} loadingLabel="Saving…" disabled={!dirty} onClick={onSave}>Save translation provider</Button>
          {feedback ? <p className={feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess} role="status">{feedback.text}</p> : null}
        </footer>
      </div>
    </section>
  );
}
