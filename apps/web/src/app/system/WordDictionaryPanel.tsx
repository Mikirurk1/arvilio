'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button, SurfaceCard } from '../../components/ui';
import { graphqlRequest } from '../../lib/graphql-client';
import {
  UPDATE_WORD_DICTIONARY_PROVIDER,
  WORD_DICTIONARY_SETTINGS,
} from '../../graphql/operations';
import type { WordDictionaryProviderId, WordDictionarySettingsDto } from '@soenglish/shared-types';
import { ApiError } from '../../lib/api';
import styles from './page.module.scss';

export function WordDictionaryPanel() {
  const [settings, setSettings] = useState<WordDictionarySettingsDto | null>(null);
  const [selected, setSelected] = useState<WordDictionaryProviderId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<{ wordDictionarySettings: WordDictionarySettingsDto }>(
        WORD_DICTIONARY_SETTINGS,
      );
      setSettings(data.wordDictionarySettings);
      setSelected(data.wordDictionarySettings.activeProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dictionary settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSave = async () => {
    if (!selected || !settings || selected === settings.activeProvider) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await graphqlRequest<{ updateWordDictionaryProvider: WordDictionarySettingsDto }>(
        UPDATE_WORD_DICTIONARY_PROVIDER,
        { input: { provider: selected } },
      );
      setSettings(data.updateWordDictionaryProvider);
      setSelected(data.updateWordDictionaryProvider.activeProvider);
      setSuccess('Dictionary provider updated. New word lookups will use this source.');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Save failed';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const dirty = Boolean(settings && selected && selected !== settings.activeProvider);

  return (
    <SurfaceCard className={styles.card}>
      <header className={styles.panelHeader}>
        <BookOpen size={18} />
        <div>
          <div className={styles.panelTitle}>Word dictionary</div>
          <p className={styles.hint}>
            Source for English definitions when students or staff add words. Applies to new lookups
            and re-enrichment; existing saved words keep their stored data until re-added or
            refreshed.
          </p>
        </div>
      </header>

      {loading ? <p className={styles.muted}>Loading…</p> : null}

      {settings ? (
        <div className={styles.providerList}>
          {settings.providers.map((provider) => {
            const isActive = selected === provider.id;
            const isCurrent = settings.activeProvider === provider.id;
            return (
              <label
                key={provider.id}
                className={`${styles.providerCard} ${isActive ? styles.providerCardActive : ''}`}
              >
                <input
                  type="radio"
                  name="wordDictionaryProvider"
                  className={styles.providerRadio}
                  checked={isActive}
                  onChange={() => setSelected(provider.id)}
                />
                <div className={styles.providerBody}>
                  <div className={styles.providerTitleRow}>
                    <span className={styles.providerName}>{provider.name}</span>
                    {isCurrent ? (
                      <span className={styles.providerBadge}>Active</span>
                    ) : null}
                  </div>
                  <p className={styles.providerDesc}>{provider.description}</p>
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.providerLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Documentation
                  </a>
                </div>
              </label>
            );
          })}
        </div>
      ) : null}

      <div className={styles.actions}>
        <Button
          type="button"
          className={styles.submitBtn}
          disabled={saving || !dirty}
          onClick={() => void onSave()}
        >
          {saving ? 'Saving…' : 'Save provider'}
        </Button>
        <Button type="button" className={styles.verifyBtn} onClick={() => void load()}>
          Refresh
        </Button>
        {error ? <span className={styles.error}>{error}</span> : null}
        {success ? <span className={styles.success}>{success}</span> : null}
      </div>
    </SurfaceCard>
  );
}
