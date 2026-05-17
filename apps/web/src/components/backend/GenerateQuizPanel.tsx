'use client';

import { useEffect, useState } from 'react';
import type {
  GenerateQuizRequestDto,
  QuizCardDto,
  QuizDetailDto,
  StudentQuizCardDto,
} from '@soenglish/shared-types';
import { Play, Sparkles, Trash2 } from 'lucide-react';
import { confirmDialog } from '../../features/confirm';
import { useQuizzesStore } from '../../stores/quizzes-store';
import styles from './backend-panels.module.scss';

type Props = {
  lessonId?: string;
  studentId?: string;
  defaultSource?: GenerateQuizRequestDto['source'];
  /** Teacher, admin, or super admin only. */
  canGenerate?: boolean;
  canDelete?: boolean;
  /** When false, hides the recent/global quiz list (e.g. on lesson page). */
  showRecentList?: boolean;
  onGenerated?: (quiz: QuizDetailDto) => void;
  onPlay?: (quizId: string, practice: boolean) => void;
};

export function GenerateQuizPanel({
  lessonId,
  studentId,
  defaultSource = 'vocabulary',
  canGenerate = false,
  canDelete = false,
  showRecentList = true,
  onGenerated,
  onPlay,
}: Props) {
  const [source, setSource] = useState<GenerateQuizRequestDto['source']>(defaultSource);
  const [difficulty, setDifficulty] = useState<GenerateQuizRequestDto['difficulty']>('medium');
  const [questionCount, setQuestionCount] = useState(8);
  const list = useQuizzesStore((s) => s.list);
  const studentQuizzes = useQuizzesStore((s) => s.studentQuizzes);
  const generating = useQuizzesStore((s) => s.generating);
  const generateError = useQuizzesStore((s) => s.generateError);
  const fetchList = useQuizzesStore((s) => s.fetchList);
  const fetchStudentQuizzes = useQuizzesStore((s) => s.fetchStudentQuizzes);
  const generateQuiz = useQuizzesStore((s) => s.generateQuiz);
  const deleteQuiz = useQuizzesStore((s) => s.deleteQuiz);
  const [lastQuiz, setLastQuiz] = useState<QuizDetailDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const quizRows: Array<QuizCardDto | StudentQuizCardDto> = studentId
    ? (studentQuizzes.data ?? [])
    : (list.data ?? []);

  useEffect(() => {
    if (studentId) {
      void fetchStudentQuizzes(studentId);
      return;
    }
    if (showRecentList) {
      void fetchList();
    }
  }, [studentId, showRecentList, fetchList, fetchStudentQuizzes]);

  const onGenerate = async () => {
    try {
      const quiz = await generateQuiz({
        source,
        difficulty,
        questionCount,
        lessonId,
        studentId,
      });
      setLastQuiz(quiz);
      onGenerated?.(quiz);
    } catch {
      // Error state is reflected by store below.
    }
  };

  const onDelete = async (quizId: string) => {
    const ok = await confirmDialog({
      title: 'Delete quiz?',
      message: 'This quiz will be permanently deleted.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingId(quizId);
    try {
      await deleteQuiz(quizId, studentId);
    } finally {
      setDeletingId(null);
    }
  };

  const showStudentEmptyHint = !canGenerate && !quizRows.length && Boolean(studentId);
  const showGenerateHint = canGenerate && !quizRows.length && !lastQuiz;
  const showList = showRecentList && quizRows.length > 0;
  if (!canGenerate && !showList && !showStudentEmptyHint && !showGenerateHint) {
    return null;
  }

  return (
    <div className={styles.panel}>
      {canGenerate ? (
        <>
          <div className={styles.head}>
            <Sparkles size={18} />
            <div>
              <div className={styles.title}>Auto-generate a quiz</div>
              <div className={styles.subtitle}>
                {studentId
                  ? 'Built from this student’s vocabulary — assigned automatically.'
                  : 'Questions are built automatically from vocabulary — no manual entry needed.'}
              </div>
            </div>
          </div>
          <div className={styles.controls}>
            <label className={styles.control}>
              <span>Source</span>
              <select
                value={source}
                onChange={(event) => setSource(event.target.value as GenerateQuizRequestDto['source'])}
              >
                <option value="vocabulary">
                  {studentId ? 'Student vocabulary' : 'My vocabulary'}
                </option>
                <option value="lesson" disabled={!lessonId}>
                  This lesson
                </option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as GenerateQuizRequestDto['difficulty'])
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Questions</span>
              <input
                type="number"
                min={3}
                max={25}
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value) || 8)}
              />
            </label>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => void onGenerate()} disabled={generating}>
              {generating ? 'Generating…' : 'Generate quiz'}
            </button>
            {generateError ? <span className={styles.error}>{generateError}</span> : null}
            {lastQuiz ? (
              <span className={styles.success}>
                Created: <strong>{lastQuiz.title}</strong> · {lastQuiz.questions.length} questions
                {onPlay ? (
                  <button
                    type="button"
                    className={styles.playLinkBtn}
                    onClick={() => onPlay(lastQuiz.id, true)}
                  >
                    <Play size={14} aria-hidden />
                    Practice
                  </button>
                ) : null}
              </span>
            ) : null}
          </div>
        </>
      ) : null}

      {showRecentList && quizRows.length ? (
        <div className={styles.list}>
          <div className={styles.listTitle}>{studentId ? 'Quizzes' : 'Recent quizzes'}</div>
          <ul>
            {quizRows.slice(0, studentId ? 20 : 4).map((quiz) => {
              const attempt = studentId ? (quiz as StudentQuizCardDto).attempt : null;
              return (
                <li key={quiz.id} className={styles.listRow}>
                  <div className={styles.listMeta}>
                    <strong>{quiz.title}</strong>
                    <span>
                      {quiz.questionCount} questions · {quiz.difficulty}
                      {attempt?.finishedAt
                        ? ` · completed ${attempt.score ?? 0}%`
                        : studentId
                          ? ' · not completed'
                          : ''}
                    </span>
                  </div>
                  <div className={styles.listActions}>
                    {onPlay ? (
                      <>
                        <button
                          type="button"
                          className={styles.playLinkBtn}
                          onClick={() => onPlay(quiz.id, false)}
                        >
                          <Play size={14} aria-hidden />
                          {attempt?.finishedAt ? 'Review' : 'Start'}
                        </button>
                        {canGenerate ? (
                          <button
                            type="button"
                            className={styles.playLinkBtn}
                            onClick={() => onPlay(quiz.id, true)}
                          >
                            Practice
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        className={styles.deleteLinkBtn}
                        disabled={deletingId === quiz.id}
                        onClick={() => void onDelete(quiz.id)}
                        aria-label="Delete quiz"
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!canGenerate && !quizRows.length && studentId ? (
        <p className={styles.subtitle}>No quizzes assigned yet.</p>
      ) : null}

      {canGenerate && !quizRows.length && !lastQuiz ? (
        <p className={styles.subtitle}>
          Generate a quiz from this student&apos;s vocabulary to get started.
        </p>
      ) : null}
    </div>
  );
}
