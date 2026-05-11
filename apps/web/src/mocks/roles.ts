import { USER_ROLE } from '@soenglish/shared-types';
import type { UserRole } from './session';

/** Quick numeric id access for permission matrix. */
const U = {
  student: USER_ROLE.student.id,
  teacher: USER_ROLE.teacher.id,
  admin: USER_ROLE.admin.id,
  superAdmin: USER_ROLE.superAdmin.id,
} as const;

type RoleRule = {
  view: UserRole[];
  edit: UserRole[];
  manage: UserRole[];
  schedule: UserRole[];
};

export const roleMatrix: Record<
  | 'dashboard'
  | 'profile'
  | 'vocabulary'
  | 'quiz'
  | 'calendar'
  | 'practice'
  | 'lessons',
  RoleRule
> = {
  dashboard: {
    view: [U.student, U.teacher, U.admin, U.superAdmin],
    edit: [U.teacher, U.admin, U.superAdmin],
    manage: [U.admin, U.superAdmin],
    schedule: [U.teacher, U.admin, U.superAdmin],
  },
  profile: {
    view: [U.student, U.teacher, U.admin, U.superAdmin],
    edit: [U.student, U.teacher, U.admin, U.superAdmin],
    manage: [U.admin, U.superAdmin],
    schedule: [U.teacher, U.admin, U.superAdmin],
  },
  vocabulary: {
    view: [U.student, U.teacher, U.admin, U.superAdmin],
    edit: [U.teacher, U.admin, U.superAdmin],
    manage: [U.admin, U.superAdmin],
    schedule: [U.teacher, U.admin, U.superAdmin],
  },
  quiz: {
    view: [U.student, U.teacher, U.admin, U.superAdmin],
    edit: [U.teacher, U.admin, U.superAdmin],
    manage: [U.admin, U.superAdmin],
    schedule: [U.teacher, U.admin, U.superAdmin],
  },
  calendar: {
    view: [U.student, U.teacher, U.admin, U.superAdmin],
    edit: [U.teacher, U.admin, U.superAdmin],
    manage: [U.admin, U.superAdmin],
    schedule: [U.teacher, U.admin, U.superAdmin],
  },
  practice: {
    view: [U.student, U.teacher, U.admin, U.superAdmin],
    edit: [U.teacher, U.admin, U.superAdmin],
    manage: [U.admin, U.superAdmin],
    schedule: [U.teacher, U.admin, U.superAdmin],
  },
  lessons: {
    view: [U.student, U.teacher, U.admin, U.superAdmin],
    edit: [U.teacher, U.admin, U.superAdmin],
    manage: [U.admin, U.superAdmin],
    schedule: [U.teacher, U.admin, U.superAdmin],
  },
};

const includes = (allowed: UserRole[], role: UserRole) => allowed.includes(role);

export const canView = (scope: keyof typeof roleMatrix, role: UserRole) =>
  includes(roleMatrix[scope].view, role);
export const canEdit = (scope: keyof typeof roleMatrix, role: UserRole) =>
  includes(roleMatrix[scope].edit, role);
export const canManage = (scope: keyof typeof roleMatrix, role: UserRole) =>
  includes(roleMatrix[scope].manage, role);
export const canSchedule = (scope: keyof typeof roleMatrix, role: UserRole) =>
  includes(roleMatrix[scope].schedule, role);

/** Review homework (student response) — teacher, admin, super-admin only. */
export const canReviewHomework = (role: UserRole) =>
  role === U.teacher || role === U.admin || role === U.superAdmin;

/** Teachers, admins, and platform owners (e.g. Students section, scheduling staff). */
export const isTeacherAdminOrSuper = (role: UserRole) =>
  role === U.teacher || role === U.admin || role === U.superAdmin;

export const isAdminOrSuper = (role: UserRole) => role === U.admin || role === U.superAdmin;
