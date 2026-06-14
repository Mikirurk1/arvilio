'use client';

import { useState } from 'react';
import { BookOpen, Check, CircleX, ThumbsUp, Trophy } from 'lucide-react';
import { Button } from '../../components/ui';
import { QuizResultStats } from '../../app/quiz/sections';
import { WordDetailsModal } from '../vocabulary/WordDetailsModal';
import type { QuizPlayResult } from './quiz-play-types';
import styles from './QuizResultScreen.module.scss';

type Props = {
  result: QuizPlayResult;
  onClose: () => void;
  onRetry?: () => void;
};

export function QuizResultScreen({ result, onClose, onRetry }: Props) {
  const [detailsWordId, setDetailsWordId] = useState<string | null>(null);
  const pct = result.score;
  const mistakes = result.review.filter((item) => !item.isCorrect);

  return (
    <>
      <div className={styles.result}>
        <div className={styles.resultCard}>
          <div className={styles.resultEmoji}>
            {pct >= 80 ? <Trophy size={28} /> : pct >= 60 ? <ThumbsUp size={28} /> : <BookOpen size={28} />}
          </div>
          <h2 className={styles.resultTitle}>
            {result.practiceMode
              ? 'Practice complete'
              : pct >= 80
                ? 'Excellent work!'
                : pct >= 60
                  ? 'Good job!'
                  : 'Keep practicing!'}
          </h2>
          <div className={styles.resultScore}>
            {result.correctCount} / {result.totalCount}
          </div>
          <div className={styles.resultPct}>{pct}% correct</div>
          {result.practiceMode ? (
            <p className={styles.resultHint}>Practice runs are not saved for the student.</p>
          ) : mistakes.length > 0 ? (
            <p className={styles.resultHint}>
              {mistakes.length} mistake{mistakes.length === 1 ? '' : 's'} added to your vocabulary review queue.
            </p>
          ) : null}

          <QuizResultStats score={result.correctCount} total={result.totalCount} />

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
                      <p className={styles.mistakePrompt}>
                        {item.prompt.length > 100 ? `${item.prompt.slice(0, 100)}…` : item.prompt}
                      </p>
                      <p className={styles.mistakeAnswer}>
                        Your answer: <strong>{item.userAnswer || '—'}</strong>
                      </p>
                      <p className={styles.mistakeAnswer}>
                        Correct: <strong>{item.correctAnswer}</strong>
                      </p>
                      {item.wordId ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className={styles.wordLinkBtn}
                          onClick={() => setDetailsWordId(item.wordId!)}
                        >
                          Open word
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={styles.allCorrect}>
              <Check size={16} aria-hidden />
              All answers correct — great recall!
            </div>
          )}

          <div className={styles.resultActions}>
            {onRetry ? (
              <Button type="button" className={styles.retryBtn} onClick={onRetry}>
                Try again
              </Button>
            ) : null}
            <Button type="button" variant="primary" onClick={onClose}>
              Back to quizzes
            </Button>
          </div>
        </div>
      </div>
      {detailsWordId ? (
        <WordDetailsModal wordId={detailsWordId} onClose={() => setDetailsWordId(null)} />
      ) : null}
    </>
  );
}
