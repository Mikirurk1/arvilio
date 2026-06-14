import type {
  GroupFixedSplitMode,
  GroupLessonBillingMode,
  LessonCancelReason,
  LessonFileLinkDto,
  LessonRecurrence,
  LessonStatusId,
  ScheduledLessonKind,
  StudentResponseStatus,
  TimeZoneId,
} from '@pkg/types';

export type LessonModalMode = 'create' | 'edit';

export type LessonMaterialItem = {
  id: string;
  kind: 'text' | 'photo' | 'test' | 'file' | 'presentation' | 'book' | 'board';
  text: string;
  files: string[];
  fileLinks?: LessonFileLinkDto[];
  libraryMaterialId?: string | null;
  sharedLibraryAssetIds?: string[];
  libraryMediaSelectionApplied?: boolean;
  libraryMaterial?: import('@pkg/types').LibraryMaterialDto | null;
};

export type LessonFormState = {
  title: string;
  date: string;
  startTime: string;
  /** Wall-clock `date` / `startTime` are in this zone. */
  timezoneId: TimeZoneId;
  duration: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  notes: string;
  lessonPlan: string;
  materials: LessonMaterialItem[];
  homeworkText: string;
  homeworkFiles: string[];
  homeworkFileLinks?: LessonFileLinkDto[];
  studentResponseText: string;
  studentResponseFiles: string[];
  studentResponseFileLinks?: LessonFileLinkDto[];
  studentResponseStatus: StudentResponseStatus;
  homeworkChecked: boolean;
  teacherHomeworkFeedback: string;
  statusId: LessonStatusId;
  cancelReason?: LessonCancelReason;
  credited: boolean;
  recurrence: LessonRecurrence;
  weeklyDays: number[];
  /** Global Word ids (backend cuid) linked to this lesson. */
  linkedWordIds: string[];
  kind: ScheduledLessonKind;
  /** Numeric party ids for group participants (first = primary student). */
  participantIds: number[];
  groupBillingMode: GroupLessonBillingMode;
  groupPriceMinor: number;
  groupCurrency: string;
  groupSplitMode: GroupFixedSplitMode;
  groupPayerUserId: number | null;
  /** Admin-defined group template (group lessons). */
  studentGroupId: string | null;
};
