'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  vocabularyStatusLabel,
  type VocabularyWordStatusName,
} from '@pkg/types';
import {
  Check,
  ChevronRight,
  Info,
  PartyPopper,
  Play,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  EmptyStateCard,
  Field,
  ProgressHeader,
  SegmentedControl,
  StatTile,
} from '../../components/ui';
import { VerbFormsLine } from '../../components/vocabulary/VerbFormsLine';
import { WordCardAudioButton } from '../../features/vocabulary/WordCardAudioButton';
import {
  validateEnglishWordInput,
  VOCABULARY_WORD_NOT_FOUND,
} from '../../lib/vocabulary-word-input';
import { glossFromDefinition, pickNativeDefinitions } from '../../lib/word-definitions';
import {
  resolveVocabularyGlossesForPosFilter,
  type VocabularyListItem,
  type VocabularyPlayQuestion,
} from '../../lib/vocabulary-ui';
import { useVocabularyStore } from '../../stores/vocabulary-store';
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
      ariaLabel='Vocabulary mode'
      className={styles.modeToggle}
      optionClassName={styles.modeBtn}
      activeOptionClassName={styles.modeActive}
      options={[
        {
          value: 'list',
          label: 'List',
          icon: (
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <path
                d='M2 4h12M2 8h12M2 12h8'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
              />
            </svg>
          ),
        },
        {
          value: 'flashcard',
          label: 'Flashcards',
          icon: (
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <rect
                x='2'
                y='4'
                width='12'
                height='9'
                rx='1.5'
                stroke='currentColor'
                strokeWidth='1.5'
              />
              <path
                d='M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1'
                stroke='currentColor'
                strokeWidth='1.5'
              />
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
  stats: {
    new: number;
    repeated: number;
    mistakesWork: number;
    learned: number;
  };
  onFilter: (value: string) => void;
}) {
  return (
    <div className={styles.statsRow}>
      <StatTile
        className={styles.statChip}
        interactive
        onClick={() => onFilter('all')}
        label='Total'
        labelClassName={styles.statLbl}
        value={total}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statBlue}`}
        interactive
        onClick={() => onFilter('new')}
        label='New'
        labelClassName={styles.statLbl}
        value={stats.new}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statAmber}`}
        interactive
        onClick={() => onFilter('repeated')}
        label='Repeated'
        labelClassName={styles.statLbl}
        value={stats.repeated}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statRose}`}
        interactive
        onClick={() => onFilter('mistakes_work')}
        label={vocabularyStatusLabel('mistakes_work')}
        labelClassName={styles.statLbl}
        value={stats.mistakesWork}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statGreen}`}
        interactive
        onClick={() => onFilter('learned')}
        label='Learned'
        labelClassName={styles.statLbl}
        value={stats.learned}
        valueClassName={styles.statNum}
      />
    </div>
  );
}

export function VocabularyAddWordBar({
  onAdd,
  disabled = false,
}: {
  onAdd: (text: string) => Promise<void>;
  disabled?: boolean;
}) {
  const lookupWord = useVocabularyStore(s => s.lookupWord);
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || adding) return;

    const englishError = validateEnglishWordInput(trimmed);
    if (englishError) {
      setError(englishError);
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const result = await lookupWord(trimmed);
      if (!result.foundInDictionary) {
        setError(VOCABULARY_WORD_NOT_FOUND);
        return;
      }
      await onAdd(trimmed);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.addWordCard}>
      <form className={styles.addWordForm} onSubmit={onSubmit}>
        <Field
          className={styles.searchInput}
          type='text'
          placeholder='Add a word (English), e.g. articulate'
          value={text}
          onChange={event => setText(event.target.value)}
          disabled={disabled || adding}
        />
        <Button type='submit' disabled={disabled || adding || !text.trim()}>
          {adding ? 'Adding…' : 'Add word'}
        </Button>
      </form>
      {error ? <div className={styles.addWordError}>{error}</div> : null}
    </div>
  );
}

