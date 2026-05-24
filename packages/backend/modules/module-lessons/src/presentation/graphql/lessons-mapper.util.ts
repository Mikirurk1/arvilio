import type { UpdateScheduledLessonRequestDto } from '@pkg/types';
import type {
  LessonHomeworkInput,
  LessonMaterialInput,
  StudentResponseInput,
} from '@be/graphql';

export function mapLessonMaterialsInput(
  materials: LessonMaterialInput[] | undefined,
): UpdateScheduledLessonRequestDto['materials'] {
  if (!materials) return undefined;
  return materials.map((material) => ({
    kind: material.kind as 'text' | 'photo' | 'test' | 'file' | 'presentation',
    text: material.text ?? '',
    files: material.files ?? [],
  }));
}

export function mapLessonHomeworkInput(
  homework: LessonHomeworkInput | undefined,
): UpdateScheduledLessonRequestDto['homework'] {
  if (!homework) return undefined;
  return {
    text: homework.text,
    files: homework.files,
  };
}

export function mapStudentResponseInput(
  studentResponse: StudentResponseInput | undefined,
): UpdateScheduledLessonRequestDto['studentResponse'] {
  if (!studentResponse) return undefined;
  return {
    text: studentResponse.text,
    files: studentResponse.files,
    status: studentResponse.status as
      | 'not_submitted'
      | 'submitted'
      | 'needs_rework'
      | 'accepted'
      | undefined,
    homeworkChecked: studentResponse.homeworkChecked,
    teacherHomeworkFeedback: studentResponse.teacherHomeworkFeedback,
  };
}
