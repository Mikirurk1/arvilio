'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { TranslationApiUrlsDto, TranslationSettingsDto } from '@pkg/types';
import { useCampusT } from '../../../lib/cms';
import styles from '../WordDictionaryPanel.module.scss';

export function SubscriptionBadge() {
  const t = useCampusT();
  return <span className={styles.providerBadgeSubscription}>{t('system.dictionary.badge.subscription')}</span>;
}

export function PaidProviderKeyWarning({ providerName }: { providerName: string }) {
  const t = useCampusT();
  return (
    <p className={styles.reversoCallout} role="status">
      {t('system.dictionary.paidProviderWarning', { providerName })}
    </p>
  );
}

export function TranslationEndpointField({ label, url }: { label: string; url: string }) {
  return (
    <div className={styles.fieldGroup}>
      <span className={styles.label}>{label}</span>
      <Link href={url} target="_blank" rel="noopener noreferrer" className={styles.endpointLink}>
        {url}
        <ExternalLink size={12} aria-hidden />
      </Link>
    </div>
  );
}

export function normalizeTranslationSettings(
  raw: TranslationSettingsDto & { apiUrls?: TranslationApiUrlsDto | null },
): TranslationSettingsDto {
  return {
    activeProvider: raw.activeProvider,
    providers: raw.providers,
    apiUrls: raw.apiUrls ?? {
      deeplApiUrl: '',
      googleTranslateApiUrl: '',
      microsoftTranslatorApiUrl: '',
      myMemoryUrl: '',
      reversoApiUrl: '',
      libreTranslateUrl: null,
    },
  };
}
