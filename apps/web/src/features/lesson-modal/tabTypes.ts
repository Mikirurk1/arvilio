import type { ComponentType } from 'react';
import type { LessonFormState } from './types';
import type { UserRole } from '../../mocks';
import type { LessonPartyOption } from '../../hooks/use-lesson-party-options';

export type { MaterialKind, MaterialKindOption } from './lesson-material-kinds';
export {
  LESSON_MATERIAL_KIND_OPTIONS,
  lessonMaterialKindOption,
} from './lesson-material-kinds';

export type FileMeta = { name: string; previewUrl: string | null; file?: File };

export type LessonModalText = typeof import('../../mocks').siteContent.calendar.lessonModal;

export type SetupTabProps = {
  text: LessonModalText;
  canEdit: boolean;
  role: UserRole;
  form: LessonFormState;
  students: LessonPartyOption[];
  teachers: LessonPartyOption[];
  weekDayOptions: Array<{ value: number; label: string }>;
  recurrenceAllowed?: boolean;
  onChange: (next: LessonFormState) => void;
};
