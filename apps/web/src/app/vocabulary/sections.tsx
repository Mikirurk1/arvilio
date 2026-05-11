'use client';

import { useState, type ReactNode } from 'react';
import type { VocabularyWordStatusName } from '@soenglish/shared-types';
import { Check, ChevronRight, PartyPopper, Play } from 'lucide-react';
import { AdaptiveSelect, Badge, Button, EmptyStateCard, Field, ProgressHeader, SegmentedControl, StatTile } from '../../components/ui';
import type { VocabularyProgressItem } from '../../mocks/domains/profile';
import styles from './page.module.scss';

export function VocabularyModeToggle({
  mode,
  onChange,
}: {
  mode: 'list' | 'flashcard' | 'play';
  onChange: (mode: 'list' | 'flashcard' | 'play') => void;
}) {
  return (
    <SegmentedControl
      value={mode}
      onValueChange={onChange}
      ariaLabel="Vocabulary mode"
      className={styles.modeToggle}
      optionClassName={styles.modeBtn}
      activeOptionClassName={styles.modeActive}
      options={[
        {
          value: 'list',
          label: 'List',
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          value: 'flashcard',
          label: 'Flashcards',
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          value: 'play',
          label: 'Play',
          icon: <Play size={16} />,
        },
      ]}
    />
  );
}

export function VocabularyStatsRow({
  total,
  stats,
  onFilter,
}: {
  total: number;
  stats: { new: number; repeated: number; mistakesWork: number; learned: number };
  onFilter: (value: string) => void;
}) {
  return (
    <div className={styles.statsRow}>
      <StatTile className={styles.statChip} interactive onClick={() => onFilter('all')} label="Total" labelClassName={styles.statLbl} value={total} valueClassName={styles.statNum} />
      <StatTile className={`${styles.statChip} ${styles.statBlue}`} interactive onClick={() => onFilter('new')} label="New" labelClassName={styles.statLbl} value={stats.new} valueClassName={styles.statNum} />
      <StatTile className={`${styles.statChip} ${styles.statAmber}`} interactive onClick={() => onFilter('repeated')} label="Repeated" labelClassName={styles.statLbl} value={stats.repeated} valueClassName={styles.statNum} />
      <StatTile className={`${styles.statChip} ${styles.statRose}`} interactive onClick={() => onFilter('mistakes_work')} label="Mistakes work" labelClassName={styles.statLbl} value={stats.mistakesWork} valueClassName={styles.statNum} />
      <StatTile className={`${styles.statChip} ${styles.statGreen}`} interactive onClick={() => onFilter('learned')} label="Learned" labelClassName={styles.statLbl} value={stats.learned} valueClassName={styles.statNum} />
    </div>
  );
}

