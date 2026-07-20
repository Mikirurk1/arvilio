import { mockUsers } from './entities';
import type { ProfileAppearancePrefs, ProfileNotificationPrefs } from './user-preferences';
import {
  DEFAULT_APPEARANCE_PREFS,
  DEFAULT_NOTIFICATION_PREFS,
  mergeAppearancePrefs,
  mergeNotificationPrefs,
} from './user-preferences';

export function getNotificationPrefsForUser(userId: number): ProfileNotificationPrefs {
  const user = mockUsers.find((u) => u.id === userId);
  return user?.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS;
}

export function setNotificationPrefsForUser(userId: number, next: ProfileNotificationPrefs): void {
  const user = mockUsers.find((u) => u.id === userId);
  if (user) user.notificationPrefs = { ...next };
}

export function getAppearancePrefsForUser(userId: number): ProfileAppearancePrefs {
  const user = mockUsers.find((u) => u.id === userId);
  return user?.appearancePrefs ?? DEFAULT_APPEARANCE_PREFS;
}

export function setAppearancePrefsForUser(userId: number, next: ProfileAppearancePrefs): void {
  const user = mockUsers.find((u) => u.id === userId);
  if (user) user.appearancePrefs = { ...next };
}

export function patchAppearancePrefsForUser(
  userId: number,
  patch: Partial<ProfileAppearancePrefs>,
): ProfileAppearancePrefs {
  const merged = mergeAppearancePrefs({
    ...getAppearancePrefsForUser(userId),
    ...patch,
  });
  setAppearancePrefsForUser(userId, merged);
  return merged;
}

export function patchNotificationPrefsForUser(
  userId: number,
  patch: Partial<ProfileNotificationPrefs>,
): ProfileNotificationPrefs {
  const merged = mergeNotificationPrefs({
    ...getNotificationPrefsForUser(userId),
    ...patch,
  });
  setNotificationPrefsForUser(userId, merged);
  return merged;
}
