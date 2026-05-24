'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WordCardDto } from '@pkg/types';
import { Plus } from 'lucide-react';
import { WordCardAudioButton } from './WordCardAudioButton';
import { Button, Field } from '../../components/ui';
import { useViewerLanguageIds } from '../../hooks/use-viewer-language-ids';
import { pickWordDefinition } from '../../lib/word-definitions';
import {
  validateEnglishWordInput,
  VOCABULARY_WORD_NOT_FOUND,
} from '../../lib/vocabulary-word-input';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import vocabPageStyles from '../../app/vocabulary/page.module.scss';
import styles from './lesson-vocab-add.module.scss';

type Props = {
  linkedWordIds: string[];
  onAddWordId: (wordId: string) => void;
  studentBackendId: string | null;
  lessonBackendId: string | null;
  disabled?: boolean;
};

export function LessonVocabularyAddPanel({
  linkedWordIds,
  onAddWordId,
  studentBackendId,
  lessonBackendId,
  disabled = false,
}: Props) {
  const lookupWord = useVocabularyStore((s) => s.lookupWord);
  const addCard = useVocabularyStore((s) => s.addCard);
  const { nativeLanguageId, englishLanguageId } = useViewerLanguageIds();

  const [lemma, setLemma] = useState('');
  const [preview, setPreview] = useState<WordCardDto | null>(null);
  const [foundInDb, setFoundInDb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runLookup = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setPreview(null);
        setFoundInDb(false);
        setError(null);
        return;
      }
      const englishError = validateEnglishWordInput(trimmed);
      if (englishError) {
        setPreview(null);
        setFoundInDb(false);
        setError(englishError);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await lookupWord(trimmed);
        setFoundInDb(result.foundInDb);
        if (!result.foundInDictionary) {
          setPreview(null);
          setError(VOCABULARY_WORD_NOT_FOUND);
          return;
        }
        const card = result.foundInDb ? result.word : result.preview;
        setPreview(card ?? null);
        if (!card) {
          setError(VOCABULARY_WORD_NOT_FOUND);
        }
      } catch (err) {
        setPreview(null);
        setError(err instanceof Error ? err.message : 'Lookup failed');
      } finally {
        setLoading(false);
      }
    },
    [lookupWord],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!lemma.trim()) {
      setPreview(null);
      setFoundInDb(false);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void runLookup(lemma);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [lemma, runLookup]);

  const onAdd = async () => {
    const trimmed = lemma.trim();
    if (!trimmed || adding || disabled) return;
    const englishError = validateEnglishWordInput(trimmed);
    if (englishError) {
      setError(englishError);
      return;
    }
    if (!studentBackendId) {
      setError('Lesson student is not available yet. Refresh the page and try again.');
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const lookup = await lookupWord(trimmed);
      if (!lookup.foundInDictionary) {
        setError(VOCABULARY_WORD_NOT_FOUND);
        return;
      }
      const card = await addCard(
        {
          text: trimmed,
          lessonId: lessonBackendId ?? undefined,
          status: 'new',
        },
        studentBackendId || undefined,
      );
      const wordId = card.word.id;
      if (linkedWordIds.includes(wordId)) {
        setError('This word is already linked to the lesson.');
        return;
      }
      onAddWordId(wordId);
      setLemma('');
      setPreview(null);
      setFoundInDb(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word');
    } finally {
      setAdding(false);
    }
  };

  const canAdd =
    Boolean(lemma.trim()) &&
    Boolean(preview) &&
    !loading &&
    !adding &&
    !disabled &&
    Boolean(studentBackendId);

  return (
    <div className={styles.addPanel}>
      <p className={styles.hint}>
        Type a word to look it up in our dictionary (or fetch from external sources). Then add it to
        this lesson and the student&apos;s vocabulary.
      </p>
      <div className={styles.addRow}>
        <Field
          className={`${vocabPageStyles.searchInput} ${styles.addRowField}`}
          type="text"
          placeholder="English word, e.g. articulate"
          value={lemma}
          disabled={disabled || adding}
          onChange={(e) => setLemma(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void onAdd();
            }
          }}
        />
        <Button type="button" disabled={!canAdd} onClick={() => void onAdd()}>
          <Plus size={14} aria-hidden />
          {adding ? 'Adding…' : 'Add to lesson'}
        </Button>
      </div>
      {loading ? <p className={styles.hint}>Looking up…</p> : null}
      {preview ? (
        <div className={styles.preview}>
          {foundInDb ? <span className={styles.previewBadge}>In dictionary</span> : null}
          <div className={styles.previewMeta}>
            {preview.phonetic ? <span>{preview.phonetic}</span> : null}
            <WordCardAudioButton audioUrl={preview.audioUrl} className={styles.previewAudioBtn} />
            {preview.partOfSpeech ? <span>{preview.partOfSpeech}</span> : null}
          </div>
          {preview.origin ? <div className={styles.previewOrigin}>{preview.origin}</div> : null}
          <div className={styles.previewDef}>
            {pickWordDefinition(
              preview.definitions,
              nativeLanguageId,
              englishLanguageId,
              preview.definition,
            )}
          </div>
          {preview.example ? (
            <div className={styles.previewExample}>&quot;{preview.example}&quot;</div>
          ) : null}
        </div>
      ) : null}
      {error ? <p className={styles.previewError}>{error}</p> : null}
    </div>
  );
}
