'use client';

import { useCallback, useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { apiClient } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

interface BrandingDto {
  brandColor: string | null;
  logoUrl: string | null;
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function BrandingPanel() {
  const t = useCampusT();
  const [draft, setDraft] = useState<BrandingDto>({ brandColor: null, logoUrl: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void apiClient
      .get<BrandingDto>('/school/branding')
      .then((d) => setDraft(d))
      .finally(() => setLoading(false));
  }, []);

  const colorError =
    draft.brandColor && !HEX_RE.test(draft.brandColor)
      ? t('system.branding.brandColor.error')
      : null;

  const handleSave = useCallback(async () => {
    if (colorError) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await apiClient.patch<BrandingDto>('/school/branding', {
        brandColor: draft.brandColor || null,
        logoUrl: draft.logoUrl || null,
      });
      setDraft(updated);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2000);

      // Apply immediately without page reload
      const root = document.documentElement;
      if (updated.brandColor) {
        root.style.setProperty('--accent-primary', updated.brandColor);
      } else {
        root.style.removeProperty('--accent-primary');
      }
    } catch {
      setError(t('system.branding.error.save'));
    } finally {
      setSaving(false);
    }
  }, [draft, colorError, t]);

  return (
    <SurfaceCard className={styles.card}>
      <header className={styles.panelHeader}>
        <Palette size={18} aria-hidden />
        <div>
          <div className={styles.panelTitle}>{t('system.branding.title')}</div>
          <p className={styles.hint}>{t('system.branding.hint')}</p>
        </div>
      </header>

      {loading ? (
        <p className={styles.hint}>{t('common.loading')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
          <Field
            label={t('system.branding.brandColor.label')}
            hint={t('system.branding.brandColor.hint')}
            error={colorError ?? undefined}
            placeholder="#159970"
            value={draft.brandColor ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, brandColor: (e.target as HTMLInputElement).value || null }))}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: draft.brandColor && !colorError ? draft.brandColor : 'var(--border)',
                border: '1px solid var(--border)',
                flexShrink: 0,
              }}
              aria-hidden
            />
            <span className={styles.hint} style={{ fontSize: 12 }}>
              {draft.brandColor && !colorError
                ? t('system.branding.preview')
                : t('system.branding.previewEmpty')}
            </span>
          </div>

          <Field
            label={t('system.branding.logoUrl.label')}
            hint={t('system.branding.logoUrl.hint')}
            placeholder="https://example.com/logo.png"
            value={draft.logoUrl ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, logoUrl: (e.target as HTMLInputElement).value || null }))}
          />

          <div className={styles.generalStatusSlot} aria-live="polite">
            {error ? <p className={styles.actionStatusError}>{error}</p> : null}
            {success ? <p className={styles.actionStatusSuccess}>{t('common.saved')}</p> : null}
          </div>

          <Button
            loading={saving}
            loadingLabel={t('common.saving')}
            disabled={saving || !!colorError}
            onClick={() => void handleSave()}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('system.branding.save')}
          </Button>
        </div>
      )}
    </SurfaceCard>
  );
}
