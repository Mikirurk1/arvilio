import type { StudentLessonFormat } from '@pkg/types';

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

export function getLessonFormatLabel(format: StudentLessonFormat | undefined | null): string {
  return LESSON_FORMAT_META[normalizeLessonFormat(format)].label;
}

export function showsIndividualTrack(format: StudentLessonFormat | undefined | null): boolean {
  return !format || format === 'individual_only' || format === 'mixed';
}

export function showsGroupTrack(format: StudentLessonFormat | undefined | null): boolean {
  return !format || format === 'group_only' || format === 'mixed';
}
