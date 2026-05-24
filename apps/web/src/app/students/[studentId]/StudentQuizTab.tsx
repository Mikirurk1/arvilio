'use client';

import { useEffect, useState } from 'react';
import { confirmDialog } from '../../../features/confirm';
import { canEdit } from '../../../lib/roles';
import { useActiveUser } from '../../../lib/active-user';
import { CreateQuizCard } from '../../../components/quiz/CreateQuizCard';
import { QuizAssignmentCards } from '../../../components/quiz/QuizAssignmentCards';
import { QuizPlaySession } from '../../../features/quiz/QuizPlaySession';
import { useQuizzesStore } from '../../../stores/quizzes-store';
import { Button, SurfaceCard } from '../../../components/ui';
import styles from './page.module.scss';
import quizStyles from '../../quiz/page.module.scss';

type PlayState = {
  quizId: string;
  practice: boolean;
} | null;

type ResultState = {
  score: number;
  correctCount: number;
  totalCount: number;
  practiceMode: boolean;
} | null;

export function StudentQuizTab({ studentId }: { studentId: string }) {
  const activeUser = useActiveUser();
  const canGenerate = canEdit('quiz', activeUser.role);
  const isStaff = canGenerate;
  const studentQuizzes = useQuizzesStore((s) => s.studentQuizzes);
  const fetchStudentQuizzes = useQuizzesStore((s) => s.fetchStudentQuizzes);
  const deleteQuiz = useQuizzesStore((s) => s.deleteQuiz);
  const [play, setPlay] = useState<PlayState>(null);
  const [result, setResult] = useState<ResultState>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  useEffect(() => {
    void fetchStudentQuizzes(studentId);
  }, [fetchStudentQuizzes, studentId]);

  const handleDelete = async (quizId: string) => {
    const ok = await confirmDialog({
      title: 'Delete quiz?',
      message: 'This quiz will be permanently deleted for this student.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingQuizId(quizId);
    try {
      await deleteQuiz(quizId, studentId);
    } finally {
      setDeletingQuizId(null);
    }
  };

  if (play) {
    return (
      <SurfaceCard className={styles.quizTabCard}>
        <QuizPlaySession
          quizId={play.quizId}
          studentId={play.practice ? undefined : studentId}
          practiceMode={play.practice}
          onCancel={() => setPlay(null)}
          onDone={(outcome) => {
            setPlay(null);
            setResult(outcome);
            if (!outcome.practiceMode) {
              void fetchStudentQuizzes(studentId, true);
            }
          }}
        />
      </SurfaceCard>
    );
  }

  const assigned = studentQuizzes.data ?? [];

  return (
    <div className={styles.quizTab}>
      <section aria-label="Assigned quizzes">
        <h3 className={styles.quizSectionTitle}>
          {isStaff ? 'Quizzes for this student' : 'Your quizzes'}
        </h3>
        <p className={styles.quizSectionSub}>
          {isStaff
            ? 'Generated from this student’s vocabulary. Scores appear after they complete a quiz.'
            : 'Complete assigned quizzes and review your scores.'}
        </p>

        {studentQuizzes.status === 'loading' || studentQuizzes.status === 'idle' ? (
          <p className={styles.quizSectionSub}>Loading quizzes…</p>
        ) : (
          <div className={quizStyles.manageGrid}>
            {canGenerate ? (
              <CreateQuizCard
                studentId={studentId}
                defaultSource="vocabulary"
                onGenerated={() => void fetchStudentQuizzes(studentId, true)}
                onPlay={(quizId, practice) => {
                  setResult(null);
                  setPlay({ quizId, practice: practice && isStaff });
                }}
              />
            ) : null}
            <QuizAssignmentCards
              embedded
              quizzes={assigned}
              staffView={isStaff}
              deletingQuizId={deletingQuizId}
              emptyMessage={
                isStaff
                  ? 'No quizzes yet. Use the create card to generate one from this student’s vocabulary.'
                  : 'No quizzes assigned yet.'
              }
              onPlay={(quizId) => {
                setResult(null);
                setPlay({ quizId, practice: false });
              }}
              onPractice={
                isStaff
                  ? (quizId) => {
                      setResult(null);
                      setPlay({ quizId, practice: true });
                    }
                  : undefined
              }
              onDelete={canGenerate ? (quizId) => void handleDelete(quizId) : undefined}
            />
          </div>
        )}
      </section>

      {result ? (
        <SurfaceCard className={styles.quizResultCard}>
          <h3 className={styles.quizResultTitle}>
            {result.practiceMode ? 'Practice complete' : 'Quiz submitted'}
          </h3>
          <p className={styles.quizResultScore}>
            {result.correctCount} / {result.totalCount} correct ({result.score}%)
          </p>
          {result.practiceMode ? (
            <p className={styles.quizResultHint}>Practice runs are not recorded for the student.</p>
          ) : null}
          <Button type="button" onClick={() => setResult(null)}>
            Close
          </Button>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
