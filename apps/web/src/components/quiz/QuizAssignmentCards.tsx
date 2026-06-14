'use client';

import type { QuizCardDto } from '@pkg/types';
import { CheckCircle2, FileText, Play, Trash2 } from 'lucide-react';
import { Button } from '../ui';
import styles from './QuizAssignmentCards.module.scss';

type Props = {
  quizzes: QuizCardDto[];
  onPlay: (quizId: string) => void;
  onPractice?: (quizId: string) => void;
  onDelete?: (quizId: string) => void;
  deletingQuizId?: string | null;
  emptyMessage?: string;
  /** When true, score labels refer to the student (staff view). */
  staffView?: boolean;
  /** Participate in parent 2-column grid — one card per half-width cell. */
  embedded?: boolean;
};

function difficultyBadgeClass(difficulty: QuizCardDto['difficulty']): string {
  if (difficulty === 'hard') return styles.badgeRose;
  if (difficulty === 'medium') return styles.badgeAmber;
  return styles.badgeGreen;
}

function formatQuizSource(source: QuizCardDto['source']): string {
  switch (source) {
    case 'vocabulary':
      return 'Vocabulary';
    case 'lesson':
      return 'Lesson';
    case 'mixed':
      return 'Mixed';
    default:
      return 'Manual';
  }
}

function formatQuizCreated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function QuizAssignmentCards({
  quizzes,
  onPlay,
  onPractice,
  onDelete,
  deletingQuizId = null,
  emptyMessage = 'No quizzes yet.',
  staffView = false,
  embedded = false,
}: Props) {
  if (quizzes.length === 0) {
    return (
      <p className={embedded ? styles.emptyEmbedded : styles.empty}>{emptyMessage}</p>
    );
  }

  const cards = quizzes.map((quiz) => {
    const completed = Boolean(quiz.attempt?.finishedAt);
    const score = quiz.attempt?.score;
    const hasPractice = Boolean(onPractice);

    const cardClass = [
      styles.card,
      embedded ? styles.cardEmbedded : '',
      completed ? styles.cardCompleted : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div key={quiz.id} className={cardClass}>
        <div className={styles.head}>
          <div className={styles.headMain}>
            <div className={styles.titleRow}>
              <h4 className={styles.title}>{quiz.title}</h4>
              {completed ? (
                <CheckCircle2 size={16} className={styles.doneIcon} aria-hidden />
              ) : null}
            </div>
            <div className={styles.badges}>
              <span className={styles.badgeBlue}>{quiz.category}</span>
              <span className={difficultyBadgeClass(quiz.difficulty)}>{quiz.difficulty}</span>
            </div>
          </div>
          {onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className={styles.deleteIconBtn}
              aria-label="Delete quiz"
              disabled={deletingQuizId === quiz.id}
              onClick={() => onDelete(quiz.id)}
            >
              <Trash2 size={14} aria-hidden />
            </Button>
          ) : null}
        </div>

        <div className={styles.meta}>
          <span>
            <FileText size={14} aria-hidden />
            {quiz.questionCount} questions
          </span>
          <span className={styles.metaDot} aria-hidden>
            ·
          </span>
          <span>{formatQuizSource(quiz.source)}</span>
        </div>

        <p className={styles.createdAt}>Created {formatQuizCreated(quiz.createdAt)}</p>

        {completed && score != null ? (
          <div className={styles.scoreBox}>
            <span>{staffView ? 'Student score' : 'Your score'}</span>
            <strong>{Math.round(score)}%</strong>
          </div>
        ) : staffView ? (
          <p className={styles.pendingBox}>Not completed yet</p>
        ) : null}

        <div className={`${styles.actions} ${!hasPractice ? styles.actionsSingle : ''}`}>
          <Button type="button" className={styles.playBtn} onClick={() => onPlay(quiz.id)}>
            <Play size={14} aria-hidden />
            {completed
              ? staffView
                ? 'Open'
                : 'Try again'
              : staffView
                ? 'Preview'
                : 'Start Quiz'}
          </Button>
          {onPractice ? (
            <Button
              type="button"
              className={styles.practiceBtn}
              onClick={() => onPractice(quiz.id)}
            >
              Practice
            </Button>
          ) : null}
        </div>
      </div>
    );
  });

  if (embedded) {
    return <div className={styles.gridEmbedded}>{cards}</div>;
  }

  return <div className={styles.grid}>{cards}</div>;
}
