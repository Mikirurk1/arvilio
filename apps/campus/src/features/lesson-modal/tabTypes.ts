import type { ComponentType } from 'react';
import type { LessonFormState } from './types';
import type { UserRoleId } from '@pkg/types';
import type { LessonPartyOption } from '../../hooks/use-lesson-party-options';
import type { buildLessonModalCopy } from '../../lib/cms/lesson-modal-copy';

export type { MaterialKind, MaterialKindOption } from './lesson-material-kinds';
export {
  LESSON_MATERIAL_KIND_OPTIONS,
  lessonMaterialKindOption,
} from './lesson-material-kinds';

export type FileMeta = { name: string; previewUrl: string | null; file?: File };

export type LessonModalText = ReturnType<typeof buildLessonModalCopy>;

export type LessonFieldErrors = Partial<Record<'title' | 'date' | 'startTime' | 'studentId' | 'teacherId', string>>;

export type SetupTabProps = {
  text: LessonModalText;
  canEdit: boolean;
  role: UserRoleId;
  form: LessonFormState;
  students: LessonPartyOption[];
  teachers: LessonPartyOption[];
  weekDayOptions: Array<{ value: number; label: string }>;
  recurrenceAllowed?: boolean;
  fieldErrors?: LessonFieldErrors;
  onChange: (next: LessonFormState) => void;
};
