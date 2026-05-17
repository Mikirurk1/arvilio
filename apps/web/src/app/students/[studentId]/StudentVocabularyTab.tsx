'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VocabularyWordStatusName } from '@soenglish/shared-types';
import { SurfaceCard } from '../../../components/ui';
import { WordDetailsModal } from '../../../features/vocabulary/WordDetailsModal';
import { useViewerLanguageIds } from '../../../hooks/use-viewer-language-ids';
import { confirmDialog } from '../../../features/confirm';
import { toast } from '../../../features/notifications';
import { mapStudentCardsToListItems } from '../../../lib/vocabulary-ui';
import { useVocabularyStore } from '../../../stores/vocabulary-store';
import { VocabularyListSection, VocabularyStatsRow } from '../../vocabulary/sections';
import styles from './page.module.scss';

export function StudentVocabularyTab({ studentId }: { studentId: string }) {
  const cardsSlice = useVocabularyStore((s) => s.cards);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const updateCardStatus = useVocabularyStore((s) => s.updateCardStatus);
  const deleteCard = useVocabularyStore((s) => s.deleteCard);
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

  const categories = useMemo(() => {
    const unique = [...new Set(items.map(({ display }) => display.category))].sort((a, b) =>
      a.localeCompare(b),
    );
    return ['All', ...unique];
  }, [items]);

  useEffect(() => {
    if (!categories.includes(filter)) setFilter('All');
  }, [categories, filter]);

  const filtered = useMemo(
    () =>
      items.filter(({ card, display, status }) => {
        const catOk = filter === 'All' || display.category === filter;
        const statusOk = statusFilter === 'all' || status === statusFilter;
        const lessonOk = lessonFilter === 'all' || (card.lessonId ?? '') === lessonFilter;
        const searchOk =
          !search ||
          display.word.toLowerCase().includes(search.toLowerCase()) ||
          display.definition.toLowerCase().includes(search.toLowerCase());
        return catOk && statusOk && lessonOk && searchOk;
      }),
    [items, filter, statusFilter, lessonFilter, search],
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

  return (
    <SurfaceCard className={styles.tabCard}>
      <p className={styles.vocabTabIntro}>
        Manage this student&apos;s vocabulary progress. Staff can set any status, including{' '}
        <strong>learned</strong>.
      </p>
      <VocabularyStatsRow total={items.length} stats={stats} onFilter={setStatusFilter} />
      <VocabularyListSection
        search={search}
        setSearch={setSearch}
        categories={categories}
        filter={filter}
        setFilter={setFilter}
        lessonFilter={lessonFilter}
        setLessonFilter={setLessonFilter}
        lessonOptions={lessonOptions}
        filtered={filtered}
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
    </SurfaceCard>
  );
}
