import type { AuthUserDto } from '@pkg/types';
import { USER_ROLE, type UserRoleId } from '@pkg/types';

export type AuthRole = AuthUserDto['role'];

const ROLE_KEY_TO_ID: Record<AuthRole, UserRoleId> = {
  student: USER_ROLE.student.id,
  teacher: USER_ROLE.teacher.id,
  admin: USER_ROLE.admin.id,
  super_admin: USER_ROLE.superAdmin.id,
};

const ROLE_ID_TO_KEY: Record<UserRoleId, AuthRole> = {
  [USER_ROLE.student.id]: 'student',
  [USER_ROLE.teacher.id]: 'teacher',
  [USER_ROLE.admin.id]: 'admin',
  [USER_ROLE.superAdmin.id]: 'super_admin',
};

export function mapAuthRoleToRoleId(role: AuthRole | undefined | null): UserRoleId {
  if (!role) return USER_ROLE.student.id;
  return ROLE_KEY_TO_ID[role] ?? USER_ROLE.student.id;
}

export function mapRoleIdToAuthRole(roleId: UserRoleId): AuthRole {
  return ROLE_ID_TO_KEY[roleId] ?? 'student';
}

export function isTeacherAdminOrSuperKey(role: AuthRole): boolean {
  return role === 'teacher' || role === 'admin' || role === 'super_admin';
}

export function isAdminOrSuperKey(role: AuthRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdminKey(role: AuthRole): boolean {
  return role === 'super_admin';
}
