import {
  DEFAULT_NOTIFICATION_PREFS,
  EMPTY_ACHIEVEMENT_STATS,
  TIME_ZONE,
  USER_ACCOUNT_STATUS,
  USER_ROLE,
  type UserRoleId,
} from '@pkg/types';
import type { MockUser } from './user-models';

const DEFAULT_APPEARANCE = { theme: 'auto' as const, fontSize: 'medium' as const };

/** Neutral MockUser shell — no demo seed names/emails. Identity overlays come from session. */
export function emptyActiveUserShell(role: UserRoleId): MockUser {
  return {
    id: 0,
    role,
    fullName: '',
    email: '',
    avatar: {},
    proficiencyLevelId: 3,
    telegram: '',
    phone: '',
    timezoneId: TIME_ZONE.kyiv.id,
    nativeLanguage: '',
    bio: '',
    statusId: USER_ACCOUNT_STATUS.active.id,
    scheduleType: true,
    teacherId: 0,
    vocabulary: [],
    stats: { ...EMPTY_ACHIEVEMENT_STATS },
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
    appearancePrefs: { ...DEFAULT_APPEARANCE },
    linkedAccounts: [],
  };
}

export function roleShell(role: UserRoleId): MockUser {
  return emptyActiveUserShell(role === USER_ROLE.superAdmin.id ? USER_ROLE.superAdmin.id : role);
}
