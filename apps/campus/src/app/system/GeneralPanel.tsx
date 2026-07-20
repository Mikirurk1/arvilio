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
import { VideoMeetingsPanel } from './VideoMeetingsPanel';
import styles from './page.module.scss';

export function GeneralPanel({
  onOpenConnections,
}: {
  onOpenConnections?: () => void;
} = {}) {
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
        setSuccess('Saved.');
        void refreshGroupLessonsFlag();
        window.setTimeout(() => setSuccess(null), 2000);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to save settings');
        void fetchPaymentSettings(true);
      } finally {
        setSaving(false);
      }
    },
    [refreshGroupLessonsFlag, updatePaymentSettings],
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
          <div className={styles.panelTitle}>General</div>
          <p className={styles.hint}>
            School-wide product settings. More sections will be grouped here as the control room
            grows.
          </p>
        </div>
      </header>

      {loading ? <p className={styles.hint}>Loading…</p> : null}

      {draft ? (
        <>
          <section className={styles.generalSection} aria-label="Features">
            <h3 className={styles.sectionTitle}>Features</h3>
            <article className={styles.generalFeatureCard}>
              <div className={styles.generalFeatureHead}>
                <span className={styles.generalFeatureIcon} aria-hidden>
                  <Users size={16} />
                </span>
                <div>
                  <div className={styles.generalFeatureTitle}>Group lessons</div>
                  <p className={styles.hint}>
                    Turns on learning groups, group scheduling, and group billing UI for teachers and
                    admins. Default group payment rules live under Payments → Group payments.
                  </p>
                </div>
                {groupEnabled ? <Badge variant="green">On</Badge> : <Badge variant="amber">Off</Badge>}
              </div>
              <SettingsToggleRow
                className={styles.generalToggleRow}
                infoClassName={styles.generalToggleInfo}
                labelClassName={styles.generalToggleLabel}
                toggleClassName={styles.generalSwitch}
                toggleOnClassName={styles.generalSwitchOn}
                thumbClassName={styles.generalSwitchThumb}
                label="Enable group lessons for this school"
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

      <section
        className={styles.generalSection}
        aria-label="Video meetings"
        style={{ marginTop: 24 }}
      >
        <VideoMeetingsPanel onOpenConnections={onOpenConnections} />
      </section>
    </SurfaceCard>
  );
}
