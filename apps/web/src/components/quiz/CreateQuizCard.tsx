'use client';

import { useEffect, useState } from 'react';
import type { GenerateQuizRequestDto, QuizDetailDto } from '@pkg/types';
import { Play, Sparkles } from 'lucide-react';
import { Button, Field } from '../ui';
import { useQuizzesStore } from '../../stores/quizzes-store';
import styles from './CreateQuizCard.module.scss';

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
        lessonId,
        studentId,
        includeIrregularVerbDrills,
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
        <div>
          <h4 className={styles.title}>Create quiz</h4>
          <p className={styles.subtitle}>
            {studentId
              ? 'From this student’s vocabulary — assigned automatically.'
              : 'From your vocabulary — add words on the Vocabulary page first.'}
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <label className={styles.control}>
          <span>Source</span>
          <Field
            as="select"
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
        <label className={styles.checkbox}>
          <Field
            as="checkbox"
            checked={includeIrregularVerbDrills}
            onChange={(event) => setIncludeIrregularVerbDrills(event.target.checked)}
          />
          <span>Include irregular verb drills (past / past participle)</span>
        </label>
        <label className={styles.control}>
          <span>Difficulty</span>
          <Field
            as="select"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as GenerateQuizRequestDto['difficulty'])
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Field>
        </label>
        <label className={styles.control}>
          <span>Questions</span>
          <Field
            type="number"
            min={3}
            max={25}
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value) || 8)}
          />
        </label>
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
        {generateError ? <span className={styles.error}>{generateError}</span> : null}
        {lastQuiz ? (
          <span className={styles.success}>
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
          </span>
        ) : null}
      </div>
    </div>
  );
}
