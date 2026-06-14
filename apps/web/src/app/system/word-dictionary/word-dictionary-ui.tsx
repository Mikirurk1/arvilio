import { ExternalLink } from 'lucide-react';
import type { TranslationApiUrlsDto, TranslationSettingsDto } from '@pkg/types';
import styles from '../WordDictionaryPanel.module.scss';

export function SubscriptionBadge() {
  return <span className={styles.providerBadgeSubscription}>Requires a paid service subscription</span>;
}

export function PaidProviderKeyWarning({ providerName }: { providerName: string }) {
  return (
    <p className={styles.reversoCallout} role="status">
      {providerName} is not configured (missing API key on the server). This step will be skipped in
      the fallback chain until you save a key or set the env variable.
    </p>
  );
}

export function TranslationEndpointField({ label, url }: { label: string; url: string }) {
  return (
    <div className={styles.fieldGroup}>
      <span className={styles.label}>{label}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.endpointLink}>
        {url}
        <ExternalLink size={12} aria-hidden />
      </a>
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
