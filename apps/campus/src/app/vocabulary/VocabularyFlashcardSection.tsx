'use client';

import { useMemo } from 'react';
import { type VocabularyWordStatusName } from '@pkg/types';
import { Check, ChevronRight, Info, PartyPopper } from 'lucide-react';
import { Badge, Button, EmptyStateCard, ProgressHeader } from '../../components/ui';
import { VerbFormsLine } from '../../components/vocabulary/VerbFormsLine';
import { WordCardAudioButton } from '../../features/vocabulary/WordCardAudioButton';
import { useCampusT } from '../../lib/cms';
import { glossFromDefinition, pickNativeDefinitions } from '../../lib/word-definitions';
import {
  resolveVocabularyGlossesForPosFilter,
  type VocabularyListItem,
} from '../../lib/vocabulary-ui';
import { formatPosFilterLabel } from './VocabularyWordCards';
import styles from './page.module.scss';

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
  const t = useCampusT();
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
      const g = glossFromDefinition(row);
      if (!g) continue;
      rows.push({
        key: row.partOfSpeech?.trim() || 'default',
        partOfSpeech: row.partOfSpeech?.trim() || undefined,
        gloss: g,
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
        { status: 'new', label: t('vocabulary.fc.stillLearning'), className: styles.fcBtnRed },
        { status: 'repeated', label: t('vocabulary.fc.gotIt'), className: styles.fcBtnGreen },
      ]
    : [
        { status: 'new', label: t('vocabulary.fc.stillLearning'), className: styles.fcBtnRed },
        { status: 'repeated', label: t('vocabulary.status.repeated'), className: styles.fcBtnAmber },
        {
          status: 'mistakes_work',
          label: t('vocabulary.status.mistakes_work'),
          className: styles.fcBtnRed,
        },
        ...(canSetLearned
          ? [{ status: 'learned' as const, label: t('vocabulary.status.learned'), className: styles.fcBtnGreen }]
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
          title={t('common.loading')}
          description={t('vocabulary.empty.fetching')}
        />
      ) : emptyAfterFilters ? (
        <EmptyStateCard
          className={styles.empty}
          title={t('vocabulary.empty.noMatch')}
          description={t('vocabulary.empty.flashNoMatchHint')}
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
                    {t(`vocabulary.status.${status}`)}
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
                    aria-label={t('vocabulary.detailsAria')}
                    title={t('vocabulary.detailsAria')}
                  >
                    <Info size={16} aria-hidden />
                  </Button>
                ) : null}
              </div>
            )}
            <div
              className={styles.flashcard}
              data-tour-anchor="vocab-flashcard"
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
                            {formatPosFilterLabel(pos, t('vocabulary.filter.all'))}
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
                              {formatPosFilterLabel(row.partOfSpeech, t('vocabulary.filter.all'))}
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
                      <span className={styles.fcSynonymsLabel}>{t('vocabulary.fc.synonyms')}</span>
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
              {t('vocabulary.fc.prev')}
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
              {t('vocabulary.fc.next')} <ChevronRight size={14} />
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
          title={<div className={styles.fcCompleteTitle}>{t('vocabulary.fc.allDone')}</div>}
          description={
            <div className={styles.fcCompleteSub}>
              {t('vocabulary.fc.allDoneSub', { count: total })}
            </div>
          }
          action={
            onRestart && !isStudent ? (
              <Button
                type='button'
                className={styles.fcRestartBtn}
                onClick={onRestart}
              >
                {t('vocabulary.fc.restart')}
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
