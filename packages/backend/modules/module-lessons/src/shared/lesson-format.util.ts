import type { StudentLessonFormat } from '@pkg/types';

export function lessonFormatFromDto(value: StudentLessonFormat): 'INDIVIDUAL_ONLY' | 'GROUP_ONLY' | 'MIXED' {
  if (value === 'individual_only') return 'INDIVIDUAL_ONLY';
  if (value === 'group_only') return 'GROUP_ONLY';
  return 'MIXED';
}

export function lessonFormatToDto(
  value: 'INDIVIDUAL_ONLY' | 'GROUP_ONLY' | 'MIXED',
): StudentLessonFormat {
  if (value === 'INDIVIDUAL_ONLY') return 'individual_only';
  if (value === 'GROUP_ONLY') return 'group_only';
  return 'mixed';
}

export function canJoinGroupLesson(lessonFormat: 'INDIVIDUAL_ONLY' | 'GROUP_ONLY' | 'MIXED'): boolean {
  return lessonFormat === 'GROUP_ONLY' || lessonFormat === 'MIXED';
}

export function canTakeIndividualLesson(
  lessonFormat: 'INDIVIDUAL_ONLY' | 'GROUP_ONLY' | 'MIXED',
): boolean {
  return lessonFormat === 'INDIVIDUAL_ONLY' || lessonFormat === 'MIXED';
}
