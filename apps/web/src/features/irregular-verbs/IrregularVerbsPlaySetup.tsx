'use client';

import type { IrregularVerbTier } from '@pkg/types';
import { Play } from 'lucide-react';
import { Button, SegmentedControl } from '../../components/ui';
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
  const countOptions = availableQuestionCounts(tier);

  return (
    <div className={styles.playSetup}>
      <div className={styles.playSetupHero}>
        <div className={styles.playSetupIcon} aria-hidden>
          <Play size={28} />
        </div>
        <h2 className={styles.playSetupTitle}>Three Forms Drill</h2>
        <p className={styles.playSetupDescription}>
          See the base form and pick the correct past simple or past participle. After each answer
          you will see the full verb row from the table.
        </p>
        <p className={styles.playSetupMeta}>
          {poolCount} {poolCount === 1 ? 'verb' : 'verbs'} in this set
        </p>
      </div>

      <div className={styles.playSetupFields}>
        <div className={styles.playSetupField}>
          <span className={styles.playSetupLabel}>Form focus</span>
          <SegmentedControl
            value={formFocus}
            onValueChange={onFormFocusChange}
            ariaLabel="Form focus"
            className={styles.playSetupSegment}
            options={[
              { value: 'mixed', label: 'Mixed' },
              { value: 'pastSimple', label: 'Past simple' },
              { value: 'pastParticiple', label: 'Past participle' },
            ]}
          />
        </div>

        <div className={styles.playSetupField}>
          <span className={styles.playSetupLabel}>Questions</span>
          <SegmentedControl
            value={String(questionCount)}
            onValueChange={(value) =>
              onQuestionCountChange(
                value === 'all' ? 'all' : (Number(value) as IrregularVerbQuestionCount),
              )
            }
            ariaLabel="Question count"
            className={styles.playSetupSegment}
            options={countOptions.map((count) => ({
              value: String(count),
              label: count === 'all' ? 'All' : String(count),
            }))}
          />
        </div>
      </div>

      <div className={styles.playSetupActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Back to table
        </Button>
        <Button type="button" disabled={!canStart} onClick={onStart}>
          <Play size={18} aria-hidden />
          Start drill
        </Button>
      </div>
    </div>
  );
}
