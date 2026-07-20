import type { AuthUserDto, StudentLessonFormat, StudentSummaryBackendDto } from '@pkg/types';
import {
  USER_ACCOUNT_STATUS,
  USER_ROLE,
} from '@pkg/types';
import type { ProficiencyLevelId, UserAccountStatusId } from '@pkg/types';
import type { MockStudent, UserRole } from './user-models';

const PROFICIENCY_TO_ID: Record<string, ProficiencyLevelId> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const STATUS_TO_ID: Record<string, UserAccountStatusId> = {
  active: USER_ACCOUNT_STATUS.active.id,
  paused: USER_ACCOUNT_STATUS.paused.id,
  leaved: USER_ACCOUNT_STATUS.leaved.id,
  blocked: USER_ACCOUNT_STATUS.blocked.id,
};

/** Stable numeric id for mock-only subviews (stats, lessons seed). */
export function studentIdToNumericId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

export function mapBackendStudentToProfile(row: StudentSummaryBackendDto): MockStudent {
  const numericId = studentIdToNumericId(row.id);
  return {
    id: numericId,
    userId: numericId,
    fullName: row.displayName,
    email: row.email,
    phone: '',
    teacherName: row.teacherName ?? '—',
    proficiencyLevelId: (row.proficiencyLevel
      ? (PROFICIENCY_TO_ID[row.proficiencyLevel] ?? 1)
      : 1) as ProficiencyLevelId,
    statusId: (STATUS_TO_ID[row.status] ?? USER_ACCOUNT_STATUS.active.id) as UserAccountStatusId,
    scheduleType: row.scheduleType ?? true,
    lessonFormat: (row.lessonFormat ?? 'mixed') as StudentLessonFormat,
    teacherId: row.teacherId ? studentIdToNumericId(row.teacherId) : 0,
    wordsLearned: 0,
    lessonsCompleted: 0,
    streakDays: 0,
    timezoneId: 1,
    color: row.displayColor ?? undefined,
  };
}

export type ResolvedStudentProfile = {
  profile: MockStudent;
  backendId: string;
  avatarUrl: string | null;
  teacherBackendId: string | null;
};

export function resolveStudentProfile(
  routeId: string,
  rows: StudentSummaryBackendDto[] | undefined,
): ResolvedStudentProfile | undefined {
  if (!routeId) return undefined;

  const fromApi = rows?.find((row) => row.id === routeId);
  if (fromApi) {
    return {
      profile: mapBackendStudentToProfile(fromApi),
      backendId: fromApi.id,
      avatarUrl: fromApi.avatarUrl,
      teacherBackendId: fromApi.teacherId,
    };
  }

  return undefined;
}

export function canManageBackendStudent(
  viewerRole: UserRole,
  authUser: AuthUserDto | null,
  row: Pick<StudentSummaryBackendDto, 'teacherId'> | null,
  mockProfile: MockStudent,
): boolean {
  if (viewerRole === USER_ROLE.admin.id || viewerRole === USER_ROLE.superAdmin.id) {
    return true;
  }
  if (viewerRole === USER_ROLE.teacher.id) {
    if (row?.teacherId && authUser?.id) {
      return row.teacherId === authUser.id;
    }
    return mockProfile.teacherId > 0;
  }
  return false;
}
