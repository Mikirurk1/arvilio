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

function parseMockRoleFromEnv(): UserRole {
  const raw = process.env.NEXT_PUBLIC_MOCK_ROLE;
  if (raw === undefined || raw === '') return USER_ROLE.student.id;
  const n = Number(raw);
  if (
    Number.isFinite(n) &&
    (USER_ROLE_ID_LIST as readonly number[]).includes(n)
  ) {
    return n as UserRole;
  }
  const legacy: Record<string, UserRole> = {
    student: USER_ROLE.student.id,
    teacher: USER_ROLE.teacher.id,
    admin: USER_ROLE.admin.id,
    'super-admin': USER_ROLE.superAdmin.id,
  };
  return legacy[raw] ?? USER_ROLE.teacher.id;
}

const rolePreference: UserRole[] = [...USER_ROLE_ID_LIST];

const resolveUserByRole = (role: UserRole): MockUser | undefined =>
  mockUsersEntity.find(user => user.role === role);

export const activeRole: UserRole = parseMockRoleFromEnv();

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
