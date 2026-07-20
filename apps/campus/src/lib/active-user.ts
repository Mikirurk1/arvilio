'use client';

import { useMemo } from 'react';
import type { MockUser } from './user-models';
import { emptyActiveUserShell } from './active-user-defaults';
import { ianaToTimeZoneId } from './lessonTime';
import { useOptionalAuth } from './auth-context';
import { partyNumericId } from '../features/lesson-modal/scheduledLessonsBackendAdapter';
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
 * Compatibility shim: MockUser-shaped object whose identity fields come
 * only from the authenticated session. Domain extras use empty defaults
 * (not demo seed users); prefer profile/API stores for real prefs & stats.
 */
export function useActiveUser(): MockUser {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;

  return useMemo(() => {
    const roleId = mapAuthRoleToRoleId(user?.role);
    const shell = emptyActiveUserShell(roleId);
    return {
      ...shell,
      role: roleId,
      fullName: user?.displayName ?? '',
      email: user?.email ?? '',
      avatar: user?.avatarUrl ? { url: user.avatarUrl } : {},
      timezoneId: user?.timezone ? ianaToTimeZoneId(user.timezone) : shell.timezoneId,
      teacherId: user?.teacherId ? partyNumericId(user.teacherId) : 0,
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
