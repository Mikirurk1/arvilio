import type { StudentLessonFormat, UserRoleId, ProficiencyLevelId, TimeZoneId, UserAccountStatusId } from '@pkg/types';

export type ProfileSubjectKind = 'self' | 'student' | 'staff';

export type StaffAccountStatus = 'active' | 'paused' | 'leaved' | 'blocked';

export type ProfileFieldId =
  | 'displayName'
  | 'email'
  | 'phone'
  | 'telegram'
  | 'timezone'
  | 'nativeLanguage'
  | 'proficiency'
  | 'bio'
  | 'studentStatus'
  | 'staffStatus'
  | 'scheduleType'
  | 'lessonFormat'
  | 'assignedTeacher'
  | 'userColor';

export type FieldMode = 'hidden' | 'view' | 'edit';

export type ProfileFormContext = {
  subjectKind: ProfileSubjectKind;
  viewerRole: UserRoleId;
  /** Role of the profile subject (defaults to viewerRole for self). */
  subjectRole?: UserRoleId;
  canEdit: boolean;
  groupLessonsEnabled?: boolean;
  showNativeLanguage?: boolean;
};

export type UnifiedProfileFormValues = {
  displayName: string;
  email: string;
  phone: string;
  telegram: string;
  timezoneId: TimeZoneId;
  nativeLanguageId: string;
  proficiencyLevelId: ProficiencyLevelId;
  bio: string;
  studentStatusId?: UserAccountStatusId;
  staffStatus?: StaffAccountStatus;
  scheduleType?: boolean;
  lessonFormat?: StudentLessonFormat;
  userColor?: string;
  assignedTeacherId?: string | null;
  roleLabel?: string;
};

export type ProfileSummaryItem = {
  label: string;
  value: string;
};

export type ProfileSummaryData = {
  title: string;
  subtitle: string;
  items: ProfileSummaryItem[];
};
