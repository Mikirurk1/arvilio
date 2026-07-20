'use client';

import { useEffect, useMemo, useState } from 'react';
import type { QuizDetailDto } from '@pkg/types';
import { Check, CircleX, PencilLine, Target } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { WordCardAudioButton } from '../vocabulary/WordCardAudioButton';
import { useAuth } from '../../lib/auth-context';
import { isFillInAnswerCorrect } from '../../lib/quiz-grading';
import type { QuizPlayQuestion } from '../../lib/quiz-questions';
import { usePracticeSessionTracker } from '../../lib/practice-session-tracker';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { useQuizzesStore } from '../../stores/quizzes-store';
import type { QuizPlayResult, QuizReviewItem } from './quiz-play-types';
import styles from '../../app/quiz/page.module.scss';

type SessionRow = { selected: number | null; fill: string };

type Props = {
  quizId: string;
  studentId?: string;
  practiceMode?: boolean;
  onDone: (result: QuizPlayResult) => void;
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
  const fetchWordsByIds = useVocabularyStore((s) => s.fetchWordsByIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizDetailDto | null>(null);
  const [questions, setQuestions] = useState<QuizPlayQuestion[]>([]);
  const [audioByWordId, setAudioByWordId] = useState<Record<string, string | null>>({});
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
        setQuestions(detail.questions as QuizPlayQuestion[]);
        setSession(detail.questions.map(() => ({ selected: null, fill: '' })));
        setCurrent(0);
        setSelected(null);
        setFillAnswer('');
        setShowExp(false);
        setAnswers([]);
        const wordIds = detail.questions
          .map((question) => question.wordId)
          .filter((id): id is string => Boolean(id));
        if (wordIds.length > 0) {
          void fetchWordsByIds(wordIds).then((words) => {
            if (cancelled) return;
            const map: Record<string, string | null> = {};
            for (const word of words) {
              map[word.id] = word.audioUrl ?? null;
            }
            setAudioByWordId(map);
          });
        } else {
          setAudioByWordId({});
        }
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
  }, [fetchQuiz, fetchWordsByIds, quizId]);

  const q = questions[current];
  const lastCorrect = answers.length > 0 ? answers[answers.length - 1] : false;
  const currentAudioUrl = useMemo(
    () => (q?.wordId ? audioByWordId[q.wordId] ?? null : null),
    [audioByWordId, q?.wordId],
  );

  const buildReview = (sessionRows: SessionRow[]): QuizReviewItem[] =>
    questions.map((question, index) => {
      const row = sessionRows[index];
      if (question.type === 'multiple-choice') {
        const selectedIndex = row?.selected ?? null;
        const isCorrect = selectedIndex === question.correct;
        return {
          questionId: question.id,
          prompt: question.question,
          explanation: question.explanation,
          isCorrect,
          userAnswer:
            selectedIndex != null && question.options?.[selectedIndex]
              ? question.options[selectedIndex]
              : '—',
          correctAnswer: question.options?.[question.correct as number] ?? String(question.correct),
          wordId: question.wordId,
        };
      }
      const given = row?.fill ?? '';
      const expected = String(question.correct);
      return {
        questionId: question.id,
        prompt: question.question,
        explanation: question.explanation,
        isCorrect: isFillInAnswerCorrect(given, expected),
        userAnswer: given.trim() || '—',
        correctAnswer: expected,
        wordId: question.wordId,
      };
    });

  const checkAnswer = () => {
    if (!q) return;
    let correct = false;
    if (q.type === 'multiple-choice') {
      correct = selected === q.correct;
    } else {
      correct = isFillInAnswerCorrect(fillAnswer, String(q.correct));
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
    const review = buildReview(sessionRows);
    try {
      const result = await submitQuizAttempt({
        quizId: quiz.id,
        studentId: practiceMode ? undefined : (studentId ?? user?.id),
        practiceMode,
        answers: buildAnswerPayload(questions, sessionRows),
      });
      onDone({ ...result, review });
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
    if (current + 1 >= questions.length) {
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
      <div className={styles.scoreRow} aria-hidden>
        {answers.map((ok, i) => (
          <div
            key={i}
            className={`${styles.scoreDot} ${ok ? styles.scoreDotGreen : styles.scoreDotRed}`}
          />
        ))}
        {Array.from({ length: questions.length - answers.length }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.scoreDotEmpty} />
        ))}
      </div>

      <div key={current} className={styles.questionCard}>
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
                  variant="ghost"
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
              className={`${styles.fillInput} ${
                showExp ? (lastCorrect ? styles.fillCorrect : styles.fillWrong) : ''
              }`}
              placeholder="Type your answer here..."
              value={fillAnswer}
              onChange={(e) => !showExp && setFillAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && !showExp && fillAnswer.trim() && checkAnswer()
              }
              disabled={showExp}
            />
            {showExp && !lastCorrect ? (
              <div className={styles.fillCorrectAnswer}>
                Correct: <strong>{String(q.correct)}</strong>
              </div>
            ) : null}
          </div>
        ) : null}

        {showExp ? (
          <div
            className={`${styles.explanation} ${lastCorrect ? styles.expCorrect : styles.expWrong}`}
            role="status"
            aria-live="polite"
          >
            <div className={styles.expIcon}>
              {lastCorrect ? (
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
            {currentAudioUrl ? (
              <WordCardAudioButton
                audioUrl={currentAudioUrl}
                className={styles.quizAudioBtn}
                label="Listen"
              />
            ) : null}
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
              {current + 1 >= questions.length
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
  questions: QuizPlayQuestion[],
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
