'use client';

import { useCallback, useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { apiClient } from '../../lib/api';
import styles from './page.module.scss';

interface BrandingDto {
  brandColor: string | null;
  logoUrl: string | null;
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function BrandingPanel() {
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
      ? 'Must be a hex color like #159970 or #1a9'
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
      setError('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  }, [draft, colorError]);

  return (
    <SurfaceCard className={styles.card}>
      <header className={styles.panelHeader}>
        <Palette size={18} aria-hidden />
        <div>
          <div className={styles.panelTitle}>Branding</div>
          <p className={styles.hint}>
            Override the accent color and logo for this school. Leave blank to use platform defaults.
          </p>
        </div>
      </header>

      {loading ? (
        <p className={styles.hint}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
          <Field
            label="Brand color"
            hint="Hex value, e.g. #159970. Controls buttons, links, and highlights."
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
              {draft.brandColor && !colorError ? 'Preview' : 'Enter a valid hex color to preview'}
            </span>
          </div>

          <Field
            label="Logo URL"
            hint="Absolute URL to a PNG/SVG logo (recommended: 200×48 px)."
            placeholder="https://example.com/logo.png"
            value={draft.logoUrl ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, logoUrl: (e.target as HTMLInputElement).value || null }))}
          />

          <div className={styles.generalStatusSlot} aria-live="polite">
            {error ? <p className={styles.actionStatusError}>{error}</p> : null}
            {success ? <p className={styles.actionStatusSuccess}>Saved.</p> : null}
          </div>

          <Button
            loading={saving}
            loadingLabel="Saving…"
            disabled={saving || !!colorError}
            onClick={() => void handleSave()}
            style={{ alignSelf: 'flex-start' }}
          >
            Save branding
          </Button>
        </div>
      )}
    </SurfaceCard>
  );
}
