'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Target } from 'lucide-react';
import { Button, PageHeader, StatTile } from '../../components/ui';
import { confirmDialog } from '../../features/confirm';
import { CreateQuizCard } from '../../components/quiz/CreateQuizCard';
import { QuizAssignmentCards } from '../../components/quiz/QuizAssignmentCards';
import { QuizPlaySession } from '../../features/quiz/QuizPlaySession';
import { QuizResultScreen } from '../../features/quiz/QuizResultScreen';
import type { QuizPlayResult } from '../../features/quiz/quiz-play-types';
import { siteContent, USER_ROLE } from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { useAuth } from '../../lib/auth-context';
import { usePracticeSessionTracker } from '../../lib/practice-session-tracker';
import { canEdit } from '../../lib/roles';
import { useQuizzesStore } from '../../stores/quizzes-store';
import styles from './page.module.scss';

type PlayState = {
  quizId: string;
  practice: boolean;
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const activeUser = useActiveUser();
  const { user } = useAuth();
  const backendQuizzes = useQuizzesStore((s) => s.list);
  const studentQuizzes = useQuizzesStore((s) => s.studentQuizzes);
  const fetchQuizList = useQuizzesStore((s) => s.fetchList);
  const fetchStudentQuizzes = useQuizzesStore((s) => s.fetchStudentQuizzes);
  const fetchQuiz = useQuizzesStore((s) => s.fetchQuiz);
  const deleteQuiz = useQuizzesStore((s) => s.deleteQuiz);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const canManageQuiz = canEdit('quiz', activeUser.role);
  const isStudentView = activeUser.role === USER_ROLE.student.id;
  const [play, setPlay] = useState<PlayState | null>(null);
  const [playResult, setPlayResult] = useState<QuizPlayResult | null>(null);
  const [lastPlayedQuizId, setLastPlayedQuizId] = useState<string | null>(null);
  const [lastPracticeMode, setLastPracticeMode] = useState(false);
  const [quizLoadError, setQuizLoadError] = useState<string | null>(null);
  usePracticeSessionTracker(user?.id, 'quiz', play !== null);

  const assignedQuizzes = studentQuizzes.data ?? [];
  const staffQuizzes = backendQuizzes.data ?? [];
  const firstIncompleteAssigned = assignedQuizzes.find((q) => !q.attempt?.finishedAt) ?? null;
  const latestBackendQuiz = isStudentView
    ? (firstIncompleteAssigned ?? assignedQuizzes[0] ?? null)
    : (staffQuizzes[0] ?? null);
  const introQuizId = latestBackendQuiz?.id ?? null;
  const introTitle = latestBackendQuiz?.title ?? 'No available quizzes yet';
  const introQuestionCount = latestBackendQuiz?.questionCount ?? 0;
  const introDurationMin = Math.max(1, Math.round(introQuestionCount * 0.75));
  const totalQuizzes = isStudentView ? assignedQuizzes.length : staffQuizzes.length;

  useEffect(() => {
    void fetchQuizList();
    if (isStudentView && user?.id) {
      void fetchStudentQuizzes(user.id);
    }
  }, [fetchQuizList, fetchStudentQuizzes, isStudentView, user?.id]);

  useEffect(() => {
    const quizId = searchParams.get('quizId');
    if (!quizId) return;
    void startQuizById(quizId);
  }, [searchParams]);

  const startQuizById = async (quizId: string, practice = false) => {
    setQuizLoadError(null);
    setPlayResult(null);
    setLastPlayedQuizId(quizId);
    try {
      const detail = await fetchQuiz(quizId);
      if (detail.questions.length === 0) {
        setQuizLoadError('This quiz has no questions.');
        return;
      }
      const practiceMode = practice && canManageQuiz;
      setLastPracticeMode(practiceMode);
      setPlay({ quizId, practice: practiceMode });
    } catch {
      setQuizLoadError('Quiz not found or has no questions.');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const ok = await confirmDialog({
      title: 'Delete quiz?',
      message: 'This quiz will be permanently deleted.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingQuizId(quizId);
    try {
      await deleteQuiz(quizId);
      await fetchQuizList(true);
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleQuizDone = (outcome: QuizPlayResult) => {
    setPlay(null);
    setPlayResult(outcome);
    if (outcome.practiceMode) return;
    if (isStudentView && user?.id) {
      void fetchStudentQuizzes(user.id, true);
    } else {
      void fetchQuizList(true);
    }
  };

  const handleRetry = () => {
    if (!lastPlayedQuizId) return;
    setPlayResult(null);
    void startQuizById(lastPlayedQuizId, lastPracticeMode);
  };

  const backControl = useMemo(
    () => (
      <Button href="/practice" variant="ghost" className={styles.backBtn} aria-label="Back to practice">
        <ArrowLeft size={18} aria-hidden />
      </Button>
    ),
    [],
  );

  if (play) {
    return (
      <div className={`${styles.page} container container--page`}>
        <div className={styles.stack}>
          <PageHeader
            className={styles.pageHeader}
            titleClassName={styles.pageTitle}
            subtitleClassName={styles.pageSub}
            title={siteContent.quiz.title}
            subtitle={siteContent.quiz.subtitle}
            back={
              <Button
                variant="ghost"
                className={styles.backBtn}
                onClick={() => setPlay(null)}
                aria-label="Back to quiz overview"
              >
                <ArrowLeft size={18} aria-hidden />
              </Button>
            }
          />
          <QuizPlaySession
            quizId={play.quizId}
            studentId={play.practice ? undefined : user?.id}
            practiceMode={play.practice}
            onCancel={() => setPlay(null)}
            onDone={handleQuizDone}
          />
        </div>
      </div>
    );
  }

  if (playResult) {
    return (
      <div className={`${styles.page} container container--page`}>
        <div className={styles.stack}>
          <PageHeader
            className={styles.pageHeader}
            titleClassName={styles.pageTitle}
            subtitleClassName={styles.pageSub}
            title={siteContent.quiz.title}
            subtitle={siteContent.quiz.subtitle}
            back={backControl}
          />
          <QuizResultScreen
            result={playResult}
            onClose={() => setPlayResult(null)}
            onRetry={lastPlayedQuizId ? handleRetry : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} container container--page`}>
      <div className={styles.stack}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          title={siteContent.quiz.title}
          subtitle={siteContent.quiz.subtitle}
          back={backControl}
        />

        {quizLoadError ? (
          <div className={styles.quizLoadError} role="alert">
            {quizLoadError}
          </div>
        ) : null}

        <div className={styles.intro}>
          <section className={styles.introCard} aria-labelledby="quiz-hero-title">
            <div className={styles.introIcon} aria-hidden>
              <Target size={22} />
            </div>
            <h2 id="quiz-hero-title" className={styles.introTitle}>
              {introTitle}
            </h2>
            <p className={styles.introDesc}>
              {introQuizId
                ? `${introQuestionCount} questions · about ${introDurationMin} minutes.`
                : 'Create a quiz in the grid below, then press Start Quiz.'}
            </p>
            <div className={styles.introStats}>
              <StatTile label="Questions" value={introQuestionCount} className={styles.introStat} />
              <StatTile label="Minutes" value={`~${introDurationMin}`} className={styles.introStat} />
              <StatTile label="Quizzes" value={totalQuizzes} className={styles.introStat} />
            </div>
            <Button
              type="button"
              variant="primary"
              className={styles.startBtn}
              disabled={!introQuizId}
              onClick={() => introQuizId && void startQuizById(introQuizId)}
            >
              Start quiz
            </Button>
          </section>

          <section className={styles.manageSection} aria-labelledby="quiz-manage-heading">
            <div className={styles.manageHead}>
              <h2 id="quiz-manage-heading" className={styles.manageTitle}>
                {isStudentView ? 'Your quizzes' : 'Manage quizzes'}
              </h2>
              <p className={styles.manageSub}>
                {isStudentView
                  ? 'Complete assigned quizzes and review your scores'
                  : 'Create, assign and track quiz progress'}
              </p>
            </div>
            <div className={styles.manageGrid}>
              {!isStudentView ? (
                <CreateQuizCard
                  defaultSource="vocabulary"
                  onGenerated={() => void fetchQuizList(true)}
                  onPlay={(quizId) => void startQuizById(quizId, true)}
                />
              ) : null}
              <QuizAssignmentCards
                embedded
                quizzes={isStudentView ? assignedQuizzes : staffQuizzes}
                onPlay={(quizId) => void startQuizById(quizId, false)}
                onPractice={isStudentView ? undefined : (quizId) => void startQuizById(quizId, true)}
                onDelete={isStudentView ? undefined : (quizId) => void handleDeleteQuiz(quizId)}
                deletingQuizId={deletingQuizId}
                emptyMessage={
                  isStudentView
                    ? 'No quizzes assigned yet. Check back after your next lesson.'
                    : 'Generate a quiz from your vocabulary to get started.'
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
