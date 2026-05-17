import type { ComponentType } from 'react';
import type { LessonFormState } from './types';
import type { UserRole } from '../../mocks';
import type { LessonPartyOption } from '../../hooks/use-lesson-party-options';

export type MaterialKind = 'text' | 'photo' | 'test' | 'file' | 'presentation';

export type FileMeta = { name: string; previewUrl: string | null };

export type MaterialKindOption = {
  value: MaterialKind;
  label: string;
  icon: ComponentType<{ size?: number }>;
};

export type LessonModalText = typeof import('../../mocks').siteContent.calendar.lessonModal;

export type SetupTabProps = {
  text: LessonModalText;
  canEdit: boolean;
  role: UserRole;
  form: LessonFormState;
  students: LessonPartyOption[];
  teachers: LessonPartyOption[];
  weekDayOptions: Array<{ value: number; label: string }>;
  onChange: (next: LessonFormState) => void;
};
