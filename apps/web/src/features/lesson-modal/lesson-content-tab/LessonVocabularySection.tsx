'use client';

import { Info } from 'lucide-react';
import { Badge, Button } from '../../../components/ui';
import { vocabularyStatusLabel, type VocabularyWordStatusName, type WordCardDto } from '@pkg/types';
import { LessonVocabularyAddPanel } from '../../vocabulary/LessonVocabularyAddPanel';
import { WordCardAudioButton } from '../../vocabulary/WordCardAudioButton';
import { WordDetailsModal } from '../../vocabulary/WordDetailsModal';
import { pickWordDefinition } from '../../../lib/word-definitions';
import type { LessonFormState } from '../types';
import vocabStyles from '../../../app/vocabulary/page.module.scss';
import styles from '../LessonModal.module.scss';

interface Props {
  form: LessonFormState;
  onChange: (next: LessonFormState) => void;
  linkedWords: WordCardDto[];
  cardStatusByWordId: Map<string, VocabularyWordStatusName>;
  canViewLessonVocabulary: boolean;
  canAddLessonVocabulary: boolean;
  canEditHomework: boolean;
  studentBackendId: string | null | undefined;
  lessonBackendId: string | null | undefined;
  nativeLanguageId: string | null | undefined;
  englishLanguageId: string | null | undefined;
  detailsWordId: string | null;
  setDetailsWordId: (id: string | null) => void;
}

const statusTone = (status: VocabularyWordStatusName) => {
  if (status === 'new') return 'blue';
  if (status === 'repeated') return 'amber';
  if (status === 'mistakes_work') return 'rose';
  return 'green';
};

export function LessonVocabularySection({
  form, onChange, linkedWords, cardStatusByWordId,
  canViewLessonVocabulary, canAddLessonVocabulary, canEditHomework,
  studentBackendId, lessonBackendId, nativeLanguageId, englishLanguageId,
  detailsWordId, setDetailsWordId,
}: Props) {
  if (!canViewLessonVocabulary) return null;

  return (
    <>
      <div className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.lessonVocabCard}`}>
        <label className={styles.fieldLabel}>Lesson vocabulary</label>
        {linkedWords.length > 0 ? (
          <div className={styles.lessonVocabWordGrid}>
            <div className={`${vocabStyles.wordGrid} ${styles.lessonVocabWordGridList}`}>
              {linkedWords.map((w, i) => {
                const status: VocabularyWordStatusName = cardStatusByWordId.get(w.id) ?? 'new';
                const tone = statusTone(status);
                return (
                  <div key={w.id} className={vocabStyles.wordCard} style={{ animationDelay: `${i * 0.03}s` }}>
                    <div className={vocabStyles.wcTop}>
                      <div>
                        <div className={vocabStyles.wcWord}>{w.text}</div>
                        <div className={vocabStyles.wcPhoneticRow}>
                          {w.phonetic ? <div className={vocabStyles.wcPhonetic}>{w.phonetic}</div> : null}
                          <WordCardAudioButton audioUrl={w.audioUrl} className={vocabStyles.wcAudioBtn} />
                        </div>
                      </div>
                      <div className={vocabStyles.wcTopActions}>
                        <Button type="button" variant="ghost" className={vocabStyles.wcDetailsBtn} onClick={() => setDetailsWordId(w.id)} aria-label="All information" title="All information">
                          <Info size={16} aria-hidden />
                        </Button>
                        <Badge className={`${vocabStyles.wcStatus} ${vocabStyles[tone]}`} variant={tone}>
                          {vocabularyStatusLabel(status)}
                        </Badge>
                      </div>
                    </div>
                    <div className={vocabStyles.wcPos}>{w.partOfSpeech ?? '—'}</div>
                    {w.origin ? <div className={vocabStyles.wcOrigin}>{w.origin}</div> : null}
                    <div className={vocabStyles.wcDef}>{pickWordDefinition(w.definitions, nativeLanguageId, englishLanguageId, w.definition)}</div>
                    {w.example ? <div className={vocabStyles.wcExample}>&quot;{w.example}&quot;</div> : null}
                    {canEditHomework ? (
                      <Button type="button" className={styles.lessonVocabAddBtn} onClick={() => onChange({ ...form, linkedWordIds: form.linkedWordIds.filter((id) => id !== w.id) })}>Remove</Button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        <LessonVocabularyAddPanel
          linkedWordIds={form.linkedWordIds}
          studentBackendId={studentBackendId ?? null}
          lessonBackendId={lessonBackendId ?? null}
          disabled={!canAddLessonVocabulary}
          onAddWordId={(wordId) => onChange({ ...form, linkedWordIds: form.linkedWordIds.includes(wordId) ? form.linkedWordIds : [...form.linkedWordIds, wordId] })}
        />
      </div>
      {detailsWordId ? <WordDetailsModal wordId={detailsWordId} onClose={() => setDetailsWordId(null)} /> : null}
    </>
  );
}
