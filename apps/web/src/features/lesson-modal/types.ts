import type {
  LessonCancelReason,
  LessonRecurrence,
  LessonStatusId,
  StudentResponseStatus,
  TimeZoneId,
} from '@soenglish/shared-types';

export type LessonModalMode = 'create' | 'edit';

export type LessonMaterialItem = {
  id: string;
  kind: 'text' | 'photo' | 'test' | 'file' | 'presentation';
  text: string;
  files: string[];
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
  studentResponseText: string;
  studentResponseFiles: string[];
  studentResponseStatus: StudentResponseStatus;
  homeworkChecked: boolean;
  teacherHomeworkFeedback: string;
  statusId: LessonStatusId;
  cancelReason?: LessonCancelReason;
  credited: boolean;
  recurrence: LessonRecurrence;
  weeklyDays: number[];
  applyToSeries: boolean;
  /** Global Word ids (backend cuid) linked to this lesson. */
  linkedWordIds: string[];
};
