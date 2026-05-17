'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../components/ui';
import { UPDATE_STUDENT_LANGUAGES } from '../../graphql/operations';
import { graphqlRequest } from '../../lib/graphql-client';
import { selectLanguagesList, useLanguagesStore } from '../../stores/languages-store';
import styles from './student-learning-languages.module.scss';

type Props = {
  studentId: string;
  initialNativeLanguageId: string | null;
  initialLearningLanguageIds: string[];
};

export function StudentLearningLanguagesField({
  studentId,
  initialNativeLanguageId,
  initialLearningLanguageIds,
}: Props) {
  const languages = useLanguagesStore(selectLanguagesList);
  const fetchLanguages = useLanguagesStore((s) => s.fetchLanguages);
  const [nativeLanguageId, setNativeLanguageId] = useState(initialNativeLanguageId ?? '');
  const [learningLanguageIds, setLearningLanguageIds] = useState<string[]>(
    initialLearningLanguageIds,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    setNativeLanguageId(initialNativeLanguageId ?? '');
    setLearningLanguageIds(initialLearningLanguageIds);
  }, [initialNativeLanguageId, initialLearningLanguageIds]);

  const toggleLearning = (languageId: string) => {
    setLearningLanguageIds((prev) =>
      prev.includes(languageId) ? prev.filter((id) => id !== languageId) : [...prev, languageId],
    );
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await graphqlRequest(UPDATE_STUDENT_LANGUAGES, {
        studentId,
        input: {
          nativeLanguageId: nativeLanguageId || null,
          learningLanguageIds,
        },
      });
      setMessage('Languages saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>
        Learning languages are managed by admins only. Students and teachers cannot see or edit
        this field.
      </p>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Native language</label>
        <select
          className={styles.select}
          value={nativeLanguageId}
          onChange={(e) => setNativeLanguageId(e.target.value)}
        >
          <option value="">—</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.fieldGroup}>
        <span className={styles.label}>Languages learning</span>
        <div className={styles.chips}>
          {languages.map((lang) => {
            const active = learningLanguageIds.includes(lang.id);
            return (
              <button
                key={lang.id}
                type="button"
                className={active ? styles.chipActive : styles.chip}
                onClick={() => toggleLearning(lang.id)}
              >
                {lang.name}
              </button>
            );
          })}
        </div>
      </div>
      <Button type="button" disabled={saving} onClick={() => void onSave()}>
        {saving ? 'Saving…' : 'Save languages'}
      </Button>
      {message ? <p className={styles.message}>{message}</p> : null}
    </div>
  );
}
