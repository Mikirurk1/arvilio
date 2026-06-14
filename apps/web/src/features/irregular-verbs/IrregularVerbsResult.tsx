'use client';

import { BookOpen, CircleX, ThumbsUp, Trophy } from 'lucide-react';
import { Button } from '../../components/ui';
import type { IrregularVerbDrillResult } from '../../lib/irregular-verbs-drill';
import styles from './IrregularVerbs.module.scss';

type Props = {
  result: IrregularVerbDrillResult;
  onClose: () => void;
  onRetry: () => void;
};

export function IrregularVerbsResult({ result, onClose, onRetry }: Props) {
  const mistakes = result.review.filter((item) => !item.isCorrect);

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
        <h2 className={styles.resultTitle}>
          {result.score >= 80 ? 'Excellent work!' : result.score >= 60 ? 'Good job!' : 'Keep practicing!'}
        </h2>
        <div className={styles.resultScore}>
          {result.correctCount} / {result.totalCount}
        </div>
        <p className={styles.resultPct}>{result.score}% correct</p>
        <p className={styles.resultHint}>Practice runs are not saved to your vocabulary queue.</p>

        {mistakes.length > 0 ? (
          <div className={styles.mistakesSection}>
            <h3 className={styles.mistakesTitle}>Review mistakes</h3>
            <ul className={styles.mistakesList}>
              {mistakes.map((item) => (
                <li key={item.questionId} className={styles.mistakeRow}>
                  <span className={styles.mistakeIcon} aria-hidden>
                    <CircleX size={14} />
                  </span>
                  <div className={styles.mistakeBody}>
                    <p className={styles.mistakePrompt}>{item.prompt}</p>
                    <p className={styles.mistakeAnswer}>
                      Your answer: <strong>{item.userAnswer}</strong>
                    </p>
                    <p className={styles.mistakeCorrect}>
                      Correct: <strong>{item.correctAnswer}</strong>
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
            Back to table
          </Button>
          <Button type="button" onClick={onRetry}>
            Play again
          </Button>
        </div>
      </div>
    </div>
  );
}
