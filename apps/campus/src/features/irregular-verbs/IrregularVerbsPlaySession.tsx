'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui';
import {
  buildIrregularVerbDrillResult,
  gradeIrregularVerbAnswer,
  type IrregularVerbDrillQuestion,
  type IrregularVerbDrillResult,
} from '../../lib/irregular-verbs-drill';
import styles from './IrregularVerbs.module.scss';

type Props = {
  questions: IrregularVerbDrillQuestion[];
  onDone: (result: IrregularVerbDrillResult) => void;
  onCancel: () => void;
};

export function IrregularVerbsPlaySession({ questions, onDone, onCancel }: Props) {
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
    return <p className={styles.emptyTable}>Not enough verbs to build a drill. Try another set.</p>;
  }

  const checkAnswer = () => {
    if (selected === null) return;
    const correct = gradeIrregularVerbAnswer(question, selected);
    setSelectedByQuestionId((prev) => ({ ...prev, [question.id]: selected }));
    setAnswers((prev) => [...prev, correct]);
    setShowExplanation(true);
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
        <p className={styles.promptHint}>Choose the correct form</p>
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
                <Check size={15} aria-hidden /> Correct!
              </>
            ) : (
              <>
                <ChevronRight size={15} aria-hidden /> Not quite
              </>
            )}
          </div>
          <p className={styles.expText}>Correct answer: {question.correctAnswer}</p>
          <p className={styles.expReveal}>{question.revealLine}</p>
        </div>
      ) : null}

      <div className={styles.playActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Exit drill
        </Button>
        {!showExplanation ? (
          <Button type="button" disabled={selected === null} onClick={checkAnswer}>
            Check answer
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            {isLast ? 'See results →' : 'Next question →'}
          </Button>
        )}
      </div>
    </div>
  );
}
