'use client';

import type { QuizCardDto } from '@pkg/types';
import { CheckCircle2, FileText, Play, Trash2 } from 'lucide-react';
import { useCampusI18n, useCampusT } from '../../lib/cms';
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

export function QuizAssignmentCards({
  quizzes,
  onPlay,
  onPractice,
  onDelete,
  deletingQuizId = null,
  emptyMessage,
  staffView = false,
  embedded = false,
}: Props) {
  const t = useCampusT();
  const { locale } = useCampusI18n();

  const formatQuizSource = (source: QuizCardDto['source']): string => {
    switch (source) {
      case 'vocabulary':
        return t('quiz.source.vocabulary');
      case 'lesson':
        return t('quiz.source.lesson');
      case 'mixed':
        return t('quiz.source.mixed');
      default:
        return t('quiz.source.manual');
    }
  };

  const formatDifficulty = (difficulty: QuizCardDto['difficulty']): string => {
    if (difficulty === 'hard') return t('quiz.diff.hard');
    if (difficulty === 'medium') return t('quiz.diff.medium');
    return t('quiz.diff.easy');
  };

  const formatQuizCreated = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (quizzes.length === 0) {
    return (
      <p className={embedded ? styles.emptyEmbedded : styles.empty}>
        {emptyMessage ?? t('quiz.empty.default')}
      </p>
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

    const questionLabel =
      quiz.questionCount === 1
        ? t('quiz.card.questionOne', { count: quiz.questionCount })
        : t('quiz.card.questions', { count: quiz.questionCount });

    const playLabel = completed
      ? staffView
        ? t('quiz.card.open')
        : t('quiz.card.tryAgain')
      : staffView
        ? t('quiz.card.preview')
        : t('quiz.startCard');

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
              <span className={difficultyBadgeClass(quiz.difficulty)}>
                {formatDifficulty(quiz.difficulty)}
              </span>
            </div>
          </div>
          {onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className={styles.deleteIconBtn}
              aria-label={t('quiz.delete.aria')}
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
            {questionLabel}
          </span>
          <span className={styles.metaDot} aria-hidden>
            ·
          </span>
          <span>{formatQuizSource(quiz.source)}</span>
        </div>

        <p className={styles.createdAt}>
          {t('quiz.card.created', { date: formatQuizCreated(quiz.createdAt) })}
        </p>

        {completed && score != null ? (
          <div className={styles.scoreBox}>
            <span>{staffView ? t('quiz.card.studentScore') : t('quiz.card.yourScore')}</span>
            <strong>{Math.round(score)}%</strong>
          </div>
        ) : staffView ? (
          <p className={styles.pendingBox}>{t('quiz.card.notCompleted')}</p>
        ) : null}

        <div className={`${styles.actions} ${!hasPractice ? styles.actionsSingle : ''}`}>
          <Button type="button" className={styles.playBtn} onClick={() => onPlay(quiz.id)}>
            <Play size={14} aria-hidden />
            {playLabel}
          </Button>
          {onPractice ? (
            <Button
              type="button"
              className={styles.practiceBtn}
              onClick={() => onPractice(quiz.id)}
            >
              {t('quiz.card.practice')}
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
