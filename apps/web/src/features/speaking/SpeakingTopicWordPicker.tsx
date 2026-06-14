'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import type { WordCardDto } from '@pkg/types';
import { Button, Field } from '../../components/ui';
import { WordDetailsModal } from '../vocabulary/WordDetailsModal';
import { useViewerLanguageIds } from '../../hooks/use-viewer-language-ids';
import { pickWordDefinition } from '../../lib/word-definitions';
import {
  normalizeEnglishVocabularyInput,
  validateEnglishWordInput,
  VOCABULARY_WORD_NOT_FOUND,
} from '../../lib/vocabulary-word-input';
import { mapStudentCardsToListItems, type VocabularyListItem } from '../../lib/vocabulary-ui';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { SpeakingWordChip } from './SpeakingWordChip';
import styles from './SpeakingWordChip.module.scss';

type LessonGroup = {
  lessonId: string;
  /** Formatted short label like "May 14" derived from the earliest firstSeenAt in group. */
  label: string;
  items: VocabularyListItem[];
};

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type Props = {
  studentId: string;
  selectedWordIds: string[];
  onChange: (wordIds: string[]) => void;
  disabled?: boolean;
};

export function SpeakingTopicWordPicker({
  studentId,
  selectedWordIds,
  onChange,
  disabled = false,
}: Props) {
  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const cards = useVocabularyStore((s) => s.cards);
  const lookupWord = useVocabularyStore((s) => s.lookupWord);
  const addCard = useVocabularyStore((s) => s.addCard);
  const fetchWordsByIds = useVocabularyStore((s) => s.fetchWordsByIds);
  const { nativeLanguageId, englishLanguageId } = useViewerLanguageIds();

  const [addText, setAddText] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [extraWords, setExtraWords] = useState<WordCardDto[]>([]);
  const [lessonFilter, setLessonFilter] = useState<'all' | string>('all');
  const [detailsWordId, setDetailsWordId] = useState<string | null>(null);

  useEffect(() => {
    void fetchCards(studentId);
  }, [fetchCards, studentId]);

  useEffect(() => {
    const knownIds = new Set([
      ...(cards.data ?? []).map((card) => card.word.id),
      ...extraWords.map((word) => word.id),
    ]);
    const missing = selectedWordIds.filter((id) => !knownIds.has(id));
    if (missing.length === 0) return;
    void fetchWordsByIds(missing).then((words) => {
      if (words.length > 0) {
        setExtraWords((prev) => {
          const ids = new Set(prev.map((word) => word.id));
          return [...prev, ...words.filter((word) => !ids.has(word.id))];
        });
      }
    });
  }, [cards.data, extraWords, fetchWordsByIds, selectedWordIds]);

  const deckItems = useMemo(
    () => mapStudentCardsToListItems(cards.data ?? [], nativeLanguageId, englishLanguageId),
    [cards.data, nativeLanguageId, englishLanguageId],
  );

  const wordById = useMemo(() => {
    const map = new Map<string, { word: string; pos?: string | null; gloss?: string | null; audioUrl?: string | null }>();
    for (const item of deckItems) {
      map.set(item.display.wordId, {
        word: item.display.word,
        pos: item.display.pos,
        gloss: item.display.definition,
        audioUrl: item.display.audioUrl,
      });
    }
    for (const word of extraWords) {
      if (map.has(word.id)) continue;
      map.set(word.id, {
        word: word.text,
        pos: word.partOfSpeech,
        gloss: pickWordDefinition(
          word.definitions,
          nativeLanguageId,
          englishLanguageId,
          word.definition,
        ),
        audioUrl: word.audioUrl,
      });
    }
    return map;
  }, [deckItems, extraWords, nativeLanguageId, englishLanguageId]);

  const lessonGroups = useMemo<LessonGroup[]>(() => {
    const map = new Map<string, VocabularyListItem[]>();
    for (const item of deckItems) {
      const lid = item.card.lessonId;
      if (!lid) continue;
      const arr = map.get(lid) ?? [];
      arr.push(item);
      map.set(lid, arr);
    }
    return Array.from(map.entries())
      .map(([lessonId, items]) => {
        const earliest = items
          .map((i) => i.card.firstSeenAt)
          .filter(Boolean)
          .sort()[0];
        return {
          lessonId,
          label: earliest ? formatShortDate(earliest) : 'Lesson',
          items,
        };
      })
      .sort((a, b) => {
        const aDate = a.items.map((i) => i.card.firstSeenAt).filter(Boolean).sort().reverse()[0] ?? '';
        const bDate = b.items.map((i) => i.card.firstSeenAt).filter(Boolean).sort().reverse()[0] ?? '';
        return bDate.localeCompare(aDate);
      });
  }, [deckItems]);

  const filteredItems = useMemo(() => {
    if (lessonFilter === 'all') return deckItems;
    if (lessonFilter === '__last') {
      return lessonGroups[0]?.items ?? deckItems;
    }
    return lessonGroups.find((g) => g.lessonId === lessonFilter)?.items ?? deckItems;
  }, [deckItems, lessonFilter, lessonGroups]);

  const toggleWord = (wordId: string) => {
    if (disabled) return;
    if (selectedWordIds.includes(wordId)) {
      onChange(selectedWordIds.filter((id) => id !== wordId));
      return;
    }
    onChange([...selectedWordIds, wordId]);
  };

  const runAddWord = async () => {
    const trimmed = normalizeEnglishVocabularyInput(addText);
    if (!trimmed || adding || disabled) return;

    const englishError = validateEnglishWordInput(trimmed);
    if (englishError) {
      setAddError(englishError);
      return;
    }

    setAdding(true);
    setAddError(null);
    try {
      const result = await lookupWord(trimmed);
      if (!result.foundInDictionary) {
        setAddError(VOCABULARY_WORD_NOT_FOUND);
        return;
      }

      let wordId = result.word?.id ?? result.preview?.id;
      if (!wordId) {
        const card = await addCard({ text: trimmed, status: 'new' }, studentId);
        wordId = card.word.id;
        await fetchCards(studentId, true);
      } else if (!selectedWordIds.includes(wordId)) {
        const inDeck = (cards.data ?? []).some((card) => card.word.id === wordId);
        if (!inDeck) {
          await addCard({ text: trimmed, status: 'new' }, studentId);
          await fetchCards(studentId, true);
        }
      }

      if (wordId && !selectedWordIds.includes(wordId)) {
        onChange([...selectedWordIds, wordId]);
      }
      setAddText('');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add word');
    } finally {
      setAdding(false);
    }
  };

  const onAddInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    void runAddWord();
  };

  return (
    <div>
      <div className={styles.sectionLabel}>Words to use (optional)</div>
      {deckItems.length === 0 ? (
        <p className={styles.emptyHint}>No vocabulary cards yet — add words below or from the student deck.</p>
      ) : (
        <>
          <div className={styles.filterRow}>
            <button
              type="button"
              className={`${styles.filterPill} ${lessonFilter === 'all' ? styles.filterPillActive : ''}`}
              onClick={() => setLessonFilter('all')}
            >
              All
            </button>
            {lessonGroups.length > 0 ? (
              <>
                <button
                  type="button"
                  className={`${styles.filterPill} ${lessonFilter === '__last' ? styles.filterPillActive : ''}`}
                  onClick={() => setLessonFilter('__last')}
                >
                  Last lesson
                </button>
                {lessonGroups.slice(0, 6).map((g) => (
                  <button
                    key={g.lessonId}
                    type="button"
                    className={`${styles.filterPill} ${lessonFilter === g.lessonId ? styles.filterPillActive : ''}`}
                    onClick={() => setLessonFilter(g.lessonId)}
                  >
                    {g.label}
                  </button>
                ))}
              </>
            ) : null}
          </div>

          <div className={styles.pickerGrid}>
            {filteredItems.map((item) => (
              <SpeakingWordChip
                key={item.display.wordId}
                word={item.display.word}
                pos={item.display.pos}
                gloss={item.display.definition}
                audioUrl={item.display.audioUrl}
                selected={selectedWordIds.includes(item.display.wordId)}
                onClick={() => toggleWord(item.display.wordId)}
                onInfo={() => setDetailsWordId(item.display.wordId)}
              />
            ))}
          </div>
        </>
      )}

      {selectedWordIds.length > 0 ? (
        <div className={styles.selectedRow}>
          {selectedWordIds.map((wordId) => {
            const meta = wordById.get(wordId);
            if (!meta) return null;
            return (
              <SpeakingWordChip
                key={wordId}
                word={meta.word}
                pos={meta.pos}
                gloss={meta.gloss}
                audioUrl={meta.audioUrl}
                selected
                onRemove={() => toggleWord(wordId)}
              />
            );
          })}
        </div>
      ) : null}

      <div className={styles.addRow}>
        <Field
          className={styles.addInput}
          type="text"
          placeholder="Add word via lookup…"
          value={addText}
          onChange={(event) => setAddText(event.target.value)}
          onKeyDown={onAddInputKeyDown}
          disabled={disabled || adding}
        />
        <Button
          type="button"
          variant="default"
          disabled={disabled || adding || !addText.trim()}
          loading={adding}
          loadingLabel="Adding…"
          onClick={() => void runAddWord()}
        >
          Add
        </Button>
      </div>
      {addError ? <div className={styles.addError}>{addError}</div> : null}

      {detailsWordId ? (
        <WordDetailsModal wordId={detailsWordId} onClose={() => setDetailsWordId(null)} />
      ) : null}
    </div>
  );
}