export function VocabularyWordCards({
  items,
  onSetStatus,
  canSetLearned,
  canDelete = false,
  onDelete,
  onOpenWordDetails,
  posFilter = 'All',
  nativeLanguageId,
  englishLanguageId,
  animationIndexOffset = 0,
}: {
  items: VocabularyListItem[];
  onSetStatus: (cardId: string, status: VocabularyWordStatusName) => void;
  canSetLearned: boolean;
  canDelete?: boolean;
  onDelete?: (cardId: string) => void;
  onOpenWordDetails?: (wordId: string) => void;
  posFilter?: string;
  nativeLanguageId?: string | null;
  englishLanguageId?: string | null;
  /** Delay index shift when a prepend slot occupies the first grid cell. */
  animationIndexOffset?: number;
}) {
  const statusOptions: VocabularyWordStatusName[] = canSetLearned
    ? ['new', 'repeated', 'mistakes_work', 'learned']
    : [];

  return (
    <>
      {items.map(({ card, display, status }, i) => {
        const gloss = resolveVocabularyGlossesForPosFilter(
          display,
          posFilter,
          nativeLanguageId,
          englishLanguageId,
          card.word.definition,
        );
        return (
        <div
          key={card.id}
          className={styles.wordCard}
          style={{ animationDelay: `${(animationIndexOffset + i) * 0.03}s` }}
        >
          <div className={styles.wcTop}>
            <div>
              <div className={styles.wcWord}>{display.word}</div>
              <div className={styles.wcPhoneticRow}>
                {display.phonetic ? (
                  <div className={styles.wcPhonetic}>{display.phonetic}</div>
                ) : null}
                <WordCardAudioButton
                  audioUrl={display.audioUrl}
                  className={styles.wcAudioBtn}
                />
              </div>
            </div>
            <div className={styles.wcTopActions}>
              {onOpenWordDetails &&
              display.wordId &&
              display.wordId !== 'preview' ? (
                <Button
                  type='button'
                  variant='ghost'
                  className={styles.wcDetailsBtn}
                  onClick={() => onOpenWordDetails(display.wordId)}
                  aria-label='All information'
                  title='All information'
                >
                  <Info size={16} aria-hidden />
                </Button>
              ) : null}
              {canDelete && onDelete ? (
                <Button
                  type='button'
                  variant='ghost'
                  className={styles.wcDeleteBtn}
                  onClick={() => onDelete(card.id)}
                  aria-label='Remove word'
                  title='Remove word'
                >
                  <Trash2 size={16} aria-hidden />
                </Button>
              ) : null}
              <Badge
                className={`${styles.wcStatus} ${styles[status === 'new' ? 'blue' : status === 'repeated' ? 'amber' : status === 'mistakes_work' ? 'rose' : 'green']}`}
                variant={
                  status === 'new'
                    ? 'blue'
                    : status === 'repeated'
                      ? 'amber'
                      : status === 'mistakes_work'
                        ? 'rose'
                        : 'green'
                }
              >
                {vocabularyStatusLabel(status)}
              </Badge>
            </div>
          </div>
          <div className={styles.wcPos}>{gloss.posLabel}</div>
          {display.verbForms ? (
            <VerbFormsLine verbForms={display.verbForms} className={styles.wcVerbForms} />
          ) : null}
          {display.origin ? (
            <div className={styles.wcOrigin}>{display.origin}</div>
          ) : null}
          {gloss.translation &&
          gloss.translation.trim() !== gloss.definition.trim() ? (
            <div className={styles.wcTranslation}>{gloss.translation}</div>
          ) : null}
          <div className={styles.wcDef}>{gloss.definition}</div>
          {display.example ? (
            <div className={styles.wcExample}>
              &quot;{display.example}&quot;
            </div>
          ) : null}
          {statusOptions.length > 0 ? (
            <div className={styles.wcActions}>
              {statusOptions.map(nextStatus => (
                <Button
                  type='button'
                  key={nextStatus}
                  className={`${styles.wcBtn} ${status === nextStatus ? styles.wcBtnActive : ''}`}
                  onClick={() => onSetStatus(card.id, nextStatus)}
                >
                  {vocabularyStatusLabel(nextStatus)}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        );
      })}
    </>
  );
}

function formatPosFilterLabel(pos: string): string {
  if (pos === 'All') return 'All';
  return pos.charAt(0).toUpperCase() + pos.slice(1);
}

export function VocabularyFiltersBar({
  search,
  setSearch,
  posFilters,
  filter,
  setFilter,
  lessonFilter,
  setLessonFilter,
  lessonOptions,
}: {
  search: string;
  setSearch: (value: string) => void;
  posFilters: string[];
  filter: string;
  setFilter: (value: string) => void;
  lessonFilter: string;
  setLessonFilter: (value: string) => void;
  lessonOptions: Array<{ value: string; label: string }>;
}) {
  return (
    <div className={styles.filters}>
      <Field
        className={styles.searchInput}
        placeholder='Search words...'
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Field as="select"
        className={styles.lessonFilterSelect}
        value={lessonFilter}
        onChange={event => setLessonFilter(event.target.value)}
      >
        {lessonOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
      <SegmentedControl
        value={filter}
        onValueChange={setFilter}
        ariaLabel='Part of speech'
        className={styles.catFilters}
        optionClassName={styles.catBtn}
        activeOptionClassName={styles.catActive}
        options={posFilters.map(pos => ({
          value: pos,
          label: formatPosFilterLabel(pos),
        }))}
      />
    </div>
  );
}

export function VocabularyListSection({
  search,
  setSearch,
  posFilters,
  posFilter,
  setPosFilter,
  lessonFilter,
  setLessonFilter,
  lessonOptions,
  filtered,
  nativeLanguageId,
  englishLanguageId,
  onSetStatus,
  canSetLearned,
  canDelete = false,
  onDelete,
  onOpenWordDetails,
  prependSlot,
  totalSourceCount,
  isLoading = false,
}: {
  search: string;
  setSearch: (value: string) => void;
  posFilters: string[];
  posFilter: string;
  setPosFilter: (value: string) => void;
  lessonFilter: string;
  setLessonFilter: (value: string) => void;
  lessonOptions: Array<{ value: string; label: string }>;
  filtered: VocabularyListItem[];
  nativeLanguageId?: string | null;
  englishLanguageId?: string | null;
  onSetStatus: (cardId: string, status: VocabularyWordStatusName) => void;
  /** Students do not see manual status buttons (teacher only). */
  canSetLearned: boolean;
  canDelete?: boolean;
  onDelete?: (cardId: string) => void;
  onOpenWordDetails?: (wordId: string) => void;
  prependSlot?: ReactNode;
  /** Full list size before search/category/status filters (for empty-state copy). */
  totalSourceCount: number;
  isLoading?: boolean;
}) {
  return (
    <>
      <VocabularyFiltersBar
        search={search}
        setSearch={setSearch}
        posFilters={posFilters}
        filter={posFilter}
        setFilter={setPosFilter}
        lessonFilter={lessonFilter}
        setLessonFilter={setLessonFilter}
        lessonOptions={lessonOptions}
      />

      <div className={styles.wordGrid}>
        {prependSlot}
        <VocabularyWordCards
          items={filtered}
          posFilter={posFilter}
          nativeLanguageId={nativeLanguageId}
          englishLanguageId={englishLanguageId}
          onSetStatus={onSetStatus}
          canSetLearned={canSetLearned}
          canDelete={canDelete}
          onDelete={onDelete}
          onOpenWordDetails={onOpenWordDetails}
          animationIndexOffset={prependSlot ? 1 : 0}
        />
      </div>
      {filtered.length === 0 && totalSourceCount > 0 ? (
        <EmptyStateCard
          className={styles.empty}
          title='No words match filters'
          description='Try a different filter or clear search.'
        />
      ) : null}
      {isLoading ? (
        <EmptyStateCard
          className={styles.empty}
          title='Loading vocabulary…'
          description='Fetching your words.'
        />
      ) : null}
      {!isLoading &&
      filtered.length === 0 &&
      totalSourceCount === 0 &&
      !prependSlot ? (
        <EmptyStateCard
          className={styles.empty}
          title='No words yet'
          description='Add your first word using the form above.'
        />
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
  isStudent = false,
  posFilter = 'All',
  nativeLanguageId,
  englishLanguageId,
  lessonTitle,
  onOpenWordDetails,
  onRestart,
  isLoading = false,
  emptyAfterFilters = false,
}: {
  cardIndex: number;
  total: number;
  currentItem?: VocabularyListItem;
  flipped: boolean;
  setFlipped: (v: boolean) => void;
  markStatus: (status: VocabularyWordStatusName) => void;
  setCardIndex: React.Dispatch<React.SetStateAction<number>>;
  canSetLearned: boolean;
  isStudent?: boolean;
  posFilter?: string;
  nativeLanguageId?: string | null;
  englishLanguageId?: string | null;
  lessonTitle?: string;
  onOpenWordDetails?: (wordId: string) => void;
  onRestart?: () => void;
  isLoading?: boolean;
  emptyAfterFilters?: boolean;
}) {
  const display = currentItem?.display;
  const status = currentItem?.status;
  const gloss = useMemo(() => {
    if (!display) return null;
    return resolveVocabularyGlossesForPosFilter(
      display,
      posFilter,
      nativeLanguageId,
      englishLanguageId,
      currentItem?.card.word.definition,
    );
  }, [currentItem?.card.word.definition, display, posFilter, nativeLanguageId, englishLanguageId]);
  const showTranslation = Boolean(
    gloss?.translation && gloss.translation.trim() !== gloss.definition.trim(),
  );
  const nativeGlosses = useMemo(() => {
    if (!display?.definitions?.length) return [];
    const rows: Array<{ key: string; partOfSpeech?: string; gloss: string }> = [];
    for (const row of pickNativeDefinitions(
      display.definitions,
      nativeLanguageId,
      englishLanguageId ?? undefined,
      posFilter,
    )) {
      const gloss = glossFromDefinition(row);
      if (!gloss) continue;
      rows.push({
        key: row.partOfSpeech?.trim() || 'default',
        partOfSpeech: row.partOfSpeech?.trim() || undefined,
        gloss,
      });
    }
    return rows;
  }, [display?.definitions, nativeLanguageId, englishLanguageId, posFilter]);

  const statusActions: Array<{
    status: VocabularyWordStatusName;
    label: string;
    className: string;
  }> = isStudent
    ? [
        { status: 'new', label: 'Still learning', className: styles.fcBtnRed },
        { status: 'repeated', label: 'Got it', className: styles.fcBtnGreen },
      ]
    : [
        { status: 'new', label: 'Still learning', className: styles.fcBtnRed },
        { status: 'repeated', label: 'Repeated', className: styles.fcBtnAmber },
        {
          status: 'mistakes_work',
          label: vocabularyStatusLabel('mistakes_work'),
          className: styles.fcBtnRed,
        },
        ...(canSetLearned
          ? [{ status: 'learned' as const, label: 'Learned', className: styles.fcBtnGreen }]
          : []),
      ];

  return (
    <div className={`container container--form ${styles.flashcardMode}`}>
      <ProgressHeader
        className={styles.fcProgress}
        barClassName={styles.fcBar}
        fillClassName={styles.fcBarFill}
        current={cardIndex + 1}
        total={total}
      />
      {isLoading ? (
        <EmptyStateCard
          className={styles.empty}
          title='Loading…'
          description='Fetching your words.'
        />
      ) : emptyAfterFilters ? (
        <EmptyStateCard
          className={styles.empty}
          title='No words match filters'
          description='Try a different lesson, part of speech, or clear search.'
        />
      ) : display ? (
        <>
          <div className={styles.fcCardShell}>
            {(status || onOpenWordDetails) && (
              <div
                className={styles.fcToolbar}
                onClick={event => event.stopPropagation()}
              >
                {status ? (
                  <Badge
                    className={`${styles.fcStatus} ${styles[status === 'new' ? 'blue' : status === 'repeated' ? 'amber' : status === 'mistakes_work' ? 'rose' : 'green']}`}
                    variant={
                      status === 'new'
                        ? 'blue'
                        : status === 'repeated'
                          ? 'amber'
                          : status === 'mistakes_work'
                            ? 'rose'
                            : 'green'
                    }
                  >
                    {vocabularyStatusLabel(status)}
                  </Badge>
                ) : (
                  <span />
                )}
                {onOpenWordDetails &&
                display.wordId &&
                display.wordId !== 'preview' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    className={styles.fcDetailsBtn}
                    onClick={() => onOpenWordDetails(display.wordId)}
                    aria-label='All information'
                    title='All information'
                  >
                    <Info size={16} aria-hidden />
                  </Button>
                ) : null}
              </div>
            )}
            <div
              className={styles.flashcard}
              onClick={() => setFlipped(!flipped)}
            >
              {!flipped ? (
                <div className={styles.fcFront}>
                  <div className={styles.fcHint}>Tap to reveal</div>
                  <div className={styles.fcWord}>{display.word}</div>
                  {display.phonetic || display.audioUrl ? (
                    <div
                      className={styles.fcPhoneticRow}
                      onClick={event => event.stopPropagation()}
                    >
                      {display.phonetic ? (
                        <span className={styles.fcPhonetic}>{display.phonetic}</span>
                      ) : null}
                      <WordCardAudioButton
                        audioUrl={display.audioUrl}
                        className={styles.fcAudioBtn}
                        iconSize={18}
                      />
                    </div>
                  ) : null}
                  {display.partsOfSpeech.length > 0 ? (
                    <div className={styles.fcPosRow}>
                      {display.partsOfSpeech.map(pos => {
                        const isActive =
                          posFilter !== 'All' &&
                          pos.toLowerCase() === posFilter.toLowerCase();
                        return (
                          <span
                            key={pos}
                            className={`${styles.fcPosBadge} ${isActive ? styles.fcPosBadgeActive : ''}`}
                          >
                            {formatPosFilterLabel(pos)}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                  {display.verbForms ? (
                    <VerbFormsLine
                      verbForms={display.verbForms}
                      className={styles.fcVerbForms}
                    />
                  ) : null}
                  <div className={styles.fcMeta}>
                    {display.category && display.category !== 'General' ? (
                      <span>{display.category}</span>
                    ) : null}
                    {lessonTitle ? (
                      <span className={styles.fcLesson}>{lessonTitle}</span>
                    ) : null}
                  </div>
                  {display.origin ? (
                    <div className={styles.fcOrigin}>{display.origin}</div>
                  ) : null}
                </div>
              ) : (
                <div className={styles.fcBack}>
                  {nativeGlosses.length > 0 ? (
                    <div className={styles.fcGlossList}>
                      {nativeGlosses.map(row => (
                        <div key={row.key} className={styles.fcGlossRow}>
                          {row.partOfSpeech ? (
                            <span className={styles.fcGlossPos}>
                              {formatPosFilterLabel(row.partOfSpeech)}
                            </span>
                          ) : null}
                          <span className={styles.fcGlossText}>{row.gloss}</span>
                        </div>
                      ))}
                    </div>
                  ) : showTranslation && gloss ? (
                    <div className={styles.fcTranslation}>{gloss.translation}</div>
                  ) : null}
                  {gloss ? <div className={styles.fcDef}>{gloss.definition}</div> : null}
                  {display.example ? (
                    <div className={styles.fcExample}>
                      &quot;{display.example}&quot;
                    </div>
                  ) : null}
                  {display.synonyms.length > 0 ? (
                    <div className={styles.fcSynonyms}>
                      <span className={styles.fcSynonymsLabel}>Synonyms</span>
                      {display.synonyms.slice(0, 6).join(', ')}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          {flipped ? (
            <div className={styles.fcButtons}>
              {statusActions.map(action => (
                <Button
                  key={action.status}
                  type='button'
                  className={`${styles.fcBtn} ${action.className}`}
                  onClick={() => markStatus(action.status)}
                >
                  {action.label}
                  {action.status === 'learned' ? <Check size={14} /> : null}
                </Button>
              ))}
            </div>
          ) : null}
          <div className={styles.fcNav}>
            <Button
              type='button'
              className={styles.fcNavBtn}
              onClick={() => {
                setCardIndex(i => Math.max(0, i - 1));
                setFlipped(false);
              }}
              disabled={cardIndex === 0}
            >
              ← Prev
            </Button>
            <Button
              type='button'
              className={styles.fcNavBtn}
              onClick={() => {
                setCardIndex(i => Math.min(total - 1, i + 1));
                setFlipped(false);
              }}
              disabled={cardIndex === total - 1}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </>
      ) : (
        <EmptyStateCard
          className={styles.fcComplete}
          icon={
            <div className={styles.fcCompleteIcon}>
              <PartyPopper size={22} />
            </div>
          }
          title={<div className={styles.fcCompleteTitle}>All done!</div>}
          description={
            <div className={styles.fcCompleteSub}>
              You went through all {total} words. Great work!
            </div>
          }
          action={
            onRestart && !isStudent ? (
              <Button
                type='button'
                className={styles.fcRestartBtn}
                onClick={onRestart}
              >
                Start over
              </Button>
            ) : undefined
          }
        />
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
          >
            <h3>Finish game now?</h3>
            <p>
              Your current progress will be saved and results will be shown
              immediately.
            </p>
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
