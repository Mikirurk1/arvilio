'use client';

import { useCallback, useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { apiClient, ApiError } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

type LessonFormat = 'online' | 'in-person' | 'hybrid';

interface TeachingPrefsDto {
  languages: string[];
  lessonFormat: LessonFormat;
}

const FORMAT_KEYS: Record<LessonFormat, string> = {
  online: 'onboarding.teaching.format.online',
  'in-person': 'onboarding.teaching.format.inPerson',
  hybrid: 'onboarding.teaching.format.hybrid',
};

/** School teaching preferences from wizard — editable under System → General. */
export function TeachingPrefsSection() {
  const t = useCampusT();
  const [draft, setDraft] = useState<TeachingPrefsDto>({
    languages: [],
    lessonFormat: 'online',
  });
  const [languagesText, setLanguagesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void apiClient
      .get<TeachingPrefsDto>('/school/teaching-prefs')
      .then((d) => {
        setDraft(d);
        setLanguagesText(d.languages.join(', '));
      })
      .catch(() => setError(t('system.general.teaching.loadFailed')))
      .finally(() => setLoading(false));
  }, [t]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const languages = languagesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    try {
      const updated = await apiClient.patch<TeachingPrefsDto>('/school/teaching-prefs', {
        languages,
        lessonFormat: draft.lessonFormat,
      });
      setDraft(updated);
      setLanguagesText(updated.languages.join(', '));
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [draft.lessonFormat, languagesText, t]);

  return (
    <section className={styles.generalSection} aria-label={t('system.general.teaching.title')}>
      <header className={styles.panelHeader} style={{ marginBottom: 12 }}>
        <GraduationCap size={18} aria-hidden />
        <div>
          <div className={styles.panelTitle}>{t('system.general.teaching.title')}</div>
          <p className={styles.hint}>{t('system.general.teaching.hint')}</p>
        </div>
      </header>

      {loading ? (
        <p className={styles.hint}>{t('common.loading')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
          <Field
            id="sys-teaching-langs"
            label={t('onboarding.teaching.languages')}
            hint={t('onboarding.teaching.languagesHint')}
            value={languagesText}
            onChange={(e) => setLanguagesText((e.target as HTMLInputElement).value)}
          />
          <Field
            id="sys-teaching-format"
            as="select"
            label={t('onboarding.teaching.format')}
            value={draft.lessonFormat}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                lessonFormat: (e.target as HTMLSelectElement).value as LessonFormat,
              }))
            }
          >
            {(Object.keys(FORMAT_KEYS) as LessonFormat[]).map((key) => (
              <option key={key} value={key}>
                {t(FORMAT_KEYS[key])}
              </option>
            ))}
          </Field>

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
            {t('system.general.teaching.save')}
          </Button>
        </div>
      )}
    </section>
  );
}
