'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { VocabularyWordStatusName } from '@pkg/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import { siteContent } from '../../mocks/content/site-content';
import { canEdit } from '../../lib/roles';
import { mapAuthRoleToRoleId } from '../../lib/active-user';
import { usePracticeSessionTracker } from '../../lib/practice-session-tracker';
import { useAuth } from '../../lib/auth-context';
import {
  buildVocabularyPlayRound,
  canBuildVocabularyPlayRound,
  mapStudentCardsToListItems,
  vocabularyItemMatchesSearch,
  wordMatchesPosFilter,
  type VocabularyListItem,
  type VocabularyPlayQuestion,
} from '../../lib/vocabulary-ui';
import { useViewerLanguageIds } from '../../hooks/use-viewer-language-ids';
import { confirmDialog } from '../../features/confirm';
import { toast } from '../../features/notifications';
import { WordDetailsModal } from '../../features/vocabulary/WordDetailsModal';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { useLessonsStore } from '../../stores/lessons-store';
import {
  VocabularyAddWordBar,
  VocabularyFiltersBar,
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
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const roleId = mapAuthRoleToRoleId(user?.role);

  const isStudent = user?.role === 'student';
  const canSetLearned = canEdit('vocabulary', roleId);
  const userId = user?.id ?? '';
  const overview = useVocabularyStore((s) => s.overview);
  const cardsSlice = useVocabularyStore((s) => s.cards);
  const fetchOverview = useVocabularyStore((s) => s.fetchOverview);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const addCard = useVocabularyStore((s) => s.addCard);
  const updateCardStatus = useVocabularyStore((s) => s.updateCardStatus);
  const deleteCard = useVocabularyStore((s) => s.deleteCard);
  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const fetchScheduledLessons = useLessonsStore((s) => s.fetchScheduledLessons);

  useEffect(() => {
    void fetchOverview();
    void fetchCards();
    void fetchScheduledLessons();
  }, [fetchOverview, fetchCards, fetchScheduledLessons]);

  const { nativeLanguageId, englishLanguageId } = useViewerLanguageIds();
  const [detailsWordId, setDetailsWordId] = useState<string | null>(null);

  const items = useMemo(
    () => mapStudentCardsToListItems(cardsSlice.data ?? [], nativeLanguageId, englishLanguageId),
    [cardsSlice.data, nativeLanguageId, englishLanguageId],
  );

  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [mode, setMode] = useState<'list' | 'flashcard' | 'play'>('list');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [search, setSearch] = useState('');
  const urlQuery = searchParams.get('q')?.trim() ?? '';

  useEffect(() => {
    if (urlQuery) setSearch(urlQuery);
  }, [urlQuery]);
  const [playSource, setPlaySource] = useState<'random' | 'last' | 'lesson'>('random');
  const [playLessonId, setPlayLessonId] = useState('all');
  const [playQuestions, setPlayQuestions] = useState<VocabularyPlayQuestion[]>([]);
  const [playIndex, setPlayIndex] = useState(0);
  const [playSelected, setPlaySelected] = useState<string | null>(null);
  const [playShowExplanation, setPlayShowExplanation] = useState(false);
  const [playAnswers, setPlayAnswers] = useState<boolean[]>([]);
  const [playScore, setPlayScore] = useState(0);
  const [playPhase, setPlayPhase] = useState<'setup' | 'quiz' | 'result'>('setup');
  usePracticeSessionTracker(user?.id, 'vocabulary', mode === 'play' && playPhase === 'quiz');

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

  const lessonTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const lesson of backendLessons.data ?? []) {
      map.set(lesson.id, lesson.title);
    }
    return map;
  }, [backendLessons.data]);

  const lessonOptions = useMemo(() => {
    const lessonIdSet = new Set(
      items
        .map(({ card }) => card.lessonId)
        .filter((lessonId): lessonId is string => Boolean(lessonId)),
    );
    return [
      { value: 'all', label: 'All lessons' },
      ...Array.from(lessonIdSet)
        .sort((a, b) => a.localeCompare(b))
        .map((lessonId) => ({
          value: lessonId,
          label: lessonTitleById.get(lessonId) ?? `Lesson`,
        })),
    ];
  }, [items, lessonTitleById]);

  const playLessonOptions = useMemo(() => {
    const studentLessons = (backendLessons.data ?? [])
      .filter((lesson) => lesson.studentId === userId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
    return studentLessons.map((lesson) => ({
      value: lesson.id,
      label: `${lesson.title} (${lesson.date})`,
    }));
  }, [backendLessons.data, userId]);

  useEffect(() => {
    if (!posFilters.includes(filter)) setFilter('All');
  }, [posFilters, filter]);

  useEffect(() => {
    if (mode !== 'flashcard') return;
    setCardIndex(0);
    setFlipped(false);
  }, [filter, lessonFilter, search, statusFilter, mode]);

  useEffect(() => {
    if (!lessonOptions.some((option) => option.value === lessonFilter)) setLessonFilter('all');
  }, [lessonFilter, lessonOptions]);

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

  const wordsForLastLesson = useMemo((): VocabularyListItem[] => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const completed = (backendLessons.data ?? [])
      .filter(
        (lesson) =>
          lesson.studentId === userId &&
          lesson.status === 'completed' &&
          lesson.date <= todayIso,
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
    for (const lesson of completed) {
      const words = items.filter(({ card }) => card.lessonId === lesson.id);
      if (words.length > 0) return words;
    }
    return [];
  }, [backendLessons.data, items, userId]);

  const playPool = useMemo(() => {
    if (playSource === 'random') {
      const priority = items.filter(
        ({ status }) => status === 'new' || status === 'mistakes_work',
      );
      const fallback = priority.length > 0 ? priority : items;
      return shuffle(fallback).slice(0, 20);
    }
    if (playSource === 'last') {
      if (wordsForLastLesson.length > 0) return wordsForLastLesson;
      const priority = items.filter(
        ({ status }) => status === 'new' || status === 'mistakes_work',
      );
      return shuffle(priority.length > 0 ? priority : items).slice(0, 20);
    }
    if (playSource === 'lesson' && playLessonId !== 'all') {
      const byLesson = items.filter(({ card }) => card.lessonId === playLessonId);
      if (byLesson.length > 0) return byLesson;
    }
    const priority = items.filter(
      ({ status }) => status === 'new' || status === 'mistakes_work',
    );
    const fallback = priority.length > 0 ? priority : items;
    return shuffle(fallback).slice(0, 20);
  }, [playSource, playLessonId, items, wordsForLastLesson]);

  const canStartPlay = useMemo(() => canBuildVocabularyPlayRound(playPool), [playPool]);

  const applyStatus = (cardId: string, status: VocabularyWordStatusName) => {
    if (isStudent && status === 'learned') return;
    void updateCardStatus(cardId, status);
  };

  const onAddWord = async (text: string) => {
    await addCard({ text: text.trim() });
  };

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
    if (isStudent && (status === 'learned' || status === 'mistakes_work')) return;
    applyStatus(currentItem.card.id, status);
    setFlipped(false);
    setTimeout(() => setCardIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1))), 300);
  };

  const stats = {
    new: items.filter(({ status }) => status === 'new').length,
    repeated: items.filter(({ status }) => status === 'repeated').length,
    mistakesWork: items.filter(({ status }) => status === 'mistakes_work').length,
    learned: items.filter(({ status }) => status === 'learned').length,
  };

  const totalWords = overview.data?.totalWords ?? items.length;
  const isLoading = cardsSlice.status === 'loading' || cardsSlice.status === 'idle';
  const loadError = cardsSlice.status === 'error' ? cardsSlice.error : null;
  const canEditVocab = canEdit('vocabulary', roleId);
  const canDeleteWords = canSetLearned && !isStudent && Boolean(userId);

  const onDeleteWord = async (cardId: string) => {
    if (!userId) return;
    const ok = await confirmDialog({
      title: 'Remove word?',
      message: 'This word will be removed from your vocabulary list.',
      confirmLabel: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;
    void deleteCard(cardId, userId).catch((err) => {
      toast.error(err instanceof Error ? err.message : 'Could not remove word');
    });
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        textClassName={styles.pageHeaderText}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={`${siteContent.vocabulary.title}${canEditVocab ? '' : ' (read only)'}`}
        subtitle={`${totalWords} words in your library`}
        back={
          <Link href="/practice" className={styles.backBtn}>
            <ArrowLeft size={14} />
            Back
          </Link>
        }
        actions={
          <div className={styles.headerActions}>
            <VocabularyModeToggle
              mode={mode}
              onChange={(nextMode) => {
                setMode(nextMode);
                if (nextMode === 'flashcard') {
                  setCardIndex(0);
                  setFlipped(false);
                }
              }}
            />
          </div>
        }
      />

      {loadError ? <div className={styles.loadError}>{loadError}</div> : null}

      <VocabularyStatsRow total={totalWords} stats={stats} onFilter={setStatusFilter} />

      {mode === 'list' && (
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
          onSetStatus={applyStatus}
          canSetLearned={canSetLearned}
          canDelete={canDeleteWords}
          onDelete={onDeleteWord}
          totalSourceCount={items.length}
          isLoading={isLoading}
          prependSlot={<VocabularyAddWordBar onAdd={onAddWord} disabled={isLoading} />}
          onOpenWordDetails={setDetailsWordId}
        />
      )}

      {detailsWordId ? (
        <WordDetailsModal wordId={detailsWordId} onClose={() => setDetailsWordId(null)} />
      ) : null}

      {mode === 'flashcard' && (
        <>
          <VocabularyFiltersBar
            search={search}
            setSearch={setSearch}
            posFilters={posFilters}
            filter={filter}
            setFilter={setFilter}
            lessonFilter={lessonFilter}
            setLessonFilter={setLessonFilter}
            lessonOptions={lessonOptions}
          />
          <VocabularyFlashcardSection
            cardIndex={cardIndex}
            total={filtered.length}
            currentItem={currentItem}
            flipped={flipped}
            setFlipped={setFlipped}
            markStatus={markStatus}
            setCardIndex={setCardIndex}
            canSetLearned={canSetLearned}
            isStudent={isStudent}
            posFilter={filter}
            nativeLanguageId={nativeLanguageId}
            englishLanguageId={englishLanguageId}
            lessonTitle={
              currentItem?.card.lessonId
                ? lessonTitleById.get(currentItem.card.lessonId)
                : undefined
            }
            onOpenWordDetails={setDetailsWordId}
            onRestart={() => {
              setCardIndex(0);
              setFlipped(false);
            }}
            isLoading={isLoading}
            emptyAfterFilters={items.length > 0 && filtered.length === 0}
          />
        </>
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
          canStart={canStartPlay}
          playPoolCount={playPool.length}
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
            applyStatus(current.cardId, isCorrect ? 'repeated' : 'mistakes_work');
            setPlayShowExplanation(true);
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
