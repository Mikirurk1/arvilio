import type { UpdateScheduledLessonRequestDto } from '@pkg/types';
import type {
  GroupLessonBillingInput,
  LessonHomeworkInput,
  LessonMaterialInput,
  StudentResponseInput,
} from '@be/graphql';

export function mapLessonMaterialsInput(
  materials: LessonMaterialInput[] | undefined,
): UpdateScheduledLessonRequestDto['materials'] {
  if (!materials) return undefined;
  return materials.map((material) => ({
    kind: material.kind as
      | 'text'
      | 'photo'
      | 'test'
      | 'file'
      | 'presentation'
      | 'book'
      | 'board',
    text: material.text ?? '',
    files: material.files ?? [],
    libraryMaterialId: material.libraryMaterialId ?? null,
    sharedLibraryAssetIds: material.sharedLibraryAssetIds ?? [],
    libraryMediaSelectionApplied: material.libraryMediaSelectionApplied ?? false,
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

export function mapGroupBillingInput(
  groupBilling: GroupLessonBillingInput | undefined,
): UpdateScheduledLessonRequestDto['groupBilling'] {
  if (!groupBilling) return undefined;
  return {
    mode: groupBilling.mode as 'per_member' | 'fixed_total',
    priceMinor: groupBilling.priceMinor,
    currency: groupBilling.currency,
    splitMode: groupBilling.splitMode as 'single_payer' | 'equal_split' | undefined,
    payerUserId: groupBilling.payerUserId,
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
