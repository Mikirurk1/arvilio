'use client';

import { useCallback, useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import {
  getLocaleMeta,
  resolveSchoolDefaultLocale,
  sanitizeEnabledLocales,
  SUPPORTED_LOCALES,
  type Locale,
} from '@pkg/types';
import { Badge, Button, Field, SettingsToggleRow } from '../../components/ui';
import { apiClient, ApiError } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

interface SchoolLocaleDto {
  defaultLocale: Locale;
  enabledLocales: Locale[];
}

/** G33 — school-wide UI locale settings: default locale + offered set. Admin-only. */
export function LanguagesSection() {
  const t = useCampusT();
  const [draft, setDraft] = useState<SchoolLocaleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void apiClient
      .get<SchoolLocaleDto>('/school/locale')
      .then((d) =>
        setDraft({
          enabledLocales: sanitizeEnabledLocales(d.enabledLocales),
          defaultLocale: resolveSchoolDefaultLocale(d.defaultLocale, d.enabledLocales),
        }),
      )
      .catch(() => setError(t('system.general.languages.loadFailed')))
      .finally(() => setLoading(false));
  }, [t]);

  const toggleLocale = (code: Locale, enabled: boolean) => {
    setDraft((current) => {
      if (!current) return current;
      const next = enabled
        ? [...new Set([...current.enabledLocales, code])]
        : current.enabledLocales.filter((c) => c !== code);
      const enabledLocales = sanitizeEnabledLocales(next);
      return {
        enabledLocales,
        defaultLocale: resolveSchoolDefaultLocale(current.defaultLocale, enabledLocales),
      };
    });
    setSuccess(false);
  };

  const setDefault = (code: Locale) => {
    setDraft((current) => (current ? { ...current, defaultLocale: code } : current));
    setSuccess(false);
  };

  const handleSave = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await apiClient.patch<SchoolLocaleDto>('/school/locale', {
        defaultLocale: draft.defaultLocale,
        enabledLocales: draft.enabledLocales,
      });
      setDraft({
        enabledLocales: sanitizeEnabledLocales(updated.enabledLocales),
        defaultLocale: resolveSchoolDefaultLocale(updated.defaultLocale, updated.enabledLocales),
      });
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [draft, t]);

  return (
    <section className={styles.generalSection} aria-label={t('system.general.languages.title')}>
      <header className={styles.panelHeader}>
        <Languages size={18} aria-hidden />
        <div>
          <div className={styles.panelTitle}>{t('system.general.languages.title')}</div>
          <p className={styles.hint}>{t('system.general.languages.hint')}</p>
        </div>
      </header>

      {loading ? <p className={styles.hint}>{t('common.loading')}</p> : null}

      {draft ? (
        <>
          <h3 className={styles.sectionTitle}>{t('system.general.languages.enabledLabel')}</h3>
          {SUPPORTED_LOCALES.map((code) => {
            const enabled = draft.enabledLocales.includes(code);
            const lastEnabled = enabled && draft.enabledLocales.length === 1;
            return (
              <SettingsToggleRow
                key={code}
                className={styles.generalToggleRow}
                infoClassName={styles.generalToggleInfo}
                labelClassName={styles.generalToggleLabel}
                toggleClassName={styles.generalSwitch}
                toggleOnClassName={styles.generalSwitchOn}
                thumbClassName={styles.generalSwitchThumb}
                label={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {getLocaleMeta(code).nativeName}
                    {code === draft.defaultLocale ? (
                      <Badge variant="green">{t('system.general.languages.defaultBadge')}</Badge>
                    ) : null}
                  </span>
                }
                aria-label={getLocaleMeta(code).englishName}
                checked={enabled}
                disabled={saving || lastEnabled}
                onChange={(value) => toggleLocale(code, value)}
              />
            );
          })}

          <div className={styles.fieldGroup} style={{ marginTop: 16 }}>
            <span className={styles.label}>{t('system.general.languages.defaultLabel')}</span>
            <Field
              as="select"
              className={styles.select}
              value={draft.defaultLocale}
              disabled={saving}
              onChange={(event) => setDefault(event.target.value as Locale)}
            >
              {draft.enabledLocales.map((code) => (
                <option key={code} value={code}>
                  {getLocaleMeta(code).nativeName}
                </option>
              ))}
            </Field>
            <p className={styles.hint}>{t('system.general.languages.defaultHint')}</p>
          </div>

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
            {t('system.general.languages.save')}
          </Button>
        </>
      ) : null}
    </section>
  );
}
