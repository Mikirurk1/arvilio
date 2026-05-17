import { USER_ROLE, USER_ROLE_ID_LIST } from '@soenglish/shared-types';
import {
  mockUsers as mockUsersEntity,
  type MockUser as MockUserRecord,
  type UserRole,
} from './domains/entities';

export type { UserRole } from './domains/entities';
export type MockUser = MockUserRecord;
export type SessionRecord = {
  id: string;
  userId: number;
  role: UserRole;
};

const rolePreference: UserRole[] = [...USER_ROLE_ID_LIST];

const resolveUserByRole = (role: UserRole): MockUser | undefined =>
  mockUsersEntity.find(user => user.role === role);

/**
 * Default mock role used by legacy code paths that have not yet been
 * migrated to `useActiveUser()` from `lib/active-user.ts`. Real role
 * selection now comes from the authenticated session, not from
 * `NEXT_PUBLIC_MOCK_ROLE` (removed).
 */
export const activeRole: UserRole = USER_ROLE.student.id;

const sessionRows: SessionRecord[] = rolePreference
  .map(role => {
    const user = resolveUserByRole(role);
    if (!user) return null;
    return {
      id: `session-${role}`,
      userId: user.id,
      role,
    };
  })
  .filter((session): session is SessionRecord => Boolean(session));

export const mockUsersByRole: Record<UserRole, MockUser> =
  rolePreference.reduce(
    (acc, role) => {
      const user = resolveUserByRole(role);
      if (user) acc[role] = user;
      return acc;
    },
    {} as Record<UserRole, MockUser>,
  );

const fallbackUser = mockUsersEntity[0];
const resolvedActiveUser = mockUsersByRole[activeRole] ?? fallbackUser;

export const activeSession: SessionRecord = sessionRows.find(
  session => session.userId === resolvedActiveUser.id,
) ?? {
  id: 'session-fallback',
  userId: resolvedActiveUser.id,
  role: resolvedActiveUser.role,
};

export const activeUser = resolvedActiveUser;
export const activeMockUser = activeUser;
/** All mock users (single-tenant demo). */
export const mockUsers = mockUsersEntity;
