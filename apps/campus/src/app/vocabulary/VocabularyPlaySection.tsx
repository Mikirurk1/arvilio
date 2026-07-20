'use client';

import { useState } from 'react';
import { Check, ChevronRight, CircleAlert, PartyPopper, Play } from 'lucide-react';
import { Button, EmptyStateCard, Field, SegmentedControl } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
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
  const t = useCampusT();
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const current = playQuestions[playIndex];
  const complete = playPhase === 'result';

  const playSetupDescription =
    playPoolCount === 0
      ? t('vocabulary.play.descEmpty')
      : !canStart
        ? t('vocabulary.play.descNeedTwo')
        : t('vocabulary.play.descDefault');

  return (
    <div className={styles.playWrap} data-play-phase={playPhase}>
      {playPhase === 'setup' ? (
        <div className={styles.playSetupCard} data-tour-anchor="vocab-play-setup">
          <div className={styles.playSetupHero}>
            <div className={styles.playSetupIcon} aria-hidden>
              <Play size={28} />
            </div>
            <h2 className={styles.playSetupTitle}>{t('vocabulary.play.ready')}</h2>
            <p
              className={`${styles.playSetupDescription} ${!canStart && playPoolCount > 0 ? styles.playSetupDescriptionWarn : ''}`}
            >
              {playSetupDescription}
            </p>
            {playPoolCount > 0 ? (
              <p className={styles.playSetupMeta}>
                {playPoolCount === 1 ? t('vocabulary.play.wordInSet', { count: playPoolCount }) : t('vocabulary.play.wordsInSet', { count: playPoolCount })}
              </p>
            ) : null}
          </div>

          <div className={styles.playSetupControls} data-tour-anchor="vocab-play-source">
            <span className={styles.playSetupControlsLabel}>{t('vocabulary.play.source')}</span>
            <SegmentedControl
              value={playSource}
              onValueChange={next =>
                setPlaySource(next as 'random' | 'last' | 'lesson')
              }
              ariaLabel={t('vocabulary.play.sourceAria')}
              className={styles.playSetupSourceToggle}
              optionClassName={styles.catBtn}
              activeOptionClassName={styles.catActive}
              options={[
                { value: 'random', label: t('vocabulary.play.withoutLesson') },
                { value: 'last', label: t('vocabulary.play.lastLesson') },
                { value: 'lesson', label: t('vocabulary.play.byLesson') },
              ]}
            />
            {playSource === 'lesson' ? (
              <Field as="select"
                className={styles.playSetupLessonSelect}
                value={playLessonId}
                onChange={e => setPlayLessonId(e.target.value)}
              >
                <option value='all'>{t('vocabulary.play.selectLesson')}</option>
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
            data-tour-anchor="vocab-play-start"
            disabled={!canStart}
            onClick={onStart}
          >
            <Play size={18} aria-hidden />
            {t('vocabulary.play.play')}
          </Button>
        </div>
      ) : null}

      {playPhase === 'quiz' && current ? (
        <div className={styles.playQuestionCard}>
          <div className={styles.playProgress} data-tour-anchor="vocab-play-progress">
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
          <div className={styles.flashcard} data-tour-anchor="vocab-play-question">
            <div className={styles.fcFront}>
              <div className={styles.fcHint}>
                {t('vocabulary.play.chooseTranslation')}
              </div>
              <div className={styles.fcWord}>{current.word}</div>
              <div className={styles.fcPhonetic}>{current.phonetic}</div>
            </div>
          </div>
          <div className={styles.playOptionsGrid} data-tour-anchor="vocab-play-options">
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
                    <Check size={15} /> {t('vocabulary.play.correct')}
                  </>
                ) : (
                  <>
                    <ChevronRight size={15} /> {t('vocabulary.play.notQuite')}
                  </>
                )}
              </div>
              <div className={styles.expText}>
                {t('vocabulary.play.correctAnswer', { answer: current.correct })}
              </div>
            </div>
          ) : null}
          <div className={styles.qActions} data-tour-anchor="vocab-play-actions">
            <Button
              type='button'
              className={styles.finishBtn}
              onClick={() => setShowFinishConfirm(true)}
            >
              {t('vocabulary.play.finish')}
            </Button>
            {!playShowExplanation ? (
              <Button
                type='button'
                className={styles.checkBtn}
                disabled={!playSelected}
                onClick={onCheck}
              >
                {t('vocabulary.play.check')}
              </Button>
            ) : (
              <Button type='button' className={styles.nextBtn} onClick={onNext}>
                {playIndex + 1 >= playQuestions.length
                  ? t('vocabulary.play.seeResults')
                  : t('vocabulary.play.nextQuestion')}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {complete ? (
        <div data-tour-anchor="vocab-play-result">
          <EmptyStateCard
            className={styles.fcComplete}
            icon={
              <div className={styles.fcCompleteIcon}>
                <PartyPopper size={22} />
              </div>
            }
            title={<div className={styles.fcCompleteTitle}>{t('vocabulary.play.roundComplete')}</div>}
            description={
              <div className={styles.fcCompleteSub}>
                {t('vocabulary.play.correctCount', { score: playScore, total: playQuestions.length })}
              </div>
            }
            action={
              <Button
                type='button'
                className={styles.fcRestartBtn}
                onClick={onReset}
              >
                {t('vocabulary.play.newRound')}
              </Button>
            }
          />
        </div>
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
                {t('vocabulary.play.confirmBadge')}
              </span>
              <h3 id="vocabulary-finish-title">{t('vocabulary.play.finishNow')}</h3>
              <p>
                {t('vocabulary.play.finishBody')}
              </p>
            </div>
            <div className={styles.finishActions}>
              <Button
                type='button'
                className={styles.modalCancelBtn}
                onClick={() => setShowFinishConfirm(false)}
              >
                {t('vocabulary.play.continue')}
              </Button>
              <Button
                type='button'
                className={styles.finishConfirmBtn}
                onClick={() => {
                  setShowFinishConfirm(false);
                  onFinish();
                }}
              >
                {t('vocabulary.play.saveFinish')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
