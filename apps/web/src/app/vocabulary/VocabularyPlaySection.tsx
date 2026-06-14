'use client';

import { useState } from 'react';
import { Check, ChevronRight, CircleAlert, PartyPopper, Play } from 'lucide-react';
import { Button, EmptyStateCard, Field, SegmentedControl } from '../../components/ui';
import { type VocabularyPlayQuestion } from '../../lib/vocabulary-ui';
import styles from './page.module.scss';

export function VocabularyPlaySection({
  playSource,
  setPlaySource,
  playLessonId,
  setPlayLessonId,
  playLessonOptions,
  playQuestions,
  playIndex,
  playSelected,
  playShowExplanation,
  playAnswers,
  playScore,
  playPhase,
  canStart,
  playPoolCount = 0,
  onStart,
  onSelect,
  onCheck,
  onNext,
  onFinish,
  onReset,
}: {
  playSource: 'random' | 'last' | 'lesson';
  setPlaySource: (value: 'random' | 'last' | 'lesson') => void;
  playLessonId: string;
  setPlayLessonId: (value: string) => void;
  playLessonOptions: Array<{ value: string; label: string }>;
  playQuestions: VocabularyPlayQuestion[];
  playIndex: number;
  playSelected: string | null;
  playShowExplanation: boolean;
  playAnswers: boolean[];
  playScore: number;
  playPhase: 'setup' | 'quiz' | 'result';
  canStart: boolean;
  playPoolCount?: number;
  onStart: () => void;
  onSelect: (option: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onFinish: () => void;
  onReset: () => void;
}) {
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const current = playQuestions[playIndex];
  const complete = playPhase === 'result';

  const playSetupDescription =
    playPoolCount === 0
      ? 'No words match your current filters. Add vocabulary or change the source below.'
      : !canStart
        ? 'Need at least two words with translations (or definitions) in this set to build answer choices. Add another word or switch the source filter.'
        : 'You will see an English word and choose the correct translation from four options. New and mistakes work words are prioritized when using the default source.';

  return (
    <div className={styles.playWrap}>
      {playPhase === 'setup' ? (
        <div className={styles.playSetupCard}>
          <div className={styles.playSetupHero}>
            <div className={styles.playSetupIcon} aria-hidden>
              <Play size={28} />
            </div>
            <h2 className={styles.playSetupTitle}>Ready to play</h2>
            <p
              className={`${styles.playSetupDescription} ${!canStart && playPoolCount > 0 ? styles.playSetupDescriptionWarn : ''}`}
            >
              {playSetupDescription}
            </p>
            {playPoolCount > 0 ? (
              <p className={styles.playSetupMeta}>
                {playPoolCount} {playPoolCount === 1 ? 'word' : 'words'} in this set
              </p>
            ) : null}
          </div>

          <div className={styles.playSetupControls}>
            <span className={styles.playSetupControlsLabel}>Word source</span>
            <SegmentedControl
              value={playSource}
              onValueChange={next =>
                setPlaySource(next as 'random' | 'last' | 'lesson')
              }
              ariaLabel='Play source'
              className={styles.playSetupSourceToggle}
              optionClassName={styles.catBtn}
              activeOptionClassName={styles.catActive}
              options={[
                { value: 'random', label: 'Without lesson' },
                { value: 'last', label: 'Last lesson' },
                { value: 'lesson', label: 'By lesson' },
              ]}
            />
            {playSource === 'lesson' ? (
              <Field as="select"
                className={styles.playSetupLessonSelect}
                value={playLessonId}
                onChange={e => setPlayLessonId(e.target.value)}
              >
                <option value='all'>Select lesson</option>
                {playLessonOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>
            ) : null}
          </div>

          <Button
            type='button'
            className={styles.playSetupPlayBtn}
            disabled={!canStart}
            onClick={onStart}
          >
            <Play size={18} aria-hidden />
            Play
          </Button>
        </div>
      ) : null}

      {playPhase === 'quiz' && current ? (
        <div className={styles.playQuestionCard}>
          <div className={styles.playProgress}>
            {playIndex + 1} / {playQuestions.length}
          </div>
          <div className={styles.scoreRow}>
            {playAnswers.map((ok, i) => (
              <div
                key={i}
                className={`${styles.scoreDot} ${ok ? styles.scoreDotGreen : styles.scoreDotRed}`}
              />
            ))}
            {Array.from({
              length: playQuestions.length - playAnswers.length,
            }).map((_, i) => (
              <div key={`p-empty-${i}`} className={styles.scoreDotEmpty} />
            ))}
          </div>
          <div className={styles.flashcard}>
            <div className={styles.fcFront}>
              <div className={styles.fcHint}>
                Choose the correct translation
              </div>
              <div className={styles.fcWord}>{current.word}</div>
              <div className={styles.fcPhonetic}>{current.phonetic}</div>
            </div>
          </div>
          <div className={styles.playOptionsGrid}>
            {current.options.map((option, optionIndex) => {
              const isCorrect = option === current.correct;
              const isSelected = option === playSelected;
              const resultClass = playShowExplanation
                ? isCorrect
                  ? styles.playOptionCorrect
                  : isSelected
                    ? styles.playOptionWrong
                    : ''
                : '';
              return (
                <Button
                  key={`${option}-${optionIndex}`}
                  type='button'
                  className={`${styles.playOptionBtn} ${!playShowExplanation && isSelected ? styles.playOptionSelected : ''} ${resultClass}`}
                  disabled={playShowExplanation}
                  onClick={() => onSelect(option)}
                >
                  <span className={styles.playOptionLetter}>
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </Button>
              );
            })}
          </div>
          {playShowExplanation ? (
            <div
              className={`${styles.explanation} ${playSelected === current.correct ? styles.expCorrect : styles.expWrong}`}
            >
              <div className={styles.expIcon}>
                {playSelected === current.correct ? (
                  <>
                    <Check size={15} /> Correct!
                  </>
                ) : (
                  <>
                    <ChevronRight size={15} /> Not quite
                  </>
                )}
              </div>
              <div className={styles.expText}>
                Correct answer: {current.correct}
              </div>
            </div>
          ) : null}
          <div className={styles.qActions}>
            <Button
              type='button'
              className={styles.finishBtn}
              onClick={() => setShowFinishConfirm(true)}
            >
              Finish game
            </Button>
            {!playShowExplanation ? (
              <Button
                type='button'
                className={styles.checkBtn}
                disabled={!playSelected}
                onClick={onCheck}
              >
                Check Answer
              </Button>
            ) : (
              <Button type='button' className={styles.nextBtn} onClick={onNext}>
                {playIndex + 1 >= playQuestions.length
                  ? 'See Results →'
                  : 'Next Question →'}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {complete ? (
        <EmptyStateCard
          className={styles.fcComplete}
          icon={
            <div className={styles.fcCompleteIcon}>
              <PartyPopper size={22} />
            </div>
          }
          title={<div className={styles.fcCompleteTitle}>Round complete</div>}
          description={
            <div className={styles.fcCompleteSub}>
              {playScore} / {playQuestions.length} correct
            </div>
          }
          action={
            <Button
              type='button'
              className={styles.fcRestartBtn}
              onClick={onReset}
            >
              New round
            </Button>
          }
        />
      ) : null}
      {showFinishConfirm ? (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowFinishConfirm(false)}
        >
          <div
            className={styles.finishModal}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vocabulary-finish-title"
          >
            <div className={styles.finishHead}>
              <span className={styles.finishBadge}>
                <CircleAlert size={14} />
                Confirmation
              </span>
              <h3 id="vocabulary-finish-title">Finish game now?</h3>
              <p>
                Your current progress will be saved and results will be shown
                immediately.
              </p>
            </div>
            <div className={styles.finishActions}>
              <Button
                type='button'
                className={styles.modalCancelBtn}
                onClick={() => setShowFinishConfirm(false)}
              >
                Continue game
              </Button>
              <Button
                type='button'
                className={styles.finishConfirmBtn}
                onClick={() => {
                  setShowFinishConfirm(false);
                  onFinish();
                }}
              >
                Save & finish
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
