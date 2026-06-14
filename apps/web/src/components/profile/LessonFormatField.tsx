'use client';

import type { LucideIcon } from 'lucide-react';
import { Layers, User, Users } from 'lucide-react';
import type { StudentLessonFormat } from '@pkg/types';
import { SegmentedControl } from '../ui';
import {
  LESSON_FORMAT_META,
  normalizeLessonFormat,
} from '../../lib/student-lesson-format';
import styles from './ProfileForm.module.scss';

const LESSON_FORMAT_ICONS: Record<StudentLessonFormat, LucideIcon> = {
  individual_only: User,
  group_only: Users,
  mixed: Layers,
};

const LESSON_FORMAT_VALUES = ['individual_only', 'group_only', 'mixed'] as const;

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
  const normalized = normalizeLessonFormat(value);
  const meta = LESSON_FORMAT_META[normalized];

  if (readOnly) {
    return (
      <div className={styles.lessonFormatReadonly} aria-label={`Lesson format: ${meta.label}`}>
        <span className={styles.lessonFormatReadonlyIcon}>
          <FormatIcon format={normalized} />
        </span>
        <span className={styles.lessonFormatReadonlyLabel}>{meta.label}</span>
      </div>
    );
  }

  return (
    <SegmentedControl
      value={normalized}
      onValueChange={(next) => onChange?.(next)}
      ariaLabel="Lesson format"
      className={styles.lessonFormatPicker}
      optionClassName={styles.lessonFormatOption}
      activeOptionClassName={styles.lessonFormatOptionActive}
      options={LESSON_FORMAT_VALUES.map((format) => ({
        value: format,
        icon: <FormatIcon format={format} />,
        label: (
          <span className={styles.lessonFormatOptionLabel}>{LESSON_FORMAT_META[format].shortLabel}</span>
        ),
      }))}
    />
  );
}
