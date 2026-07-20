import type { StudentLessonFormat } from '@pkg/types';
import type { TranslateFn } from './cms/nav-i18n';

export const LESSON_FORMAT_META = {
  individual_only: {
    label: 'Individual only',
    shortLabel: 'Individual',
    description: 'Individual lessons only',
  },
  group_only: {
    label: 'Group only',
    shortLabel: 'Group',
    description: 'Group lessons only',
  },
  mixed: {
    label: 'Individual & group',
    shortLabel: 'Both',
    description: 'Individual and group lessons',
  },
} as const satisfies Record<
  StudentLessonFormat,
  { label: string; shortLabel: string; description: string }
>;

export function normalizeLessonFormat(
  format: StudentLessonFormat | undefined | null,
): StudentLessonFormat {
  if (format === 'individual_only' || format === 'group_only' || format === 'mixed') {
    return format;
  }
  return 'mixed';
}

const LESSON_FORMAT_I18N_KEYS = {
  individual_only: 'students.detail.lessonFormat.individualOnly',
  group_only: 'students.detail.lessonFormat.groupOnly',
  mixed: 'students.detail.lessonFormat.mixed',
} as const satisfies Record<StudentLessonFormat, string>;

export function getLessonFormatLabel(
  format: StudentLessonFormat | undefined | null,
  t?: TranslateFn,
): string {
  const normalized = normalizeLessonFormat(format);
  if (t) {
    const key = LESSON_FORMAT_I18N_KEYS[normalized];
    const label = t(key);
    if (label !== key) return label;
  }
  return LESSON_FORMAT_META[normalized].label;
}

export function showsIndividualTrack(format: StudentLessonFormat | undefined | null): boolean {
  return !format || format === 'individual_only' || format === 'mixed';
}

export function showsGroupTrack(format: StudentLessonFormat | undefined | null): boolean {
  return !format || format === 'group_only' || format === 'mixed';
}
