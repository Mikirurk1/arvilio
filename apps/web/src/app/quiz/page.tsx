'use client';

import { useEffect, useMemo, useState } from 'react';
import type { QuizQuestionDto } from '@pkg/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  CircleX,
  PencilLine,
  Target,
  ThumbsUp,
  Trophy,
  X,
} from 'lucide-react';
import { Button, Field, PageHeader } from '../../components/ui';
import { confirmDialog } from '../../features/confirm';
import {
  assignQuizToStudents,
  canView,
  getAssignableStudentsForUser,
  getLatestQuizForUser,
  getQuizCardsForUser,
  getQuizQuestionsForQuizId,
  getQuizTopicsForUser,
  siteContent,
  USER_ROLE,
  type MockQuizCard,
  type MockQuizStudent,
} from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { useAuth } from '../../lib/auth-context';
import { usePracticeSessionTracker } from '../../lib/practice-session-tracker';
import { canEdit } from '../../lib/roles';
import { QuizProgress, QuizResultStats, QuizTopicsGrid } from './sections';
import { CreateQuizCard } from '../../components/quiz/CreateQuizCard';
import { QuizAssignmentCards } from '../../components/quiz/QuizAssignmentCards';
import { QuizPlaySession } from '../../features/quiz/QuizPlaySession';
import { useQuizzesStore } from '../../stores/quizzes-store';
import styles from './page.module.scss';

type PlayState = {
  quizId: string;
  practice: boolean;
};

