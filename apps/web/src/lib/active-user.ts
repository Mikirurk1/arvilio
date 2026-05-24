'use client';

import { useMemo } from 'react';
import { mockUsers, mockUsersByRole, type MockUser } from '../mocks/session';
import { ianaToTimeZoneId } from './lessonTime';
import { useOptionalAuth } from './auth-context';
import {
  mapAuthRoleToRoleId,
  type AuthRole,
} from './active-user-role.util';

export type { AuthRole } from './active-user-role.util';
export {
  isAdminOrSuperKey,
  isSuperAdminKey,
  isTeacherAdminOrSuperKey,
  mapAuthRoleToRoleId,
  mapRoleIdToAuthRole,
} from './active-user-role.util';

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
      timezoneId: user?.timezone ? ianaToTimeZoneId(user.timezone) : seed.timezoneId,
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
