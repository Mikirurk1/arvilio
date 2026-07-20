'use client';

import { type ReactNode } from 'react';
import { type VocabularyWordStatusName } from '@pkg/types';
import { EmptyStateCard } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { type VocabularyListItem } from '../../lib/vocabulary-ui';
import { VocabularyFiltersBar } from './VocabularyFiltersBar';
import { VocabularyWordCards } from './VocabularyWordCards';
import styles from './page.module.scss';

export function VocabularyListSection({
  search,
  setSearch,
  posFilters,
  posFilter,
  setPosFilter,
  lessonFilter,
  setLessonFilter,
  lessonOptions,
  filtered,
  nativeLanguageId,
  englishLanguageId,
  onSetStatus,
  canSetLearned,
  canDelete = false,
  onDelete,
  onOpenWordDetails,
  prependSlot,
  totalSourceCount,
  isLoading = false,
}: {
  search: string;
  setSearch: (value: string) => void;
  posFilters: string[];
  posFilter: string;
  setPosFilter: (value: string) => void;
  lessonFilter: string;
  setLessonFilter: (value: string) => void;
  lessonOptions: Array<{ value: string; label: string }>;
  filtered: VocabularyListItem[];
  nativeLanguageId?: string | null;
  englishLanguageId?: string | null;
  onSetStatus: (cardId: string, status: VocabularyWordStatusName) => void;
  canSetLearned: boolean;
  canDelete?: boolean;
  onDelete?: (cardId: string) => void;
  onOpenWordDetails?: (wordId: string) => void;
  prependSlot?: ReactNode;
  totalSourceCount: number;
  isLoading?: boolean;
}) {
  const t = useCampusT();
  return (
    <>
      <VocabularyFiltersBar
        search={search}
        setSearch={setSearch}
        posFilters={posFilters}
        filter={posFilter}
        setFilter={setPosFilter}
        lessonFilter={lessonFilter}
        setLessonFilter={setLessonFilter}
        lessonOptions={lessonOptions}
      />

      <div className={styles.wordGrid} data-tour-anchor="vocab-word-list">
        {prependSlot}
        <VocabularyWordCards
          items={filtered}
          posFilter={posFilter}
          nativeLanguageId={nativeLanguageId}
          englishLanguageId={englishLanguageId}
          onSetStatus={onSetStatus}
          canSetLearned={canSetLearned}
          canDelete={canDelete}
          onDelete={onDelete}
          onOpenWordDetails={onOpenWordDetails}
          animationIndexOffset={prependSlot ? 1 : 0}
        />
      </div>
      {filtered.length === 0 && totalSourceCount > 0 ? (
        <EmptyStateCard
          className={styles.empty}
          title={t('vocabulary.empty.noMatch')}
          description={t('vocabulary.empty.noMatchHint')}
        />
      ) : null}
      {isLoading ? (
        <EmptyStateCard
          className={styles.empty}
          title={t('vocabulary.empty.loading')}
          description={t('vocabulary.empty.fetching')}
        />
      ) : null}
      {!isLoading &&
      filtered.length === 0 &&
      totalSourceCount === 0 &&
      !prependSlot ? (
        <EmptyStateCard
          className={styles.empty}
          showArvi
          title={t('vocabulary.empty.noWords')}
          description={t('vocabulary.empty.noWordsHint')}
        />
      ) : null}
    </>
  );
}
