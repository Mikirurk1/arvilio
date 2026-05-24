import type {
  LessonCancelReason,
  LessonFileLinkDto,
  LessonRecurrence,
  LessonStatusId,
  StudentResponseStatus,
  TimeZoneId,
} from '@pkg/types';

export type LessonModalMode = 'create' | 'edit';

export type LessonMaterialItem = {
  id: string;
  kind: 'text' | 'photo' | 'test' | 'file' | 'presentation';
  text: string;
  files: string[];
  fileLinks?: LessonFileLinkDto[];
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
};
