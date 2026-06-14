export type ScheduledLessonKind = 'individual' | 'group';

/** Which lesson formats a student may attend (profile setting). */
export type StudentLessonFormat = 'individual_only' | 'group_only' | 'mixed';

export type GroupLessonBillingMode = 'per_member' | 'fixed_total';

export type GroupFixedSplitMode = 'single_payer' | 'equal_split';

export type LessonParticipantRole = 'student' | 'payer';

export type ScheduledLessonParticipantDto = {
  userId: string;
  displayName: string;
  role: LessonParticipantRole;
  sortOrder: number;
  studentResponse: {
    text: string;
    files: string[];
    status: 'not_submitted' | 'submitted' | 'needs_rework' | 'accepted';
    homeworkChecked: boolean;
    teacherHomeworkFeedback: string;
  };
};

export type GroupLessonBillingDto = {
  mode: GroupLessonBillingMode;
  priceMinor?: number | null;
  currency?: string | null;
  splitMode?: GroupFixedSplitMode | null;
  payerUserId?: string | null;
};

export type StudentGroupMemberDto = {
  userId: string;
  displayName: string;
  sortOrder: number;
};

/** Student profile / balance: groups this user belongs to. */
export type StudentGroupMembershipSummaryDto = {
  groupId: string;
  name: string;
  groupBillingMode: GroupLessonBillingMode;
  groupPriceMinor: number | null;
  groupCurrency: string | null;
  groupSplitMode: GroupFixedSplitMode | null;
  groupPayerUserId: string | null;
};

export type StudentGroupDto = {
  id: string;
  name: string;
  teacherId: string | null;
  teacherName: string | null;
  groupBillingMode: GroupLessonBillingMode;
  groupPriceMinor: number | null;
  groupCurrency: string | null;
  groupSplitMode: GroupFixedSplitMode | null;
  groupPayerUserId: string | null;
  members: StudentGroupMemberDto[];
  createdAt: string;
  updatedAt: string;
};

export type CreateStudentGroupRequestDto = {
  name: string;
  teacherId?: string | null;
  memberUserIds: string[];
  groupBillingMode: GroupLessonBillingMode;
  groupPriceMinor?: number;
  groupCurrency?: string;
  groupSplitMode?: GroupFixedSplitMode;
  groupPayerUserId?: string | null;
};

export type UpdateStudentGroupRequestDto = Partial<CreateStudentGroupRequestDto>;
