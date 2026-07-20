'use client';

import { BookOpen, CircleX, ThumbsUp, Trophy } from 'lucide-react';
import { Button } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import type { IrregularVerbDrillResult } from '../../lib/irregular-verbs-drill';
import styles from './IrregularVerbs.module.scss';

type Props = {
  result: IrregularVerbDrillResult;
  onClose: () => void;
  onRetry: () => void;
};

export function IrregularVerbsResult({ result, onClose, onRetry }: Props) {
  const t = useCampusT();
  const mistakes = result.review.filter((item) => !item.isCorrect);

  const title =
    result.score >= 80
      ? t('quiz.result.excellent')
      : result.score >= 60
        ? t('quiz.result.good')
        : t('quiz.result.keep');

  return (
    <div className={styles.result}>
      <div className={styles.resultCard}>
        <div className={styles.resultEmoji}>
          {result.score >= 80 ? (
            <Trophy size={28} aria-hidden />
          ) : result.score >= 60 ? (
            <ThumbsUp size={28} aria-hidden />
          ) : (
            <BookOpen size={28} aria-hidden />
          )}
        </div>
        <h2 className={styles.resultTitle}>{title}</h2>
        <div className={styles.resultScore}>
          {result.correctCount} / {result.totalCount}
        </div>
        <p className={styles.resultPct}>{t('irregular.result.pctCorrect', { pct: result.score })}</p>
        <p className={styles.resultHint}>{t('irregular.result.hint')}</p>

        {mistakes.length > 0 ? (
          <div className={styles.mistakesSection}>
            <h3 className={styles.mistakesTitle}>{t('irregular.result.reviewMistakes')}</h3>
            <ul className={styles.mistakesList}>
              {mistakes.map((item) => (
                <li key={item.questionId} className={styles.mistakeRow}>
                  <span className={styles.mistakeIcon} aria-hidden>
                    <CircleX size={14} />
                  </span>
                  <div className={styles.mistakeBody}>
                    <p className={styles.mistakePrompt}>{item.prompt}</p>
                    <p className={styles.mistakeAnswer}>
                      {t('irregular.result.yourAnswer', { answer: item.userAnswer })}
                    </p>
                    <p className={styles.mistakeCorrect}>
                      {t('irregular.result.correctAnswer', { answer: item.correctAnswer })}
                    </p>
                    <p className={styles.mistakeReveal}>{item.revealLine}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={styles.resultActions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('irregular.result.back')}
          </Button>
          <Button type="button" onClick={onRetry}>
            {t('irregular.result.retry')}
          </Button>
        </div>
      </div>
    </div>
  );
}
