'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VocabularyWordStatusName } from '@soenglish/shared-types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import {
  activeMockUser,
  buildVocabularyPlayRound,
  canEdit,
  canView,
  getVocabularyForLastLesson,
  getVocabularyForLesson,
  mockScheduledLessons,
  USER_ROLE,
  joinProfileVocabulary,
  legacyStatusToVocabularyStatusId,
  siteContent,
  updateProfileVocabularyStatus,
} from '../../mocks';
import {
  VocabularyFlashcardSection,
  VocabularyListSection,
  VocabularyModeToggle,
  VocabularyPlaySection,
  VocabularyStatsRow,
} from './sections';
import styles from './page.module.scss';

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function VocabularyPage() {
  if (!canView('vocabulary', activeMockUser.role)) return null;
  const isStudent = activeMockUser.role === USER_ROLE.student.id;
  const canSetLearned = activeMockUser.role !== USER_ROLE.student.id;

  const [items, setItems] = useState(() => joinProfileVocabulary(activeMockUser.id));
  const refreshItems = () => setItems(joinProfileVocabulary(activeMockUser.id));

  const applyStatus = (entryId: number, status: VocabularyWordStatusName) => {
    if (isStudent && status === 'learned') return;
    updateProfileVocabularyStatus(entryId, legacyStatusToVocabularyStatusId(status));
    refreshItems();
  };

  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [mode, setMode] = useState<'list' | 'flashcard' | 'play'>('list');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [search, setSearch] = useState('');
  const [playSource, setPlaySource] = useState<'random' | 'last' | 'lesson'>('random');
  const [playLessonId, setPlayLessonId] = useState('all');
  const [playQuestions, setPlayQuestions] = useState<
    Array<{ entryId: number; vocabularyId: number; word: string; phonetic: string; correct: string; options: string[] }>
  >([]);
  const [playIndex, setPlayIndex] = useState(0);
  const [playSelected, setPlaySelected] = useState<string | null>(null);
  const [playShowExplanation, setPlayShowExplanation] = useState(false);
  const [playAnswers, setPlayAnswers] = useState<boolean[]>([]);
  const [playScore, setPlayScore] = useState(0);
  const [playPhase, setPlayPhase] = useState<'setup' | 'quiz' | 'result'>('setup');
  const categories = useMemo(() => {
    const unique = [...new Set(items.map(({ word }) => word.category))].sort((a, b) =>
      a.localeCompare(b),
    );
    return ['All', ...unique];
  }, [items]);

  const lessonOptions = useMemo(() => {
    const lessonIdSet = new Set(
      items.map(({ row }) => row.lessonId).filter((lessonId): lessonId is number => Boolean(lessonId)),
    );
    const byId = new Map(
      mockScheduledLessons.map((lesson) => [lesson.id, lesson.title] as const),
    );
    return [
      { value: 'all', label: 'All lessons' },
      ...Array.from(lessonIdSet)
        .sort((a, b) => a - b)
        .map((lessonId) => ({
          value: String(lessonId),
          label: byId.get(lessonId) ?? `Lesson #${lessonId}`,
        })),
    ];
  }, [items]);
  const playLessonOptions = useMemo(() => {
    const studentLessons = mockScheduledLessons
      .filter((lesson) => lesson.studentId === activeMockUser.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
    return studentLessons.map((lesson) => ({
      value: String(lesson.id),
      label: `${lesson.title} (${lesson.date})`,
    }));
  }, []);

  useEffect(() => {
    if (!categories.includes(filter)) setFilter('All');
  }, [categories, filter]);

  useEffect(() => {
    if (!lessonOptions.some((option) => option.value === lessonFilter)) setLessonFilter('all');
  }, [lessonFilter, lessonOptions]);

  const filtered = useMemo(
    () =>
      items.filter(({ row, word, status }) => {
        const catOk = filter === 'All' || word.category === filter;
        const statusOk = statusFilter === 'all' || status === statusFilter;
        const lessonOk =
          lessonFilter === 'all' || String(row.lessonId ?? '') === lessonFilter;
        const searchOk =
          !search ||
          word.word.toLowerCase().includes(search.toLowerCase()) ||
          word.definition.toLowerCase().includes(search.toLowerCase());
        return catOk && statusOk && lessonOk && searchOk;
      }),
    [items, filter, statusFilter, lessonFilter, search],
  );

  const playPool = useMemo(() => {
    if (playSource === 'random') {
      const priority = items.filter(
        ({ status }) => status === 'new' || status === 'mistakes_work',
      );
      const fallback = priority.length > 0 ? priority : items;
      return shuffle(fallback).slice(0, 20);
    }
    if (playSource === 'last') return getVocabularyForLastLesson(activeMockUser.id).words;
    if (playLessonId === 'all') {
      const priority = items.filter(
        ({ status }) => status === 'new' || status === 'mistakes_work',
      );
      const fallback = priority.length > 0 ? priority : items;
      return shuffle(fallback).slice(0, 20);
    }
    return getVocabularyForLesson(activeMockUser.id, Number(playLessonId));
  }, [playSource, playLessonId, items]);

  const startPlay = () => {
    const questions = buildVocabularyPlayRound(playPool);
    setPlayQuestions(questions);
    setPlayIndex(0);
    setPlaySelected(null);
    setPlayShowExplanation(false);
    setPlayAnswers([]);
    setPlayScore(0);
    setPlayPhase(questions.length > 0 ? 'quiz' : 'setup');
  };

  const currentItem = filtered[cardIndex];
  const markStatus = (status: VocabularyWordStatusName) => {
    if (!currentItem) return;
    if (isStudent && status === 'learned') return;
    applyStatus(currentItem.row.id, status);
    setFlipped(false);
    setTimeout(() => setCardIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1))), 300);
  };

  const stats = {
    new: items.filter(({ status }) => status === 'new').length,
    repeated: items.filter(({ status }) => status === 'repeated').length,
    mistakesWork: items.filter(({ status }) => status === 'mistakes_work').length,
    learned: items.filter(({ status }) => status === 'learned').length,
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        textClassName={styles.pageHeaderText}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={`${siteContent.vocabulary.title}${canEdit('vocabulary', activeMockUser.role) ? '' : ' (read only)'}`}
        subtitle={`${items.length} words in your library`}
        actions={
          <div className={styles.headerActions}>
            <Link href="/practice" className={styles.backBtn}>
              <ArrowLeft size={14} />
              Back
            </Link>
            <VocabularyModeToggle mode={mode} onChange={(nextMode) => { setMode(nextMode); if (nextMode === 'flashcard') { setCardIndex(0); setFlipped(false); } }} />
          </div>
        }
      />

      <VocabularyStatsRow total={items.length} stats={stats} onFilter={setStatusFilter} />

      {mode === 'list' && (
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
          onSetStatus={applyStatus}
          canSetLearned={canSetLearned}
          totalSourceCount={items.length}
        />
      )}

      {mode === 'flashcard' && (
        <VocabularyFlashcardSection
          cardIndex={cardIndex}
          total={filtered.length}
          currentItem={currentItem}
          flipped={flipped}
          setFlipped={setFlipped}
          markStatus={markStatus}
          setCardIndex={setCardIndex}
          canSetLearned={canSetLearned}
        />
      )}
      {mode === 'play' && (
        <VocabularyPlaySection
          playSource={playSource}
          setPlaySource={setPlaySource}
          playLessonId={playLessonId}
          setPlayLessonId={setPlayLessonId}
          playLessonOptions={playLessonOptions}
          playQuestions={playQuestions}
          playIndex={playIndex}
          playSelected={playSelected}
          playShowExplanation={playShowExplanation}
          playAnswers={playAnswers}
          playScore={playScore}
          playPhase={playPhase}
          canStart={playPool.length > 0}
          onStart={startPlay}
          onSelect={(option) => {
            if (playShowExplanation) return;
            setPlaySelected(option);
          }}
          onCheck={() => {
            const current = playQuestions[playIndex];
            if (!current || !playSelected || playShowExplanation) return;
            const isCorrect = playSelected === current.correct;
            setPlayAnswers((prev) => [...prev, isCorrect]);
            if (isCorrect) setPlayScore((prev) => prev + 1);
            applyStatus(current.entryId, isCorrect ? 'repeated' : 'mistakes_work');
            setPlayShowExplanation(true);
            refreshItems();
          }}
          onNext={() => {
            if (playIndex + 1 >= playQuestions.length) {
              setPlayPhase('result');
              return;
            }
            setPlayIndex((prev) => prev + 1);
            setPlaySelected(null);
            setPlayShowExplanation(false);
          }}
          onFinish={() => {
            setPlayPhase('result');
            setPlayShowExplanation(false);
            setPlaySelected(null);
          }}
          onReset={() => {
            setPlayQuestions([]);
            setPlayIndex(0);
            setPlaySelected(null);
            setPlayShowExplanation(false);
            setPlayAnswers([]);
            setPlayScore(0);
            setPlayPhase('setup');
          }}
        />
      )}
    </div>
  );
}
