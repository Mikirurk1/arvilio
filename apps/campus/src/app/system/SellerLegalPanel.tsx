'use client';

import { useCallback, useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { apiClient } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import type { PublicSellerProfile } from '../../lib/seller-profile';
import styles from './page.module.scss';

type SellerProfileDto = PublicSellerProfile;

const emptyDraft: SellerProfileDto = {
  schoolName: '',
  legalName: null,
  legalAddress: null,
  legalCountry: 'UA',
  supportEmail: null,
  supportPhone: null,
  mcc: '8299',
  termsOverrideMd: null,
  paymentRefundOverrideMd: null,
  isComplete: false,
};

export function SellerLegalPanel() {
  const t = useCampusT();
  const [draft, setDraft] = useState<SellerProfileDto>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void apiClient
      .get<SellerProfileDto>('/school/seller-profile')
      .then((d) => setDraft(d))
      .catch(() => setError(t('system.seller.error.load')))
      .finally(() => setLoading(false));
  }, [t]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await apiClient.patch<SellerProfileDto>('/school/seller-profile', {
        legalName: draft.legalName || null,
        legalAddress: draft.legalAddress || null,
        legalCountry: draft.legalCountry || 'UA',
        supportEmail: draft.supportEmail || null,
        supportPhone: draft.supportPhone || null,
        mcc: draft.mcc || '8299',
        termsOverrideMd: draft.termsOverrideMd || null,
        paymentRefundOverrideMd: draft.paymentRefundOverrideMd || null,
      });
      setDraft(updated);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [draft, t]);

  return (
    <SurfaceCard className={styles.card}>
      <header className={styles.panelHeader}>
        <Scale size={18} aria-hidden />
        <div>
          <div className={styles.panelTitle}>{t('system.seller.title')}</div>
          <p className={styles.hint}>{t('system.seller.hint')}</p>
        </div>
      </header>

      {loading ? (
        <p className={styles.hint}>{t('common.loading')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
          {!draft.isComplete ? (
            <p className={styles.actionStatusError} role="status">
              {t('system.seller.incomplete')}
            </p>
          ) : (
            <p className={styles.actionStatusSuccess} role="status">
              {t('system.seller.complete')}
            </p>
          )}

          <Field
            label={t('system.seller.legalName.label')}
            hint={t('system.seller.legalName.hint')}
            placeholder="Acme Language School LLC"
            value={draft.legalName ?? ''}
            onChange={(e) =>
              setDraft((d) => ({ ...d, legalName: (e.target as HTMLInputElement).value || null }))
            }
          />
          <Field
            label={t('system.seller.legalAddress.label')}
            hint={t('system.seller.legalAddress.hint')}
            placeholder="1 Example St, Kyiv, Ukraine"
            value={draft.legalAddress ?? ''}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                legalAddress: (e.target as HTMLInputElement).value || null,
              }))
            }
          />
          <Field
            label={t('system.seller.country.label')}
            hint={t('system.seller.country.hint')}
            placeholder="UA"
            value={draft.legalCountry ?? 'UA'}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                legalCountry: (e.target as HTMLInputElement).value.toUpperCase() || null,
              }))
            }
          />
          <Field
            label={t('system.seller.supportEmail.label')}
            hint={t('system.seller.supportEmail.hint')}
            type="email"
            placeholder="support@school.example"
            value={draft.supportEmail ?? ''}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                supportEmail: (e.target as HTMLInputElement).value || null,
              }))
            }
          />
          <Field
            label={t('system.seller.supportPhone.label')}
            hint={t('system.seller.supportPhone.hint')}
            placeholder="+380…"
            value={draft.supportPhone ?? ''}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                supportPhone: (e.target as HTMLInputElement).value || null,
              }))
            }
          />
          <Field
            label={t('system.seller.mcc.label')}
            hint={t('system.seller.mcc.hint')}
            placeholder="8299"
            value={draft.mcc ?? '8299'}
            onChange={(e) =>
              setDraft((d) => ({ ...d, mcc: (e.target as HTMLInputElement).value || null }))
            }
          />

          <Field
            as="textarea"
            label={t('system.seller.termsOverride.label')}
            hint={t('system.seller.termsOverride.hint')}
            rows={6}
            value={draft.termsOverrideMd ?? ''}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                termsOverrideMd: (e.target as HTMLTextAreaElement).value || null,
              }))
            }
          />
          <Field
            as="textarea"
            label={t('system.seller.paymentRefundOverride.label')}
            hint={t('system.seller.paymentRefundOverride.hint')}
            rows={6}
            value={draft.paymentRefundOverrideMd ?? ''}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                paymentRefundOverrideMd: (e.target as HTMLTextAreaElement).value || null,
              }))
            }
          />

          <div className={styles.generalStatusSlot} aria-live="polite">
            {error ? <p className={styles.actionStatusError}>{error}</p> : null}
            {success ? <p className={styles.actionStatusSuccess}>{t('common.saved')}</p> : null}
          </div>

          <Button
            loading={saving}
            loadingLabel={t('common.saving')}
            disabled={saving}
            onClick={() => void handleSave()}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('system.seller.save')}
          </Button>
        </div>
      )}
    </SurfaceCard>
  );
}