export function VocabularyWordCards({
  items,
  onSetStatus,
  canSetLearned,
  animationIndexOffset = 0,
}: {
  items: VocabularyProgressItem[];
  onSetStatus: (entryId: number, status: VocabularyWordStatusName) => void;
  canSetLearned: boolean;
  /** Delay index shift when a prepend slot occupies the first grid cell. */
  animationIndexOffset?: number;
}) {
  const statusOptions: VocabularyWordStatusName[] = canSetLearned
    ? ['new', 'repeated', 'mistakes_work', 'learned']
    : [];

  return (
    <>
      {items.map(({ row, word, status }, i) => (
        <div
          key={row.id}
          className={styles.wordCard}
          style={{ animationDelay: `${(animationIndexOffset + i) * 0.03}s` }}
        >
          <div className={styles.wcTop}>
            <div>
              <div className={styles.wcWord}>{word.word}</div>
              <div className={styles.wcPhonetic}>{word.phonetic}</div>
            </div>
            <Badge
              className={`${styles.wcStatus} ${styles[status === 'new' ? 'blue' : status === 'repeated' ? 'amber' : status === 'mistakes_work' ? 'rose' : 'green']}`}
              variant={status === 'new' ? 'blue' : status === 'repeated' ? 'amber' : status === 'mistakes_work' ? 'rose' : 'green'}
            >
              {status}
            </Badge>
          </div>
          <div className={styles.wcPos}>{word.pos}</div>
          <div className={styles.wcDef}>{word.definition}</div>
          <div className={styles.wcExample}>&quot;{word.example}&quot;</div>
          {statusOptions.length > 0 ? (
            <div className={styles.wcActions}>
              {statusOptions.map((nextStatus) => (
                <Button
                  type="button"
                  key={nextStatus}
                  className={`${styles.wcBtn} ${status === nextStatus ? styles.wcBtnActive : ''}`}
                  onClick={() => onSetStatus(row.id, nextStatus)}
                >
                  {nextStatus}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
}

export function VocabularyListSection({
  search,
  setSearch,
  categories,
  filter,
  setFilter,
  lessonFilter,
  setLessonFilter,
  lessonOptions,
  filtered,
  onSetStatus,
  canSetLearned,
  prependSlot,
  totalSourceCount,
}: {
  search: string;
  setSearch: (value: string) => void;
  categories: string[];
  filter: string;
  setFilter: (value: string) => void;
  lessonFilter: string;
  setLessonFilter: (value: string) => void;
  lessonOptions: Array<{ value: string; label: string }>;
  filtered: VocabularyProgressItem[];
  onSetStatus: (entryId: number, status: VocabularyWordStatusName) => void;
  /** Students do not see manual status buttons (teacher only). */
  canSetLearned: boolean;
  prependSlot?: ReactNode;
  /** Full list size before search/category/status filters (for empty-state copy). */
  totalSourceCount: number;
}) {
  return (
    <>
      <div className={styles.filters}>
        <Field className={styles.searchInput} placeholder="Search words..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <AdaptiveSelect
          className={styles.lessonFilterSelect}
          value={lessonFilter}
          onChange={(event) => setLessonFilter(event.target.value)}
        >
          {lessonOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdaptiveSelect>
        <SegmentedControl
          value={filter}
          onValueChange={setFilter}
          ariaLabel="Vocabulary categories"
          className={styles.catFilters}
          optionClassName={styles.catBtn}
          activeOptionClassName={styles.catActive}
          options={categories.map((category) => ({
            value: category,
            label: category.charAt(0).toUpperCase() + category.slice(1),
          }))}
        />
      </div>

      <div className={styles.wordGrid}>
        {prependSlot}
        <VocabularyWordCards
          items={filtered}
          onSetStatus={onSetStatus}
          canSetLearned={canSetLearned}
          animationIndexOffset={prependSlot ? 1 : 0}
        />
      </div>
      {filtered.length === 0 && totalSourceCount > 0 ? (
        <EmptyStateCard
          className={styles.empty}
          title="No words match filters"
          description="Try a different filter or clear search."
        />
      ) : null}
      {filtered.length === 0 && totalSourceCount === 0 && !prependSlot ? (
        <EmptyStateCard className={styles.empty} title="No words found" description="Try a different filter." />
      ) : null}
    </>
  );
}

export function VocabularyFlashcardSection({
  cardIndex,
  total,
  currentItem,
  flipped,
  setFlipped,
  markStatus,
  setCardIndex,
  canSetLearned,
}: {
  cardIndex: number;
  total: number;
  currentItem?: VocabularyProgressItem;
  flipped: boolean;
  setFlipped: (v: boolean) => void;
  markStatus: (status: VocabularyWordStatusName) => void;
  setCardIndex: React.Dispatch<React.SetStateAction<number>>;
  canSetLearned: boolean;
}) {
  const word = currentItem?.word;
  return (
    <div className={`container container--form ${styles.flashcardMode}`}>
      <ProgressHeader className={styles.fcProgress} barClassName={styles.fcBar} fillClassName={styles.fcBarFill} current={cardIndex + 1} total={total} />
      {word ? (
        <>
          <div className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`} onClick={() => setFlipped(!flipped)}>
            <div className={styles.fcFront}>
              <div className={styles.fcHint}>Click to reveal definition</div>
              <div className={styles.fcWord}>{word.word}</div>
              <div className={styles.fcPhonetic}>{word.phonetic}</div>
              <div className={styles.fcCategory}>
                {word.category} · {word.pos}
              </div>
            </div>
            <div className={styles.fcBack}>
              <div className={styles.fcDef}>{word.definition}</div>
              <div className={styles.fcExample}>&quot;{word.example}&quot;</div>
            </div>
          </div>
          {flipped ? (
            <div className={styles.fcButtons}>
              <Button type="button" className={`${styles.fcBtn} ${styles.fcBtnRed}`} onClick={() => markStatus('new')}>Still learning</Button>
              <Button type="button" className={`${styles.fcBtn} ${styles.fcBtnAmber}`} onClick={() => markStatus('repeated')}>Repeated</Button>
              <Button type="button" className={`${styles.fcBtn} ${styles.fcBtnRed}`} onClick={() => markStatus('mistakes_work')}>Mistakes work</Button>
              {canSetLearned ? (
                <Button type="button" className={`${styles.fcBtn} ${styles.fcBtnGreen}`} onClick={() => markStatus('learned')}>
                  Learned <Check size={14} />
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className={styles.fcNav}>
            <Button type="button" className={styles.fcNavBtn} onClick={() => { setCardIndex((i) => Math.max(0, i - 1)); setFlipped(false); }} disabled={cardIndex === 0}>← Prev</Button>
            <Button type="button" className={styles.fcNavBtn} onClick={() => { setCardIndex((i) => Math.min(total - 1, i + 1)); setFlipped(false); }} disabled={cardIndex === total - 1}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </>
      ) : (
        <EmptyStateCard className={styles.fcComplete} icon={<div className={styles.fcCompleteIcon}><PartyPopper size={22} /></div>} title={<div className={styles.fcCompleteTitle}>All done!</div>} description={<div className={styles.fcCompleteSub}>You reviewed all {total} words. Great work!</div>} />
      )}
    </div>
  );
}

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
  playQuestions: Array<{ entryId: number; vocabularyId: number; word: string; phonetic: string; correct: string; options: string[] }>;
  playIndex: number;
  playSelected: string | null;
  playShowExplanation: boolean;
  playAnswers: boolean[];
  playScore: number;
  playPhase: 'setup' | 'quiz' | 'result';
  canStart: boolean;
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
  return (
    <div className={styles.playWrap}>
      {playPhase === 'setup' ? (
        <div className={styles.playControls}>
          <SegmentedControl
            value={playSource}
            onValueChange={(next) => setPlaySource(next as 'random' | 'last' | 'lesson')}
            ariaLabel="Play source"
            className={styles.catFilters}
            optionClassName={styles.catBtn}
            activeOptionClassName={styles.catActive}
            options={[
              { value: 'random', label: 'Without lesson' },
              { value: 'last', label: 'Words from last lesson' },
              { value: 'lesson', label: 'Words by lesson' },
            ]}
          />
          {playSource === 'lesson' ? (
            <AdaptiveSelect className={styles.lessonFilterSelect} value={playLessonId} onChange={(e) => setPlayLessonId(e.target.value)}>
              <option value="all">Without lesson</option>
              {playLessonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdaptiveSelect>
          ) : null}
          <Button type="button" className={styles.playStartBtn} disabled={!canStart} onClick={onStart}>
            Play
          </Button>
        </div>
      ) : null}

      {playPhase === 'setup' ? (
        <EmptyStateCard
          className={styles.empty}
          title="Ready to play"
          description="By default we use words without lesson filter: new + mistakes work first, then all words if needed."
        />
      ) : null}

      {playPhase === 'quiz' && current ? (
        <div className={styles.playQuestionCard}>
          <div className={styles.playProgress}>
            {playIndex + 1} / {playQuestions.length}
          </div>
          <div className={styles.scoreRow}>
            {playAnswers.map((ok, i) => (
              <div key={i} className={`${styles.scoreDot} ${ok ? styles.scoreDotGreen : styles.scoreDotRed}`} />
            ))}
            {Array.from({ length: playQuestions.length - playAnswers.length }).map((_, i) => (
              <div key={`p-empty-${i}`} className={styles.scoreDotEmpty} />
            ))}
          </div>
          <div className={styles.flashcard}>
            <div className={styles.fcFront}>
              <div className={styles.fcHint}>Choose the correct translation</div>
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
                  type="button"
                  className={`${styles.playOptionBtn} ${!playShowExplanation && isSelected ? styles.playOptionSelected : ''} ${resultClass}`}
                  disabled={playShowExplanation}
                  onClick={() => onSelect(option)}
                >
                  <span className={styles.playOptionLetter}>{String.fromCharCode(65 + optionIndex)}</span>
                  {option}
                </Button>
              );
            })}
          </div>
          {playShowExplanation ? (
            <div className={`${styles.explanation} ${playSelected === current.correct ? styles.expCorrect : styles.expWrong}`}>
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
              <div className={styles.expText}>Correct answer: {current.correct}</div>
            </div>
          ) : null}
          <div className={styles.qActions}>
            <Button type="button" className={styles.finishBtn} onClick={() => setShowFinishConfirm(true)}>
              Finish game
            </Button>
            {!playShowExplanation ? (
              <Button type="button" className={styles.checkBtn} disabled={!playSelected} onClick={onCheck}>
                Check Answer
              </Button>
            ) : (
              <Button type="button" className={styles.nextBtn} onClick={onNext}>
                {playIndex + 1 >= playQuestions.length ? 'See Results →' : 'Next Question →'}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {complete ? (
        <EmptyStateCard
          className={styles.fcComplete}
          icon={<div className={styles.fcCompleteIcon}><PartyPopper size={22} /></div>}
          title={<div className={styles.fcCompleteTitle}>Round complete</div>}
          description={<div className={styles.fcCompleteSub}>{playScore} / {playQuestions.length} correct</div>}
          action={
            <Button type="button" className={styles.fcRestartBtn} onClick={onReset}>
              New round
            </Button>
          }
        />
      ) : null}
      {showFinishConfirm ? (
        <div className={styles.modalOverlay} onClick={() => setShowFinishConfirm(false)}>
          <div className={styles.finishModal} onClick={(e) => e.stopPropagation()}>
            <h3>Finish game now?</h3>
            <p>Your current progress will be saved and results will be shown immediately.</p>
            <div className={styles.finishActions}>
              <Button type="button" className={styles.modalCancelBtn} onClick={() => setShowFinishConfirm(false)}>
                Continue game
              </Button>
              <Button
                type="button"
                className={styles.modalSubmitBtn}
                onClick={() => {
                  setShowFinishConfirm(false);
                  onFinish();
                }}
              >
                Yes, finish
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
