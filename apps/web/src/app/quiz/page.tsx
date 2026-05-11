'use client';

import { useMemo, useState } from 'react';
import { QuizQuestionDto } from '@soenglish/shared-types';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock,
  FileText,
  PencilLine,
  Play,
  Plus,
  Target,
  ThumbsUp,
  Trophy,
  UserPlus,
  X,
} from 'lucide-react';
import { Button, Field, PageHeader } from '../../components/ui';
import {
  activeMockUser,
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
import { QuizProgress, QuizResultStats, QuizTopicsGrid } from './sections';
import styles from './page.module.scss';

export default function QuizPage() {
  if (!canView('quiz', activeMockUser.role)) return null;
  const isStudentView = activeMockUser.role === USER_ROLE.student.id;
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
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
  const [students] = useState<MockQuizStudent[]>(() =>
    getAssignableStudentsForUser(activeMockUser.id, activeMockUser.role),
  );
  const [quizzes, setQuizzes] = useState<MockQuizCard[]>(() =>
    getQuizCardsForUser(activeMockUser.id, activeMockUser.role),
  );
  const latestQuiz = useMemo(
    () => getLatestQuizForUser(activeMockUser.id, activeMockUser.role),
    [quizzes],
  );
  const totalTopics = useMemo(() => new Set(quizzes.map((quiz) => quiz.category)).size, [quizzes]);
  const introTopics = useMemo(
    () => getQuizTopicsForUser(activeMockUser.id, activeMockUser.role),
    [quizzes],
  );

  const q = questions[current];

  const refreshQuizzes = () => {
    setQuizzes(getQuizCardsForUser(activeMockUser.id, activeMockUser.role));
  };

  const startQuizById = (quizId: string) => {
    const nextQuestions = getQuizQuestionsForQuizId(quizId);
    if (nextQuestions.length === 0) return;
    setQuestions(nextQuestions);
    setPhase('quiz');
    setCurrent(0);
    setAnswers([]);
    setScore(0);
    setSelected(null);
    setFillAnswer('');
    setShowExp(false);
  };

  const handleAssign = () => {
    if (!selectedQuiz || selectedStudents.length === 0 || !dueDate) return;
    assignQuizToStudents({
      quizId: selectedQuiz.id,
      studentIds: selectedStudents.map((id) => Number(id)),
      dueDate,
      personalNote,
      assignedByUserId: activeMockUser.id,
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
    setPhase('intro');
  };

  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={siteContent.quiz.title}
        subtitle={`${siteContent.quiz.subtitle} · ${activeMockUser.role}`}
        actions={
          <Link href="/practice" className={styles.backBtn}>
            <ChevronRight size={14} className={styles.backBtnIcon} />
            Back
          </Link>
        }
      />

      {phase === 'intro' && (
        <div className={styles.intro}>
          <div className={styles.introCard}>
            <div className={styles.introIcon}><Target size={22} /></div>
            <h2 className={styles.introTitle}>{latestQuiz?.title ?? 'No available quizzes yet'}</h2>
            <p className={styles.introDesc}>
              {latestQuiz
                ? `${latestQuiz.questions} estimated questions with about ${latestQuiz.duration} minutes to finish.`
                : 'New quizzes will appear here as soon as they are created in mocks.'}
            </p>
            <div className={styles.introMeta}>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>{latestQuiz?.questions ?? 0}</span>
                <span className={styles.introMetaLbl}>Questions</span>
              </div>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>~{latestQuiz?.duration ?? 0}</span>
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
              disabled={!latestQuiz}
              onClick={() => latestQuiz && startQuizById(latestQuiz.id)}
            >
              Start Quiz →
            </Button>
          </div>
          <QuizTopicsGrid topics={introTopics} />
          <div className={styles.manageSection}>
            <div className={styles.manageHead}>
              <h3 className={styles.manageTitle}>Manage quizzes</h3>
              <p className={styles.manageSub}>Create, assign and track quiz progress</p>
            </div>
            <div className={styles.manageGrid}>
              {quizzes.map((quiz) => (
                <div key={quiz.id} className={styles.quizCard}>
                  <div className={styles.quizCardHead}>
                    <div>
                      <div className={styles.quizCardTitleRow}>
                        <h4 className={styles.quizCardTitle}>{quiz.title}</h4>
                        {quiz.completed && !isStudentView ? (
                          <CheckCircle2 size={16} className={styles.quizDoneIcon} />
                        ) : null}
                      </div>
                      <div className={styles.quizBadges}>
                        <span className={styles.quizBadgeBlue}>{quiz.category}</span>
                        <span
                          className={
                            quiz.difficulty === 'hard'
                              ? styles.quizBadgeRose
                              : quiz.difficulty === 'medium'
                                ? styles.quizBadgeAmber
                                : styles.quizBadgeGreen
                          }
                        >
                          {quiz.difficulty}
                        </span>
                      </div>
                    </div>
                    {!isStudentView ? (
                      <Button
                        type="button"
                        className={styles.quizDrawerBtn}
                        onClick={() => setShowStatsDrawer(quiz)}
                      >
                        <Award size={14} />
                      </Button>
                    ) : null}
                  </div>

                  {quiz.assignedTo?.length && !isStudentView ? (
                    <div className={styles.assignmentBox}>
                      <div className={styles.assignmentTop}>
                        <span>Assigned to</span>
                        {quiz.dueDate ? (
                          <span className={styles.assignmentDue}>
                            Due {new Date(quiz.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ) : null}
                      </div>
                      <div className={styles.assignmentAvatars}>
                        {quiz.assignedTo.slice(0, 3).map((student) => (
                          <span key={student.id} className={styles.assignmentAvatar} title={student.name}>
                            {student.avatar}
                          </span>
                        ))}
                        {quiz.assignedTo.length > 3 ? (
                          <span className={styles.assignmentMore}>+{quiz.assignedTo.length - 3}</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className={styles.quizMeta}>
                    <span>
                      <FileText size={14} /> {quiz.questions} questions
                    </span>
                    <span>
                      <Clock size={14} /> {quiz.duration} min
                    </span>
                  </div>

                  {quiz.completed && quiz.score !== undefined && !isStudentView ? (
                    <div className={styles.quizScoreBox}>
                      <span>Average score</span>
                      <strong>{quiz.score}%</strong>
                    </div>
                  ) : null}

                  <div className={styles.quizActions}>
                    {!isStudentView ? (
                      <Button
                        type="button"
                        className={styles.assignBtn}
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setShowAssignModal(true);
                        }}
                      >
                        <UserPlus size={14} /> Assign
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      className={styles.quizPlayBtn}
                      onClick={() => {
                        startQuizById(quiz.id);
                      }}
                      style={!isStudentView ? undefined : { gridColumn: '1 / -1' }}
                    >
                      <Play size={14} />
                      {quiz.completed && !isStudentView ? 'Review Results' : 'Start Quiz'}
                    </Button>
                  </div>
                </div>
              ))}
              {!isStudentView ? (
                <button type="button" className={styles.createQuizCard}>
                  <span className={styles.createQuizIcon}>
                    <Plus size={22} />
                  </span>
                  <span>Create New Quiz</span>
                </button>
              ) : null}
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
              {score} / {questions.length}
            </div>
            <div className={styles.resultPct}>{pct}% correct</div>

            <QuizResultStats score={score} total={questions.length} />

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
                      <button
                        key={student.id}
                        type="button"
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
                      </button>
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
