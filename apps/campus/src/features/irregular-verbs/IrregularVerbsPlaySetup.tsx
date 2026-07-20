'use client';

import type { IrregularVerbTier } from '@pkg/types';
import { Play } from 'lucide-react';
import { Button, SegmentedControl } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import {
  availableQuestionCounts,
  type IrregularVerbFormFocus,
  type IrregularVerbQuestionCount,
} from '../../lib/irregular-verbs-drill';
import styles from './IrregularVerbs.module.scss';

type Props = {
  tier: IrregularVerbTier;
  poolCount: number;
  formFocus: IrregularVerbFormFocus;
  questionCount: IrregularVerbQuestionCount;
  canStart: boolean;
  onFormFocusChange: (value: IrregularVerbFormFocus) => void;
  onQuestionCountChange: (value: IrregularVerbQuestionCount) => void;
  onStart: () => void;
  onCancel: () => void;
};

export function IrregularVerbsPlaySetup({
  tier,
  poolCount,
  formFocus,
  questionCount,
  canStart,
  onFormFocusChange,
  onQuestionCountChange,
  onStart,
  onCancel,
}: Props) {
  const t = useCampusT();
  const countOptions = availableQuestionCounts(tier);

  return (
    <div className={styles.playSetup}>
      <div className={styles.playSetupHero}>
        <div className={styles.playSetupIcon} aria-hidden>
          <Play size={28} />
        </div>
        <h2 className={styles.playSetupTitle}>{t('irregular.setup.title')}</h2>
        <p className={styles.playSetupDescription}>{t('irregular.setup.description')}</p>
        <p className={styles.playSetupMeta}>
          {poolCount === 1
            ? t('irregular.setup.metaOne', { count: poolCount })
            : t('irregular.setup.metaMany', { count: poolCount })}
        </p>
      </div>

      <div className={styles.playSetupFields}>
        <div className={styles.playSetupField}>
          <span className={styles.playSetupLabel}>{t('irregular.setup.formFocus')}</span>
          <SegmentedControl
            value={formFocus}
            onValueChange={onFormFocusChange}
            ariaLabel={t('irregular.setup.formFocusAria')}
            className={styles.playSetupSegment}
            options={[
              { value: 'mixed', label: t('irregular.setup.mixed') },
              { value: 'pastSimple', label: t('irregular.col.pastSimple') },
              { value: 'pastParticiple', label: t('irregular.col.pastParticiple') },
            ]}
          />
        </div>

        <div className={styles.playSetupField}>
          <span className={styles.playSetupLabel}>{t('irregular.setup.questions')}</span>
          <SegmentedControl
            value={String(questionCount)}
            onValueChange={(value) =>
              onQuestionCountChange(
                value === 'all' ? 'all' : (Number(value) as IrregularVerbQuestionCount),
              )
            }
            ariaLabel={t('irregular.setup.questionsAria')}
            className={styles.playSetupSegment}
            options={countOptions.map((count) => ({
              value: String(count),
              label: count === 'all' ? t('irregular.setup.all') : String(count),
            }))}
          />
        </div>
      </div>

      <div className={styles.playSetupActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('irregular.setup.back')}
        </Button>
        <Button type="button" disabled={!canStart} onClick={onStart}>
          <Play size={18} aria-hidden />
          {t('irregular.setup.start')}
        </Button>
      </div>
    </div>
  );
}
