import type {
  ProfileNotificationPrefs,
  ProfileVocabularyEntry,
  ProficiencyLevelId,
  StudentLessonFormat,
  TimeZoneId,
  UserAccountStatusId,
  UserRoleId,
} from '@pkg/types';
import type { FontSizeMode, ThemeMode } from './appearance/initial-appearance';
import type { ProfileStats } from './achievements';
import type { LinkedAccountLink } from './linked-accounts';

export type UserRole = UserRoleId;

export type UserAvatar = {
  url?: string;
  objectKey?: string;
};

export type ProfileAppearancePrefs = {
  theme: ThemeMode;
  fontSize: FontSizeMode;
};

export type MockUser = {
  id: number;
  role: UserRole;
  fullName: string;
  email: string;
  avatar: UserAvatar;
  proficiencyLevelId: ProficiencyLevelId;
  telegram: string;
  phone: string;
  timezoneId: TimeZoneId;
  nativeLanguage: string;
  bio: string;
  statusId?: UserAccountStatusId;
  scheduleType?: boolean;
  lessonFormat?: StudentLessonFormat;
  teacherId: number;
  color?: string;
  vocabulary: ProfileVocabularyEntry[];
  stats?: ProfileStats;
  notificationPrefs: ProfileNotificationPrefs;
  appearancePrefs: ProfileAppearancePrefs;
  linkedAccounts: LinkedAccountLink[];
};

export type ProfileViewModel = {
  id: number;
  userId: number;
  fullName: string;
  proficiencyLevelId: ProficiencyLevelId;
  email: string;
  phone: string;
  timezoneId: TimeZoneId;
  color?: string;
  statusId: UserAccountStatusId;
  scheduleType: boolean;
  lessonFormat?: StudentLessonFormat;
  teacherId: number;
  teacherName: string;
  wordsLearned: number;
  lessonsCompleted: number;
  streakDays: number;
};

export type MockStudent = ProfileViewModel;
