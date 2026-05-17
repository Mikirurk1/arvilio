'use client';

import { useMemo } from 'react';
import type { AuthUserDto } from '@soenglish/shared-types';
import { USER_ROLE, type UserRoleId } from '@soenglish/shared-types';
import { mockUsers, mockUsersByRole, type MockUser } from '../mocks/session';
import { useOptionalAuth } from './auth-context';

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

/**
 * Compatibility shim: returns a MockUser-shaped object whose identity
 * fields come *only* from the authenticated session (no mock fallback for
 * fullName/email/avatar). Domain extras (timezoneId, vocabulary, stats,
 * notificationPrefs, …) still come from the mock seed for the same role
 * until the corresponding pages migrate to backend APIs.
 *
 * Why no mock fallback for identity: when /auth/me is loading or returns
 * 401 the shim used to silently expose the student-seed ("Mykola
 * Kovalenko"), making the UI look like a logged-in student even for a
 * super-admin or anonymous visitor.
 */
export function useActiveUser(): MockUser {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;

  return useMemo(() => {
    const roleId = mapAuthRoleToRoleId(user?.role);
    const seed = mockUsersByRole[roleId] ?? mockUsers[0];
    return {
      ...seed,
      role: roleId,
      fullName: user?.displayName ?? '',
      email: user?.email ?? '',
      avatar: user?.avatarUrl ? { url: user.avatarUrl } : {},
    };
  }, [user]);
}

/**
 * Direct accessor when the consumer only cares about the auth-derived role
 * key (e.g. `'super_admin'`), without needing the MockUser overlay.
 */
export function useActiveRoleKey(): AuthRole {
  const auth = useOptionalAuth();
  return auth?.user?.role ?? 'student';
}
