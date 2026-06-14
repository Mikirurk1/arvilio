'use client';

import { useEffect, useRef, useState } from 'react';
import type { GenerateQuizRequestDto, QuizDetailDto } from '@pkg/types';
import { CircleHelp, Play, Sparkles } from 'lucide-react';
import { Button, Field, Tooltip } from '../ui';
import { useQuizzesStore } from '../../stores/quizzes-store';
import styles from './CreateQuizCard.module.scss';

const compactControlClassName = styles.compactControl;

const DIFFICULTY_TOOLTIP = (
  <>
    <strong>Easy</strong> — mostly definition multiple choice; occasional irregular past tense
    when that option is on.
    <br />
    <strong>Medium</strong> — rotates definition, reverse, cloze (if the word has an example),
    translation (if a native gloss exists), and irregular verb forms.
    <br />
    <strong>Hard</strong> — same types as medium, but cloze, reverse, and translation appear more
    often.
    <br />
    Applies only when generating the quiz; it does not change how answers are graded.
  </>
);

function DifficultyLabel() {
  const infoRef = useRef<HTMLButtonElement>(null);
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <span className={styles.controlLabel}>
      <span>Difficulty</span>
      <button
        ref={infoRef}
        type="button"
        className={styles.infoBtn}
        aria-label="How difficulty affects generated questions"
        onMouseEnter={() => setTipOpen(true)}
        onMouseLeave={() => setTipOpen(false)}
        onFocus={() => setTipOpen(true)}
        onBlur={() => setTipOpen(false)}
      >
        <CircleHelp size={14} aria-hidden />
      </button>
      <Tooltip
        open={tipOpen}
        targetEl={infoRef.current}
        content={DIFFICULTY_TOOLTIP}
        placement="top"
        className={styles.difficultyTooltip}
      />
    </span>
  );
}

type Props = {
  studentId?: string;
  lessonId?: string;
  defaultSource?: GenerateQuizRequestDto['source'];
  className?: string;
  onGenerated?: (quiz: QuizDetailDto) => void;
  onPlay?: (quizId: string, practice: boolean) => void;
};

export function CreateQuizCard({
  studentId,
  lessonId,
  defaultSource = 'vocabulary',
  className,
  onGenerated,
  onPlay,
}: Props) {
  const [source, setSource] = useState<GenerateQuizRequestDto['source']>(defaultSource);
  const [difficulty, setDifficulty] = useState<GenerateQuizRequestDto['difficulty']>('medium');
  const [questionCount, setQuestionCount] = useState(8);
  const [includeIrregularVerbDrills, setIncludeIrregularVerbDrills] = useState(true);
  const [mistakesOnly, setMistakesOnly] = useState(false);
  const generating = useQuizzesStore((s) => s.generating);
  const generateError = useQuizzesStore((s) => s.generateError);
  const generateQuiz = useQuizzesStore((s) => s.generateQuiz);
  const [lastQuiz, setLastQuiz] = useState<QuizDetailDto | null>(null);

  useEffect(() => {
    if (!lessonId && (source === 'lesson' || source === 'mixed')) {
      setSource('vocabulary');
    }
  }, [lessonId, source]);

  const onGenerate = async () => {
    try {
      const quiz = await generateQuiz({
        source,
        difficulty,
        questionCount,
        lessonId:
          source === 'lesson' || source === 'mixed' ? lessonId : undefined,
        studentId,
        includeIrregularVerbDrills,
        mistakesOnly,
      });
      setLastQuiz(quiz);
      onGenerated?.(quiz);
    } catch {
      // Store sets generateError.
    }
  };

  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <div className={styles.icon} aria-hidden>
          <Sparkles size={20} />
        </div>
        <div className={styles.headerBody}>
          <h4 className={styles.title}>Create quiz</h4>
          <p className={styles.subtitle}>
            {studentId
              ? 'From this student’s vocabulary — assigned automatically.'
              : 'From your vocabulary — add words on the Vocabulary page first.'}
          </p>
          <p className={styles.translationNote}>
            Translation items: native gloss in the prompt, student picks the English word.
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <label className={styles.control}>
          <span>Source</span>
          <Field
            as="select"
            className={compactControlClassName}
            value={source}
            onChange={(event) => setSource(event.target.value as GenerateQuizRequestDto['source'])}
          >
            <option value="vocabulary">
              {studentId ? "Student's vocabulary" : 'My vocabulary'}
            </option>
            <option value="lesson" disabled={!lessonId}>
              This lesson only
            </option>
            <option value="mixed" disabled={!lessonId}>
              Lesson + rest of vocabulary
            </option>
          </Field>
          <span className={styles.hint}>
            {source === 'vocabulary'
              ? 'All words from the vocabulary list.'
              : source === 'lesson'
                ? 'Only words linked to this lesson.'
                : lessonId
                  ? 'Words from this lesson first, then other vocabulary.'
                  : 'Select a lesson context to use lesson or mixed sources.'}
          </span>
        </label>

        <div className={styles.options}>
          <label className={styles.checkbox}>
            <Field
              as="checkbox"
              checked={includeIrregularVerbDrills}
              onChange={(event) => setIncludeIrregularVerbDrills(event.target.checked)}
            />
            <span>Include irregular verb drills (past / past participle)</span>
          </label>
          <label className={styles.checkbox}>
            <Field
              as="checkbox"
              checked={mistakesOnly}
              onChange={(event) => setMistakesOnly(event.target.checked)}
            />
            <span>Only words marked for mistakes work</span>
          </label>
        </div>

        <div className={styles.row}>
          <div className={styles.rowCol}>
            <DifficultyLabel />
            <div className={styles.rowField}>
              <Field
                as="select"
                className={compactControlClassName}
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as GenerateQuizRequestDto['difficulty'])
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Field>
            </div>
          </div>
          <div className={styles.rowCol}>
            <span className={styles.controlLabel}>Questions</span>
            <div className={styles.rowField}>
              <Field
                type="number"
                className={compactControlClassName}
                min={3}
                max={25}
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value) || 8)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          type="button"
          className={styles.generateBtn}
          disabled={generating}
          onClick={() => void onGenerate()}
        >
          {generating ? 'Generating…' : 'Generate quiz'}
        </Button>
        {generateError ? <p className={styles.error} role="alert">{generateError}</p> : null}
        {lastQuiz ? (
          <p className={styles.success}>
            Created: <strong>{lastQuiz.title}</strong> · {lastQuiz.questions.length} questions
            {onPlay ? (
              <Button
                type="button"
                variant="ghost"
                className={styles.playLinkBtn}
                onClick={() => onPlay(lastQuiz.id, true)}
                startIcon={<Play size={14} aria-hidden />}
              >
                Practice
              </Button>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
