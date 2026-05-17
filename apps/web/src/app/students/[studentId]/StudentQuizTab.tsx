'use client';

import { useState } from 'react';
import { canEdit } from '../../../lib/roles';
import { useActiveUser } from '../../../lib/active-user';
import { GenerateQuizPanel } from '../../../components/backend/GenerateQuizPanel';
import { QuizPlaySession } from '../../../features/quiz/QuizPlaySession';
import { Button, SurfaceCard } from '../../../components/ui';
import styles from './page.module.scss';

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
  const [play, setPlay] = useState<PlayState>(null);
  const [result, setResult] = useState<ResultState>(null);

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
          }}
        />
      </SurfaceCard>
    );
  }

  return (
    <div className={styles.quizTab}>
      <GenerateQuizPanel
        studentId={studentId}
        defaultSource="vocabulary"
        canGenerate={canGenerate}
        canDelete={canGenerate}
        onPlay={(quizId, practice) => {
          setResult(null);
          setPlay({ quizId, practice: practice && isStaff });
        }}
      />

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