type QuizResultState = {
  score: number;
  correctCount: number;
  totalCount: number;
  practiceMode: boolean;
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
  const [playResult, setPlayResult] = useState<QuizResultState | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  usePracticeSessionTracker(user?.id, 'quiz', phase === 'quiz' || play !== null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<MockQuizCard | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [showStatsDrawer, setShowStatsDrawer] = useState<MockQuizCard | null>(null);
  const [quizLoadError, setQuizLoadError] = useState<string | null>(null);
  const [students] = useState<MockQuizStudent[]>(() =>
    getAssignableStudentsForUser(activeUser.id, activeUser.role),
  );
  const [quizzes, setQuizzes] = useState<MockQuizCard[]>(() =>
    getQuizCardsForUser(activeUser.id, activeUser.role),
  );
  const latestQuiz = useMemo(
    () => getLatestQuizForUser(activeUser.id, activeUser.role),
    [quizzes, activeUser.id, activeUser.role],
  );
  const assignedQuizzes = studentQuizzes.data ?? [];
  const firstIncompleteAssigned = assignedQuizzes.find((q) => !q.attempt?.finishedAt) ?? null;
  const latestBackendQuiz = isStudentView
    ? (firstIncompleteAssigned ?? assignedQuizzes[0] ?? null)
    : (backendQuizzes.data?.[0] ?? null);
  const introQuizId = latestBackendQuiz?.id ?? latestQuiz?.id ?? null;
  const introTitle = latestBackendQuiz?.title ?? latestQuiz?.title ?? 'No available quizzes yet';
  const introQuestionCount = latestBackendQuiz?.questionCount ?? latestQuiz?.questions ?? 0;
  const introDurationMin = Math.max(1, Math.round(introQuestionCount * 0.75));

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
  const totalTopics = useMemo(() => new Set(quizzes.map((quiz) => quiz.category)).size, [quizzes]);
  const introTopics = useMemo(
    () => getQuizTopicsForUser(activeUser.id, activeUser.role),
    [quizzes, activeUser.id, activeUser.role],
  );

  const q = questions[current];

  const refreshQuizzes = () => {
    setQuizzes(getQuizCardsForUser(activeUser.id, activeUser.role));
  };

  const beginQuiz = (nextQuestions: QuizQuestionDto[]) => {
    setQuestions(nextQuestions);
    setPhase('quiz');
    setCurrent(0);
    setAnswers([]);
    setScore(0);
    setSelected(null);
    setFillAnswer('');
    setShowExp(false);
    setQuizLoadError(null);
  };

  const startQuizById = async (quizId: string, practice = false) => {
    setQuizLoadError(null);
    setPlayResult(null);
    try {
      const detail = await fetchQuiz(quizId);
      if (detail.questions.length > 0) {
        setPlay({ quizId, practice: practice && canManageQuiz });
        return;
      }
    } catch {
      // Fall back to demo mocks for legacy ids.
    }
    const mockQuestions = getQuizQuestionsForQuizId(quizId);
    if (mockQuestions.length > 0) {
      beginQuiz(mockQuestions);
      return;
    }
    setQuizLoadError('Quiz not found or has no questions.');
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
    } catch {
      // Store surfaces errors via list refresh failure; user can retry.
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleQuizDone = (outcome: QuizResultState) => {
    setPlay(null);
    setPlayResult(outcome);
    setPhase('intro');
    if (outcome.practiceMode) return;
    if (isStudentView && user?.id) {
      void fetchStudentQuizzes(user.id, true);
    } else {
      void fetchQuizList(true);
    }
  };

  const handleAssign = () => {
    if (!selectedQuiz || selectedStudents.length === 0 || !dueDate) return;
    assignQuizToStudents({
      quizId: selectedQuiz.id,
      studentIds: selectedStudents.map((id) => Number(id)),
      dueDate,
      personalNote,
      assignedByUserId: activeUser.id,
    });
    refreshQuizzes();
    setShowAssignModal(false);
    setSelectedQuiz(null);
    setSelectedStudents([]);
    setDueDate('');
    setPersonalNote('');
  };

  const checkAnswer = () => {
    if (!q) return;
    let correct = false;
    if (q.type === 'multiple-choice') {
      correct = selected === q.correct;
    } else {
      correct = fillAnswer.trim().toLowerCase() === (q.correct as string).toLowerCase();
    }
    setAnswers((prev) => [...prev, correct]);
    if (correct) setScore((s) => s + 1);
    setShowExp(true);
  };

  const next = () => {
    setSelected(null);
    setFillAnswer('');
    setShowExp(false);
    if (current + 1 >= questions.length) {
      setPhase('result');
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const finishQuiz = () => {
    setShowFinishConfirm(false);
    setPhase('result');
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setFillAnswer('');
    setShowExp(false);
    setAnswers([]);
    setScore(0);
    setPlayResult(null);
    setPhase('intro');
  };

  const resultScore = playResult?.correctCount ?? score;
  const resultTotal = playResult?.totalCount ?? questions.length;
  const pct =
    playResult?.score ??
    (questions.length ? Math.round((score / questions.length) * 100) : 0);

  if (!canView('quiz', activeUser.role)) return null;

  if (play) {
    return (
      <div className={`${styles.page} container container--page`}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          title={siteContent.quiz.title}
          subtitle={siteContent.quiz.subtitle}
          back={
            <Button type="button" className={styles.backBtn} onClick={() => setPlay(null)}>
              <ChevronRight size={14} className={styles.backBtnIcon} />
              Back
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
    );
  }

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={siteContent.quiz.title}
        subtitle={`${siteContent.quiz.subtitle} · ${activeUser.role}`}
        back={
          <Link href="/practice" className={styles.backBtn}>
            <ChevronRight size={14} className={styles.backBtnIcon} />
            Back
          </Link>
        }
      />

      {phase === 'intro' && quizLoadError ? (
        <div className={styles.quizLoadError}>{quizLoadError}</div>
      ) : null}

      {phase === 'intro' && (
        <div className={styles.intro}>
          <div className={styles.introCard}>
            <div className={styles.introIcon}><Target size={22} /></div>
            <h2 className={styles.introTitle}>{introTitle}</h2>
            <p className={styles.introDesc}>
              {introQuizId
                ? `${introQuestionCount} questions · about ${introDurationMin} minutes.`
                : 'Create a quiz in the grid below, then press Start Quiz.'}
            </p>
            <div className={styles.introMeta}>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>{introQuestionCount}</span>
                <span className={styles.introMetaLbl}>Questions</span>
              </div>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>~{introDurationMin}</span>
                <span className={styles.introMetaLbl}>Minutes</span>
              </div>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>{totalTopics}</span>
                <span className={styles.introMetaLbl}>Topics</span>
              </div>
            </div>
            <Button
              type="button"
              className={styles.startBtn}
              disabled={!introQuizId}
              onClick={() => introQuizId && void startQuizById(introQuizId)}
            >
              Start Quiz →
            </Button>
          </div>
          <QuizTopicsGrid topics={introTopics} />
          <div className={styles.manageSection}>
            <div className={styles.manageHead}>
              <h3 className={styles.manageTitle}>{isStudentView ? 'Your quizzes' : 'Manage quizzes'}</h3>
              <p className={styles.manageSub}>
                {isStudentView
                  ? 'Complete assigned quizzes and review your scores'
                  : 'Create, assign and track quiz progress'}
              </p>
            </div>
            {playResult && !playResult.practiceMode ? (
              <div className={styles.quizScoreBox} role="status">
                <span>
                  Quiz saved · {playResult.correctCount}/{playResult.totalCount} correct
                </span>
                <strong>{playResult.score}%</strong>
              </div>
            ) : null}
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
                quizzes={isStudentView ? assignedQuizzes : (backendQuizzes.data ?? [])}
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
          </div>
        </div>
      )}

      {phase === 'quiz' && q ? (
        <div className={styles.quizArea}>
          <QuizProgress current={current + 1} total={questions.length} />

          <div className={styles.scoreRow}>
            {answers.map((ok, i) => (
              <div key={i} className={`${styles.scoreDot} ${ok ? styles.scoreDotGreen : styles.scoreDotRed}`} />
            ))}
            {Array.from({ length: questions.length - answers.length }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.scoreDotEmpty} />
            ))}
          </div>

          <div className={styles.questionCard}>
            <div className={styles.qType}>
              {q.type === 'multiple-choice' ? (
                <>
                  <Target size={14} /> Multiple choice
                </>
              ) : (
                <>
                  <PencilLine size={14} /> Fill in the blank
                </>
              )}
            </div>
            <h2 className={styles.qText}>{q.question}</h2>

            {q.type === 'multiple-choice' && q.options && (
              <div className={styles.options}>
                {q.options.map((opt, i) => {
                  let cls = styles.option;
                  if (showExp) {
                    if (i === q.correct) cls = `${styles.option} ${styles.optionCorrect}`;
                    else if (i === selected) cls = `${styles.option} ${styles.optionWrong}`;
                  } else if (i === selected) {
                    cls = `${styles.option} ${styles.optionSelected}`;
                  }
                  return (
                    <Button key={i} type="button" className={cls} onClick={() => !showExp && setSelected(i)} disabled={showExp}>
                      <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </Button>
                  );
                })}
              </div>
            )}

            {q.type === 'fill-in' && (
              <div className={styles.fillArea}>
                <Field
                  className={`${styles.fillInput} ${
                    showExp ? (answers[answers.length - 1] ? styles.fillCorrect : styles.fillWrong) : ''
                  }`}
                  placeholder="Type your answer here..."
                  value={fillAnswer}
                  onChange={(e) => !showExp && setFillAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !showExp && fillAnswer && checkAnswer()}
                  disabled={showExp}
                />
                {showExp && !answers[answers.length - 1] && (
                  <div className={styles.fillCorrectAnswer}>
                    Correct: <strong>{q.correct as string}</strong>
                  </div>
                )}
              </div>
            )}

            {showExp && (
              <div className={`${styles.explanation} ${answers[answers.length - 1] ? styles.expCorrect : styles.expWrong}`}>
                <div className={styles.expIcon}>
                  {answers[answers.length - 1] ? (
                    <>
                      <Check size={15} /> Correct!
                    </>
                  ) : (
                    <>
                      <CircleX size={15} /> Not quite
                    </>
                  )}
                </div>
                <div className={styles.expText}>{q.explanation}</div>
              </div>
            )}

            <div className={styles.qActions}>
              <Button
                type="button"
                className={styles.finishBtn}
                onClick={() => setShowFinishConfirm(true)}
              >
                Finish quiz
              </Button>
              {!showExp ? (
                <Button
                  type="button"
                  className={styles.checkBtn}
                  onClick={checkAnswer}
                  disabled={q.type === 'multiple-choice' ? selected === null : !fillAnswer.trim()}
                >
                  Check Answer
                </Button>
              ) : (
                <Button type="button" className={styles.nextBtn} onClick={next}>
                  {current + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {phase === 'result' && (
        <div className={styles.result}>
          <div className={styles.resultCard}>
            <div className={styles.resultEmoji}>
              {pct >= 80 ? <Trophy size={28} /> : pct >= 60 ? <ThumbsUp size={28} /> : <BookOpen size={28} />}
            </div>
            <h2 className={styles.resultTitle}>{pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job!' : 'Keep practicing!'}</h2>
            <div className={styles.resultScore}>
              {resultScore} / {resultTotal}
            </div>
            <div className={styles.resultPct}>{pct}% correct</div>

            <QuizResultStats score={resultScore} total={resultTotal} />

            <div className={styles.resultAnswers}>
              {questions.map((question, i) => (
                <div key={question.id} className={`${styles.resultAnswer} ${answers[i] ? styles.raCorrect : styles.raWrong}`}>
                  <span className={styles.raIcon}>{answers[i] ? <Check size={14} /> : <CircleX size={14} />}</span>
                  <span className={styles.raQ}>
                    {question.question.length > 60 ? `${question.question.slice(0, 60)}…` : question.question}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.resultActions}>
              <Button type="button" className={styles.retryBtn} onClick={restart}>
                Try again
              </Button>
            </div>
          </div>
        </div>
      )}
      {!isStudentView && showAssignModal && selectedQuiz ? (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.assignModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h3>Assign to students</h3>
                <p>{selectedQuiz.title}</p>
              </div>
              <Button type="button" className={styles.modalCloseBtn} onClick={() => setShowAssignModal(false)}>
                <X size={16} />
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGroup}>
                <label>Select students</label>
                <div className={styles.studentGrid}>
                  {students.map((student) => {
                    const selectedStudent = selectedStudents.includes(student.id);
                    return (
                      <Button
                        key={student.id}
                        type="button"
                        variant="ghost"
                        className={`${styles.studentPick} ${selectedStudent ? styles.studentPickActive : ''}`}
                        onClick={() => {
                          setSelectedStudents((prev) =>
                            prev.includes(student.id)
                              ? prev.filter((id) => id !== student.id)
                              : [...prev, student.id],
                          );
                        }}
                      >
                        <span className={styles.studentPickAvatar}>{student.avatar}</span>
                        <span>{student.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.modalGroup}>
                <label>Due date</label>
                <div className={styles.dateWrap}>
                  <CalendarIcon size={16} />
                  <Field type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className={styles.modalGroup}>
                <label>Personal note (optional)</label>
                <Field
                  as="textarea"
                  rows={3}
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Add a note for students..."
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button type="button" className={styles.modalCancelBtn} onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button type="button" className={styles.modalSubmitBtn} disabled={selectedStudents.length === 0 || !dueDate} onClick={handleAssign}>
                Assign to {selectedStudents.length} student{selectedStudents.length === 1 ? '' : 's'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {!isStudentView && showStatsDrawer ? (
        <div className={styles.drawerOverlay} onClick={() => setShowStatsDrawer(null)}>
          <aside className={styles.statsDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Quiz details</h3>
              <Button type="button" className={styles.modalCloseBtn} onClick={() => setShowStatsDrawer(null)}>
                <X size={16} />
              </Button>
            </div>
            <div className={styles.drawerBody}>
              <div className={styles.drawerTitle}>{showStatsDrawer.title}</div>
              <div className={styles.drawerStatRow}>
                <span>Difficulty</span>
                <strong>{showStatsDrawer.difficulty}</strong>
              </div>
              <div className={styles.drawerStatRow}>
                <span>Questions</span>
                <strong>{showStatsDrawer.questions}</strong>
              </div>
              <div className={styles.drawerStatRow}>
                <span>Duration</span>
                <strong>{showStatsDrawer.duration} min</strong>
              </div>
              {showStatsDrawer.score !== undefined ? (
                <div className={styles.drawerScore}>
                  <span>Average score</span>
                  <strong>{showStatsDrawer.score}%</strong>
                </div>
              ) : null}
              {showStatsDrawer.assignedTo?.length ? (
                <div className={styles.drawerList}>
                  <div className={styles.drawerListTitle}>Assigned students</div>
                  {showStatsDrawer.assignedTo.map((student) => (
                    <div key={student.id} className={styles.drawerListRow}>
                      <span>{student.name}</span>
                      <span>{student.status ?? 'pending'}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <Button type="button" className={styles.drawerStartBtn} onClick={() => startQuizById(showStatsDrawer.id)}>
                Start quiz <ChevronRight size={14} />
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
      {showFinishConfirm ? (
        <div className={styles.modalOverlay} onClick={() => setShowFinishConfirm(false)}>
          <div className={styles.finishModal} onClick={(e) => e.stopPropagation()}>
            <h3>Finish quiz now?</h3>
            <p>Your current progress will be saved and results will be shown immediately.</p>
            <div className={styles.finishActions}>
              <Button type="button" className={styles.modalCancelBtn} onClick={() => setShowFinishConfirm(false)}>
                Continue quiz
              </Button>
              <Button type="button" className={styles.modalSubmitBtn} onClick={finishQuiz}>
                Yes, finish
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
