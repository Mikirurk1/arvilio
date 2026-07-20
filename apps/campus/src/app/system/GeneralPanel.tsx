'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings2, Users } from 'lucide-react';
import { Badge, SurfaceCard, SettingsToggleRow } from '../../components/ui';
import { useBillingStore } from '../../stores/billing-store';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import {
  type PaymentConfigDto,
  type PaymentSettingsDto,
} from '@pkg/types';
import { syncGroupLessonsEnabled } from '../../lib/group-lessons-feature';
import { ApiError } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import { VideoMeetingsPanel } from './VideoMeetingsPanel';
import { LanguagesSection } from './LanguagesSection';
import { TeachingPrefsSection } from './TeachingPrefsSection';
import styles from './page.module.scss';

export function GeneralPanel({
  onOpenConnections,
}: {
  onOpenConnections?: () => void;
} = {}) {
  const t = useCampusT();
  const fetchPaymentSettings = useBillingStore((s) => s.fetchPaymentSettings);
  const updatePaymentSettings = useBillingStore((s) => s.updatePaymentSettings);
  const slice = useBillingStore((s) => s.paymentSettings);
  const { refresh: refreshGroupLessonsFlag } = useSchoolGroupLessons();

  const [draft, setDraft] = useState<PaymentSettingsDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void fetchPaymentSettings();
  }, [fetchPaymentSettings]);

  useEffect(() => {
    if (slice.status === 'success' && slice.data) {
      setDraft(slice.data);
    }
  }, [slice.status, slice.data]);

  const loading =
    (slice.status === 'loading' || slice.status === 'idle') && !slice.data;
  const groupEnabled = draft?.config.groupLessons?.enabled ?? false;

  const persistDraft = useCallback(
    async (next: PaymentSettingsDto) => {
      setSaving(true);
      setError(null);
      setSuccess(null);
      try {
        await updatePaymentSettings({
          enabledMethods: next.enabledMethods,
          config: next.config as PaymentConfigDto,
        });
        setDraft(next);
        setSuccess(t('common.saved'));
        void refreshGroupLessonsFlag();
        window.setTimeout(() => setSuccess(null), 2000);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t('common.saveFailed'));
        void fetchPaymentSettings(true);
      } finally {
        setSaving(false);
      }
    },
    [refreshGroupLessonsFlag, t, updatePaymentSettings],
  );

  const handleGroupLessonsChange = (enabled: boolean) => {
    if (!draft || saving) return;
    const next = syncGroupLessonsEnabled(draft, enabled);
    setDraft(next);
    void persistDraft(next);
  };

  return (
    <SurfaceCard className={styles.card}>
      <header className={styles.panelHeader}>
        <Settings2 size={18} aria-hidden />
        <div>
          <div className={styles.panelTitle}>{t('system.general.title')}</div>
          <p className={styles.hint}>{t('system.general.hint')}</p>
        </div>
      </header>

      {loading ? <p className={styles.hint}>{t('common.loading')}</p> : null}

      {draft ? (
        <>
          <section className={styles.generalSection} aria-label={t('system.general.features.aria')}>
            <h3 className={styles.sectionTitle}>{t('system.general.features.title')}</h3>
            <article className={styles.generalFeatureCard}>
              <div className={styles.generalFeatureHead}>
                <span className={styles.generalFeatureIcon} aria-hidden>
                  <Users size={16} />
                </span>
                <div>
                  <div className={styles.generalFeatureTitle}>{t('system.general.groupLessons.title')}</div>
                  <p className={styles.hint}>{t('system.general.groupLessons.hint')}</p>
                </div>
                {groupEnabled ? (
                  <Badge variant="green">{t('common.on')}</Badge>
                ) : (
                  <Badge variant="amber">{t('common.off')}</Badge>
                )}
              </div>
              <SettingsToggleRow
                className={styles.generalToggleRow}
                infoClassName={styles.generalToggleInfo}
                labelClassName={styles.generalToggleLabel}
                toggleClassName={styles.generalSwitch}
                toggleOnClassName={styles.generalSwitchOn}
                thumbClassName={styles.generalSwitchThumb}
                label={t('system.general.groupLessons.toggle')}
                checked={groupEnabled}
                disabled={saving}
                onChange={handleGroupLessonsChange}
              />
            </article>
          </section>

          <div className={styles.generalStatusSlot} aria-live="polite">
            {error ? <p className={styles.actionStatusError}>{error}</p> : null}
            {success ? <p className={styles.actionStatusSuccess}>{success}</p> : null}
          </div>
        </>
      ) : null}

      <section style={{ marginTop: 24 }}>
        <LanguagesSection />
      </section>

      <section style={{ marginTop: 24 }}>
        <TeachingPrefsSection />
      </section>

      <section
        className={styles.generalSection}
        aria-label={t('system.general.videoMeetings.title')}
        style={{ marginTop: 24 }}
      >
        <VideoMeetingsPanel onOpenConnections={onOpenConnections} />
      </section>
    </SurfaceCard>
  );
}
