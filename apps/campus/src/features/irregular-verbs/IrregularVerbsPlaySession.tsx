'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import {
  buildIrregularVerbDrillResult,
  gradeIrregularVerbAnswer,
  type IrregularVerbDrillQuestion,
  type IrregularVerbDrillResult,
} from '../../lib/irregular-verbs-drill';
import { useArvi } from '../../components/mascot/useArvi';
import styles from './IrregularVerbs.module.scss';

type Props = {
  questions: IrregularVerbDrillQuestion[];
  onDone: (result: IrregularVerbDrillResult) => void;
  onCancel: () => void;
};

export function IrregularVerbsPlaySession({ questions, onDone, onCancel }: Props) {
  const t = useCampusT();
  const { celebrate, encourage } = useArvi();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedByQuestionId, setSelectedByQuestionId] = useState<Record<string, number | null>>(
    {},
  );

  const question = questions[current];
  const isLast = current + 1 >= questions.length;

  useEffect(() => {
    setCurrent(0);
    setSelected(null);
    setShowExplanation(false);
    setAnswers([]);
    setSelectedByQuestionId({});
  }, [questions]);

  if (!question) {
    return <p className={styles.emptyTable}>{t('irregular.session.empty')}</p>;
  }

  const checkAnswer = () => {
    if (selected === null) return;
    const correct = gradeIrregularVerbAnswer(question, selected);
    setSelectedByQuestionId((prev) => ({ ...prev, [question.id]: selected }));
    setAnswers((prev) => [...prev, correct]);
    setShowExplanation(true);
    if (correct) celebrate();
    else encourage();
  };

  const goNext = () => {
    if (isLast) {
      const merged = { ...selectedByQuestionId, [question.id]: selected };
      onDone(buildIrregularVerbDrillResult(questions, merged));
      return;
    }
    setShowExplanation(false);
    setSelected(null);
    setCurrent((index) => index + 1);
  };

  return (
    <div className={styles.playSession}>
      <div className={styles.playProgress}>
        {current + 1} / {questions.length}
      </div>

      <div className={styles.scoreRow} aria-hidden>
        {answers.map((ok, index) => (
          <div
            key={index}
            className={`${styles.scoreDot} ${ok ? styles.scoreDotGreen : styles.scoreDotRed}`}
          />
        ))}
        {Array.from({ length: questions.length - answers.length }).map((_, index) => (
          <div key={`empty-${index}`} className={styles.scoreDotEmpty} />
        ))}
      </div>

      <div className={styles.promptCard}>
        <p className={styles.promptHint}>{t('irregular.session.choose')}</p>
        <h2 className={styles.promptText}>{question.prompt}</h2>
      </div>

      <div className={styles.optionsGrid}>
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correctIndex;
          const isSelected = optionIndex === selected;
          const resultClass = showExplanation
            ? isCorrect
              ? styles.optionCorrect
              : isSelected
                ? styles.optionWrong
                : ''
            : '';
          return (
            <Button
              key={`${option}-${optionIndex}`}
              type="button"
              className={`${styles.optionBtn} ${!showExplanation && isSelected ? styles.optionSelected : ''} ${resultClass}`}
              disabled={showExplanation}
              onClick={() => setSelected(optionIndex)}
            >
              <span className={styles.optionLetter}>{String.fromCharCode(65 + optionIndex)}</span>
              {option}
            </Button>
          );
        })}
      </div>

      {showExplanation ? (
        <div
          className={`${styles.explanation} ${selected === question.correctIndex ? styles.expCorrect : styles.expWrong}`}
        >
          <div className={styles.expIcon}>
            {selected === question.correctIndex ? (
              <>
                <Check size={15} aria-hidden /> {t('quiz.play.correct')}
              </>
            ) : (
              <>
                <ChevronRight size={15} aria-hidden /> {t('quiz.play.notQuite')}
              </>
            )}
          </div>
          <p className={styles.expText}>
            {t('irregular.session.correctAnswer', { answer: question.correctAnswer })}
          </p>
          <p className={styles.expReveal}>{question.revealLine}</p>
        </div>
      ) : null}

      <div className={styles.playActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('irregular.session.exit')}
        </Button>
        {!showExplanation ? (
          <Button type="button" disabled={selected === null} onClick={checkAnswer}>
            {t('irregular.session.check')}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            {isLast ? t('irregular.session.results') : t('irregular.session.next')}
          </Button>
        )}
      </div>
    </div>
  );
}
