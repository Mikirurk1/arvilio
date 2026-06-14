'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VocabularyWordStatusName } from '@pkg/types';
import { SurfaceCard } from '../../../components/ui';
import { WordDetailsModal } from '../../../features/vocabulary/WordDetailsModal';
import { useViewerLanguageIds } from '../../../hooks/use-viewer-language-ids';
import { confirmDialog } from '../../../features/confirm';
import { toast } from '../../../features/notifications';
import {
  mapStudentCardsToListItems,
  vocabularyItemMatchesSearch,
  wordMatchesPosFilter,
} from '../../../lib/vocabulary-ui';
import { useVocabularyStore } from '../../../stores/vocabulary-store';
import { VocabularyAddWordBar, VocabularyListSection, VocabularyStatsRow } from '../../vocabulary/sections';
import styles from './page.module.scss';

type Props = {
  studentId: string;
  /** When true, rendered inside StudentPracticeTab (no outer card/title). */
  embedded?: boolean;
};

export function StudentVocabularyTab({ studentId, embedded = false }: Props) {
  const cardsSlice = useVocabularyStore((s) => s.cards);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const updateCardStatus = useVocabularyStore((s) => s.updateCardStatus);
  const deleteCard = useVocabularyStore((s) => s.deleteCard);
  const addCard = useVocabularyStore((s) => s.addCard);
  const { nativeLanguageId, englishLanguageId } = useViewerLanguageIds();
  const [detailsWordId, setDetailsWordId] = useState<string | null>(null);

  useEffect(() => {
    void fetchCards(studentId);
  }, [fetchCards, studentId]);

  const items = useMemo(
    () => mapStudentCardsToListItems(cardsSlice.data ?? [], nativeLanguageId, englishLanguageId),
    [cardsSlice.data, nativeLanguageId, englishLanguageId],
  );

  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [search, setSearch] = useState('');

  const posFilters = useMemo(() => {
    const seen = new Map<string, string>();
    for (const { display } of items) {
      for (const pos of display.partsOfSpeech) {
        const key = pos.toLowerCase();
        if (!seen.has(key)) seen.set(key, pos);
      }
    }
    return ['All', ...[...seen.values()].sort((a, b) => a.localeCompare(b))];
  }, [items]);

  useEffect(() => {
    if (!posFilters.includes(filter)) setFilter('All');
  }, [posFilters, filter]);

  const filtered = useMemo(
    () =>
      items.filter(({ card, display, status }) => {
        const catOk = wordMatchesPosFilter(display.partsOfSpeech, filter);
        const statusOk = statusFilter === 'all' || status === statusFilter;
        const lessonOk = lessonFilter === 'all' || (card.lessonId ?? '') === lessonFilter;
        const searchOk = vocabularyItemMatchesSearch(
          { card, display, status },
          search,
          filter,
          nativeLanguageId,
          englishLanguageId,
        );
        return catOk && statusOk && lessonOk && searchOk;
      }),
    [items, filter, statusFilter, lessonFilter, search, nativeLanguageId, englishLanguageId],
  );

  const stats = {
    new: items.filter(({ status }) => status === 'new').length,
    repeated: items.filter(({ status }) => status === 'repeated').length,
    mistakesWork: items.filter(({ status }) => status === 'mistakes_work').length,
    learned: items.filter(({ status }) => status === 'learned').length,
  };

  const lessonOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        items
          .map(({ card }) => card.lessonId)
          .filter((lessonId): lessonId is string => Boolean(lessonId)),
      ),
    ).sort();
    return [
      { value: 'all', label: 'All lessons' },
      ...unique.map((id) => ({ value: id, label: `Lesson` })),
    ];
  }, [items]);

  const onSetStatus = (cardId: string, status: VocabularyWordStatusName) => {
    void updateCardStatus(cardId, status, studentId);
  };

  const onAddWord = async (text: string) => {
    await addCard({ text }, studentId);
  };

  const onDeleteWord = async (cardId: string) => {
    if (!studentId) return;
    const ok = await confirmDialog({
      title: 'Remove word?',
      message: 'This word will be removed from the student vocabulary.',
      confirmLabel: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;
    void deleteCard(cardId, studentId).catch((err) => {
      toast.error(err instanceof Error ? err.message : 'Could not remove word');
    });
  };

  const isLoading = cardsSlice.status === 'loading' || cardsSlice.status === 'idle';

  const body = (
    <>
      {!embedded ? (
        <>
          <h2 className={styles.tabSectionTitle}>Vocabulary</h2>
          <p className={styles.vocabTabIntro}>
            Manage this student&apos;s vocabulary progress. Staff can set any status, including{' '}
            <strong>learned</strong>.
          </p>
        </>
      ) : null}
      <VocabularyStatsRow total={items.length} stats={stats} onFilter={setStatusFilter} />
      <VocabularyAddWordBar onAdd={onAddWord} disabled={isLoading} />
      <VocabularyListSection
        search={search}
        setSearch={setSearch}
        posFilters={posFilters}
        posFilter={filter}
        setPosFilter={setFilter}
        lessonFilter={lessonFilter}
        setLessonFilter={setLessonFilter}
        lessonOptions={lessonOptions}
        filtered={filtered}
        nativeLanguageId={nativeLanguageId}
        englishLanguageId={englishLanguageId}
        onSetStatus={onSetStatus}
        canSetLearned
        canDelete
        onDelete={onDeleteWord}
        totalSourceCount={items.length}
        isLoading={isLoading}
        onOpenWordDetails={setDetailsWordId}
      />
      {detailsWordId ? (
        <WordDetailsModal wordId={detailsWordId} onClose={() => setDetailsWordId(null)} />
      ) : null}
    </>
  );

  if (embedded) {
    return body;
  }

  return <SurfaceCard className={styles.tabCard}>{body}</SurfaceCard>;
}
