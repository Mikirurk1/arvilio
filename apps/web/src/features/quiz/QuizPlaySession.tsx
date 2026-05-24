'use client';

import { useEffect, useState } from 'react';
import type { QuizDetailDto, QuizQuestionDto } from '@pkg/types';
import { Check, CircleX, PencilLine, Target } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { useAuth } from '../../lib/auth-context';
import { usePracticeSessionTracker } from '../../lib/practice-session-tracker';
import { useQuizzesStore } from '../../stores/quizzes-store';
import styles from '../../app/quiz/page.module.scss';

type SessionRow = { selected: number | null; fill: string };

type Props = {
  quizId: string;
  studentId?: string;
  practiceMode?: boolean;
  onDone: (result: {
    score: number;
    correctCount: number;
    totalCount: number;
    practiceMode: boolean;
  }) => void;
  onCancel?: () => void;
};

export function QuizPlaySession({
  quizId,
  studentId,
  practiceMode = false,
  onDone,
  onCancel,
}: Props) {
  const fetchQuiz = useQuizzesStore((s) => s.fetchQuiz);
  const submitQuizAttempt = useQuizzesStore((s) => s.submitQuizAttempt);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizDetailDto | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [showExp, setShowExp] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [session, setSession] = useState<SessionRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const sessionActive = !loading && !error && quiz !== null;
  usePracticeSessionTracker(user?.id, 'quiz', sessionActive);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchQuiz(quizId)
      .then((detail) => {
        if (cancelled) return;
        if (detail.questions.length === 0) {
          setError('This quiz has no questions.');
          return;
        }
        setQuiz(detail);
        setSession(detail.questions.map(() => ({ selected: null, fill: '' })));
        setCurrent(0);
        setSelected(null);
        setFillAnswer('');
        setShowExp(false);
        setAnswers([]);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load quiz');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchQuiz, quizId]);

  const q: QuizQuestionDto | undefined = quiz?.questions[current];

  const checkAnswer = () => {
    if (!q) return;
    let correct = false;
    if (q.type === 'multiple-choice') {
      correct = selected === q.correct;
    } else {
      correct = fillAnswer.trim().toLowerCase() === String(q.correct).trim().toLowerCase();
    }
    setSession((prev) => {
      const next = [...prev];
      next[current] = { selected, fill: fillAnswer };
      return next;
    });
    setAnswers((prev) => [...prev, correct]);
    setShowExp(true);
  };

  const submit = async (sessionRows: SessionRow[]) => {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitQuizAttempt({
        quizId: quiz.id,
        studentId: practiceMode ? undefined : (studentId ?? user?.id),
        practiceMode,
        answers: buildAnswerPayload(quiz.questions, sessionRows),
      });
      onDone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!quiz) return;
    const updatedSession = [...session];
    updatedSession[current] = { selected, fill: fillAnswer };
    setSession(updatedSession);
    setShowExp(false);
    setSelected(null);
    setFillAnswer('');
    if (current + 1 >= quiz.questions.length) {
      void submit(updatedSession);
      return;
    }
    const nextIndex = current + 1;
    setCurrent(nextIndex);
    const saved = updatedSession[nextIndex];
    setSelected(saved?.selected ?? null);
    setFillAnswer(saved?.fill ?? '');
  };

  if (loading) {
    return <div className={styles.empty}>Loading quiz…</div>;
  }
  if (error && !quiz) {
    return <div className={styles.loadError}>{error}</div>;
  }
  if (!quiz || !q) return null;

  return (
    <div className={styles.quizArea}>
      {practiceMode ? (
        <p className={styles.quizPracticeBanner}>
          Practice mode — results are not saved for the student.
        </p>
      ) : null}
      {error ? <div className={styles.loadError}>{error}</div> : null}
      <div className={styles.scoreRow}>
        {answers.map((ok, i) => (
          <div
            key={i}
            className={`${styles.scoreDot} ${ok ? styles.scoreDotGreen : styles.scoreDotRed}`}
          />
        ))}
        {Array.from({ length: quiz.questions.length - answers.length }).map((_, i) => (
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

        {q.type === 'multiple-choice' && q.options ? (
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
                <Button
                  key={i}
                  type="button"
                  className={cls}
                  onClick={() => !showExp && setSelected(i)}
                  disabled={showExp}
                >
                  <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </Button>
              );
            })}
          </div>
        ) : null}

        {q.type === 'fill-in' ? (
          <div className={styles.fillArea}>
            <Field
              className={styles.fillInput}
              placeholder="Type your answer here..."
              value={fillAnswer}
              onChange={(e) => !showExp && setFillAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && !showExp && fillAnswer.trim() && checkAnswer()
              }
              disabled={showExp}
            />
          </div>
        ) : null}

        {showExp ? (
          <div
            className={`${styles.explanation} ${answers[answers.length - 1] ? styles.expCorrect : styles.expWrong}`}
          >
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
        ) : null}

        <div className={styles.qActions}>
          {onCancel ? (
            <Button type="button" className={styles.finishBtn} onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          ) : null}
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
            <Button type="button" className={styles.nextBtn} onClick={next} disabled={submitting}>
              {current + 1 >= quiz.questions.length
                ? practiceMode
                  ? 'Finish practice'
                  : 'Submit quiz'
                : 'Next Question →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function buildAnswerPayload(
  questions: QuizDetailDto['questions'],
  session: SessionRow[],
): Array<{ questionId: string; givenAnswer: string }> {
  return questions.map((question, index) => {
    const row = session[index];
    if (question.type === 'multiple-choice') {
      return {
        questionId: question.id,
        givenAnswer: row?.selected != null ? String(row.selected) : '',
      };
    }
    return {
      questionId: question.id,
      givenAnswer: row?.fill?.trim() ?? '',
    };
  });
}
