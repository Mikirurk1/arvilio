'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VocabularyWordStatusName } from '@soenglish/shared-types';
import { Button, Field, SurfaceCard } from '../../../components/ui';
import {
  addProfileVocabularyEntry,
  createVocabularyWord,
  joinProfileVocabulary,
  legacyStatusToVocabularyStatusId,
  updateProfileVocabularyStatus,
} from '../../../mocks';
import { VocabularyListSection, VocabularyStatsRow } from '../../vocabulary/sections';
import styles from './page.module.scss';

export function StudentVocabularyTab({ studentUserId }: { studentUserId: number }) {
  const [items, setItems] = useState(() => joinProfileVocabulary(studentUserId));
  const refresh = () => setItems(joinProfileVocabulary(studentUserId));

  const [draftWord, setDraftWord] = useState('');
  const [draftDef, setDraftDef] = useState('');

  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [search, setSearch] = useState('');
  const categories = useMemo(() => {
    const unique = [...new Set(items.map(({ word }) => word.category))].sort((a, b) =>
      a.localeCompare(b),
    );
    return ['All', ...unique];
  }, [items]);

  useEffect(() => {
    if (!categories.includes(filter)) setFilter('All');
  }, [categories, filter]);

  const filtered = useMemo(
    () =>
      items.filter(({ row, word, status }) => {
        const catOk = filter === 'All' || word.category === filter;
        const statusOk = statusFilter === 'all' || status === statusFilter;
        const lessonOk = lessonFilter === 'all' || String(row.lessonId ?? '') === lessonFilter;
        const searchOk =
          !search ||
          word.word.toLowerCase().includes(search.toLowerCase()) ||
          word.definition.toLowerCase().includes(search.toLowerCase());
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
      new Set(items.map(({ row }) => row.lessonId).filter((lessonId): lessonId is number => Boolean(lessonId))),
    ).sort((a, b) => a - b);
    return [{ value: 'all', label: 'All lessons' }, ...unique.map((id) => ({ value: String(id), label: `Lesson #${id}` }))];
  }, [items]);

  const onSetStatus = (entryId: number, status: VocabularyWordStatusName) => {
    updateProfileVocabularyStatus(entryId, legacyStatusToVocabularyStatusId(status));
    refresh();
  };

  const onAddWord = () => {
    const lemma = draftWord.trim();
    if (!lemma) return;
    const vid = createVocabularyWord({
      word: lemma,
      definition: draftDef.trim() || '—',
      example: '',
      phonetic: '',
      pos: '—',
      category: 'general',
    });
    addProfileVocabularyEntry({
      userId: studentUserId,
      vocabularyId: vid,
      status: 'new',
    });
    setDraftWord('');
    setDraftDef('');
    refresh();
  };

  return (
    <SurfaceCard className={styles.tabCard}>
      <p className={styles.vocabTabIntro}>
        Manage this student&apos;s vocabulary progress. Staff can set any status, including <strong>known</strong>.
      </p>
      <div className={styles.studentVocabQuickAdd}>
        <div className={styles.studentVocabQuickAddTitle}>Add word</div>
        <div className={styles.studentVocabQuickAddGrid}>
          <div className={styles.studentVocabQuickAddField}>
            <label className={styles.studentVocabQuickAddLabel} htmlFor={`student-vocab-word-${studentUserId}`}>
              Word
            </label>
            <Field
              id={`student-vocab-word-${studentUserId}`}
              className={styles.studentVocabQuickAddInput}
              value={draftWord}
              placeholder="e.g. articulate"
              onChange={(e) => setDraftWord(e.target.value)}
            />
          </div>
          <div className={styles.studentVocabQuickAddField}>
            <label className={styles.studentVocabQuickAddLabel} htmlFor={`student-vocab-def-${studentUserId}`}>
              Definition (optional)
            </label>
            <Field
              id={`student-vocab-def-${studentUserId}`}
              className={styles.studentVocabQuickAddInput}
              value={draftDef}
              placeholder="Short gloss"
              onChange={(e) => setDraftDef(e.target.value)}
            />
          </div>
        </div>
        <Button type="button" className={styles.studentVocabQuickAddBtn} disabled={!draftWord.trim()} onClick={onAddWord}>
          Add to student vocabulary
        </Button>
      </div>
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
        totalSourceCount={items.length}
      />
    </SurfaceCard>
  );
}
