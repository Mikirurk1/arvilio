'use client';

import type { LucideIcon } from 'lucide-react';
import { Layers, User, Users } from 'lucide-react';
import type { StudentLessonFormat } from '@pkg/types';
import { SegmentedControl } from '../ui';
import { useCampusT } from '../../lib/cms';
import {
  normalizeLessonFormat,
} from '../../lib/student-lesson-format';
import styles from './ProfileForm.module.scss';

const LESSON_FORMAT_ICONS: Record<StudentLessonFormat, LucideIcon> = {
  individual_only: User,
  group_only: Users,
  mixed: Layers,
};

const LESSON_FORMAT_VALUES = ['individual_only', 'group_only', 'mixed'] as const;

const FORMAT_LABEL_KEYS: Record<StudentLessonFormat, 'profile.school.formatIndividual' | 'profile.school.formatGroup' | 'profile.school.formatBoth'> = {
  individual_only: 'profile.school.formatIndividual',
  group_only: 'profile.school.formatGroup',
  mixed: 'profile.school.formatBoth',
};

const FORMAT_READABLE_KEYS: Record<StudentLessonFormat, 'students.detail.lessonFormat.individualOnly' | 'students.detail.lessonFormat.groupOnly' | 'students.detail.lessonFormat.mixed'> = {
  individual_only: 'students.detail.lessonFormat.individualOnly',
  group_only: 'students.detail.lessonFormat.groupOnly',
  mixed: 'students.detail.lessonFormat.mixed',
};

type LessonFormatFieldProps = {
  value: StudentLessonFormat | undefined | null;
  onChange?: (next: StudentLessonFormat) => void;
  readOnly?: boolean;
};

function FormatIcon({ format }: { format: StudentLessonFormat }) {
  const Icon = LESSON_FORMAT_ICONS[format];
  return <Icon size={16} aria-hidden />;
}

export function LessonFormatField({ value, onChange, readOnly = false }: LessonFormatFieldProps) {
  const t = useCampusT();
  const normalized = normalizeLessonFormat(value);
  const readableLabel = t(FORMAT_READABLE_KEYS[normalized]);

  if (readOnly) {
    return (
      <div className={styles.lessonFormatReadonly} aria-label={`${t('profile.school.lessonFormatAria')}: ${readableLabel}`}>
        <span className={styles.lessonFormatReadonlyIcon}>
          <FormatIcon format={normalized} />
        </span>
        <span className={styles.lessonFormatReadonlyLabel}>{readableLabel}</span>
      </div>
    );
  }

  return (
    <SegmentedControl
      value={normalized}
      onValueChange={(next) => onChange?.(next)}
      ariaLabel={t('profile.school.lessonFormatAria')}
      className={styles.lessonFormatPicker}
      optionClassName={styles.lessonFormatOption}
      activeOptionClassName={styles.lessonFormatOptionActive}
      options={LESSON_FORMAT_VALUES.map((format) => ({
        value: format,
        icon: <FormatIcon format={format} />,
        label: (
          <span className={styles.lessonFormatOptionLabel}>{t(FORMAT_LABEL_KEYS[format])}</span>
        ),
      }))}
    />
  );
}
