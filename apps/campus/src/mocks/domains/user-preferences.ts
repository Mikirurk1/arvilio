/**
 * Per-user notification & appearance preferences (mock persistence on `MockUser`).
 */

export type ProfileThemeMode = 'light' | 'dark' | 'auto';

export type ProfileFontSizeMode = 'small' | 'medium' | 'large';

/** Matches toggles on Profile → Notifications. */
export type ProfileNotificationPrefs = {
  lessonReminder: boolean;
  streakAlert: boolean;
  weeklyReport: boolean;
  newVocab: boolean;
  teacherMessages: boolean;
};

export type ProfileAppearancePrefs = {
  theme: ProfileThemeMode;
  fontSize: ProfileFontSizeMode;
};

export const DEFAULT_NOTIFICATION_PREFS: ProfileNotificationPrefs = {
  lessonReminder: true,
  streakAlert: true,
  weeklyReport: true,
  newVocab: false,
  teacherMessages: true,
};

export const DEFAULT_APPEARANCE_PREFS: ProfileAppearancePrefs = {
  theme: 'auto',
  fontSize: 'medium',
};

export function mergeNotificationPrefs(
  partial?: Partial<ProfileNotificationPrefs>,
): ProfileNotificationPrefs {
  return { ...DEFAULT_NOTIFICATION_PREFS, ...partial };
}

export function mergeAppearancePrefs(partial?: Partial<ProfileAppearancePrefs>): ProfileAppearancePrefs {
  return { ...DEFAULT_APPEARANCE_PREFS, ...partial };
}
