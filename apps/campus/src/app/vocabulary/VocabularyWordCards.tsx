'use client';

import {
  vocabularyStatusLabel,
  type VocabularyWordStatusName,
} from '@pkg/types';
import { Info, Trash2 } from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import { VerbFormsLine } from '../../components/vocabulary/VerbFormsLine';
import { WordCardAudioButton } from '../../features/vocabulary/WordCardAudioButton';
import { resolveVocabularyGlossesForPosFilter, type VocabularyListItem } from '../../lib/vocabulary-ui';
import styles from './page.module.scss';

function formatPosFilterLabel(pos: string): string {
  if (pos === 'All') return 'All';
  return pos.charAt(0).toUpperCase() + pos.slice(1);
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

export { formatPosFilterLabel };
