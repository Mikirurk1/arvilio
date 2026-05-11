import type {
  ProficiencyLevelId,
  ProfileVocabularyEntry,
  ScheduledLessonDto,
  VocabularyWordDto,
  VocabularyWordStatusName,
  VocabularyWordStatusId,
} from '@soenglish/shared-types';
import {
  PROFILE_VOCABULARY_PROGRESS_EVENT,
  TIME_ZONE,
  USER_ROLE,
  VOCABULARY_WORD_STATUS_IDS,
  type TimeZoneId,
  type UserAccountStatusId,
} from '@soenglish/shared-types';
import { siteContent } from '../content/site-content';
import { activeUser, type MockUser, type UserRole } from '../session';
import {
  buildProfileAchievements,
  emptyProfileStats,
  type ProfileAchievement,
  type ProfileStats,
} from './achievements';
import { getDailyGoalsForUser } from './goals';
import { mockUsers } from './entities';
import { getPracticeSummaryForPresetRange, getVocabularyProgressForRange, getRangeBounds } from './statistics';
import {
  getVocabularyWordById,
  legacyStatusToVocabularyStatusId,
  mockVocabularyWords,
  vocabularyStatusIdToLegacy,
} from './vocabulary';
import { LESSON_STATUS } from '@soenglish/shared-types';
import { mockScheduledLessons } from './lessons';

function nextProfileVocabularyRowId(): number {
  let max = 0;
  for (const user of mockUsers) {
    for (const row of user.vocabulary) {
      if (row.id > max) max = row.id;
    }
  }
  return max + 1;
}

/** Stored row: profile entry + user id (mock persistence lives on `MockUser.vocabulary`). */
export type ProfileVocabularyRow = ProfileVocabularyEntry & {
  userId: number;
};

export function getProfileVocabularyForUser(userId: number): ProfileVocabularyRow[] {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return [];
  return user.vocabulary.map((row) => ({ ...row, userId }));
}

function profileVocabularyRowKey(userId: number, vocabularyId: number, lessonId: number | undefined) {
  return `${userId}|${vocabularyId}|${lessonId ?? ''}`;
}

/** Join profile rows with global vocabulary entries (drops orphan vocabulary ids). */
export type VocabularyProgressItem = {
  row: ProfileVocabularyRow;
  word: VocabularyWordDto;
  /** Resolved from `row.statusId` for UI filters and badges. */
  status: VocabularyWordStatusName;
};

export type VocabularyPlayQuestion = {
  entryId: number;
  vocabularyId: number;
  word: string;
  phonetic: string;
  correct: string;
  options: string[];
};

export function joinProfileVocabulary(userId: number): VocabularyProgressItem[] {
  const out: VocabularyProgressItem[] = [];
  for (const row of getProfileVocabularyForUser(userId)) {
    const word = getVocabularyWordById(row.vocabularyId);
    if (word)
      out.push({
        row,
        word,
        status: vocabularyStatusIdToLegacy(row.statusId),
      });
  }
  return out;
}

export function updateProfileVocabularyStatus(entryId: number, statusId: VocabularyWordStatusId): void {
  for (const user of mockUsers) {
    const row = user.vocabulary.find((e) => e.id === entryId);
    if (row) {
      const previousStatusId = row.statusId;
      row.statusId = statusId;
      const now = new Date().toISOString();
      if (statusId === VOCABULARY_WORD_STATUS_IDS.learned && user.teacherId > 0) {
        row.knownAt = now;
        row.knownByTeacherId = user.teacherId;
      }
      if (!row.events) row.events = [];
      row.events.push({
        id: Date.now(),
        entryId: row.id,
        at: now,
        typeId: PROFILE_VOCABULARY_PROGRESS_EVENT.statusChanged.id,
        actorUserId: user.teacherId > 0 ? user.teacherId : user.id,
        actorRoleId: user.teacherId > 0 ? USER_ROLE.teacher.id : USER_ROLE.student.id,
        previousStatusId,
        nextStatusId: statusId,
      });
      return;
    }
  }
}

export function addProfileVocabularyEntry(params: {
  userId: number;
  vocabularyId: number;
  lessonId?: number;
  status?: VocabularyWordStatusName;
}): number {
  const statusId = params.status
    ? legacyStatusToVocabularyStatusId(params.status)
    : VOCABULARY_WORD_STATUS_IDS.new;
  const key = profileVocabularyRowKey(params.userId, params.vocabularyId, params.lessonId);
  const user = mockUsers.find((u) => u.id === params.userId);
  if (!user) return 0;

  const existing = user.vocabulary.find(
    (r) => profileVocabularyRowKey(params.userId, r.vocabularyId, r.lessonId) === key,
  );
  if (existing) return existing.id;

  const id = nextProfileVocabularyRowId();
  const now = new Date().toISOString();
  user.vocabulary.push({
    id,
    vocabularyId: params.vocabularyId,
    lessonId: params.lessonId,
    statusId,
    addedAt: now,
    knownAt: statusId === VOCABULARY_WORD_STATUS_IDS.learned && user.teacherId > 0 ? now : undefined,
    knownByTeacherId: statusId === VOCABULARY_WORD_STATUS_IDS.learned ? user.teacherId : undefined,
    events: [
      {
        id: Date.now(),
        entryId: id,
        at: now,
        typeId: PROFILE_VOCABULARY_PROGRESS_EVENT.created.id,
        actorUserId: user.teacherId > 0 ? user.teacherId : user.id,
        actorRoleId: user.teacherId > 0 ? USER_ROLE.teacher.id : USER_ROLE.student.id,
        nextStatusId: statusId,
      },
    ],
  });
  return id;
}

/** Link lesson vocabulary to student profile (idempotent per user + word + lesson). */
export function ensureLessonVocabularyForStudent(params: {
  userId: number;
  lessonId: number;
  vocabularyId: number;
}): number {
  return addProfileVocabularyEntry({
    userId: params.userId,
    vocabularyId: params.vocabularyId,
    lessonId: params.lessonId,
    status: 'new',
  });
}

/** After lesson save: sync linked ids to the student profile (idempotent). */
export function syncLessonVocabularyToProfile(lesson: ScheduledLessonDto): void {
  const ids = lesson.linkedVocabularyIds;
  if (!ids?.length) return;
  for (const vocabularyId of ids) {
    ensureLessonVocabularyForStudent({
      userId: lesson.studentId,
      lessonId: lesson.id,
      vocabularyId,
    });
  }
}

export function countKnownWordsForUser(userId: number): number {
  return getProfileVocabularyForUser(userId).filter(
    (r) => r.statusId === VOCABULARY_WORD_STATUS_IDS.learned,
  ).length;
}

export function getVocabularyForLesson(userId: number, lessonId: number): VocabularyProgressItem[] {
  return joinProfileVocabulary(userId).filter(({ row }) => row.lessonId === lessonId);
}

export function getVocabularyForLastLesson(userId: number): {
  lessonId: number | null;
  words: VocabularyProgressItem[];
} {
  const todayIso = new Date().toISOString().slice(0, 10);
  const completedLessons = mockScheduledLessons
    .filter(
      (lesson) =>
        lesson.studentId === userId &&
        lesson.statusId === LESSON_STATUS.completed.id &&
        lesson.date <= todayIso,
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
  const withVocabulary = completedLessons.find(
    (lesson) => getVocabularyForLesson(userId, lesson.id).length > 0,
  );
  if (!withVocabulary) return { lessonId: null, words: [] };
  return { lessonId: withVocabulary.id, words: getVocabularyForLesson(userId, withVocabulary.id) };
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildVocabularyPlayRound(wordsPool: VocabularyProgressItem[]): VocabularyPlayQuestion[] {
  if (wordsPool.length === 0) return [];
  const poolDefs = Array.from(
    new Set(
      [...wordsPool.map((item) => item.word.definition), ...mockVocabularyWords.map((word) => word.definition)].filter(
        (definition) => Boolean(definition),
      ),
    ),
  );
  return wordsPool
    .map((item) => {
      const distractors = shuffle(poolDefs.filter((definition) => definition !== item.word.definition)).slice(
        0,
        3,
      );
      if (distractors.length < 3) return null;
      return {
        entryId: item.row.id,
        vocabularyId: item.word.id,
        word: item.word.word,
        phonetic: item.word.phonetic,
        correct: item.word.definition,
        options: shuffle([item.word.definition, ...distractors]),
      };
    })
    .filter((question): question is VocabularyPlayQuestion => Boolean(question));
}

/** Dashboard “Review words” strip — shape compatible with previous mockReviewWords. */
export type ReviewWordSnapshot = {
  word: string;
  pos: string;
  def: string;
  status: VocabularyWordStatusName;
};

export function getReviewWordsForUser(userId: number): ReviewWordSnapshot[] {
  return joinProfileVocabulary(userId).map(({ row, word }) => ({
    word: word.word,
    pos: word.pos,
    def: word.definition,
    status: vocabularyStatusIdToLegacy(row.statusId),
  }));
}

export const mockReviewWords: ReviewWordSnapshot[] = getReviewWordsForUser(activeUser.id);

export type MockProfileForm = {
  name: string;
  email: string;
  telegram: string;
  phone: string;
  timezoneId: TimeZoneId;
  nativeLanguage: string;
  proficiencyLevelId: ProficiencyLevelId;
  bio: string;
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
  /** References `USER_ACCOUNT_STATUS` ids. */
  statusId: UserAccountStatusId;
  /** `true` fixed schedule, `false` flexible. */
  scheduleType: boolean;
  teacherId: number;
  teacherName: string;
  wordsLearned: number;
  lessonsCompleted: number;
  streakDays: number;
};

export type MockStudent = ProfileViewModel;

const studentRecords = (): MockUser[] => mockUsers.filter((u) => u.role === USER_ROLE.student.id);

const toProfileViewModel = (userId: number): ProfileViewModel | null => {
  const user = mockUsers.find((entry) => entry.id === userId);
  if (
    !user ||
    user.role !== USER_ROLE.student.id ||
    user.statusId === undefined ||
    typeof user.scheduleType !== 'boolean'
  ) {
    return null;
  }
  const teacher =
    user.teacherId > 0 ? mockUsers.find((entry) => entry.id === user.teacherId) : undefined;
  const stats = user.stats;
  return {
    id: user.id,
    userId: user.id,
    fullName: user.fullName,
    proficiencyLevelId: user.proficiencyLevelId,
    email: user.email,
    phone: user.phone,
    timezoneId: user.timezoneId,
    color: user.color,
    statusId: user.statusId,
    scheduleType: user.scheduleType,
    teacherId: user.teacherId,
    teacherName: user.teacherId > 0 ? (teacher?.fullName ?? 'Unknown teacher') : '',
    wordsLearned: countKnownWordsForUser(user.id),
    lessonsCompleted: stats?.lessonsCompleted ?? 0,
    streakDays: stats?.streakDays ?? 0,
  };
};

export const getProfileByUserId = (userId: number): ProfileViewModel | undefined =>
  toProfileViewModel(userId) ?? undefined;

export const getVisibleProfiles = (role: UserRole, userId: number): ProfileViewModel[] => {
  if (role === USER_ROLE.teacher.id) {
    return studentRecords()
      .filter((u) => u.teacherId === userId)
      .map((u) => toProfileViewModel(u.id))
      .filter((entry): entry is ProfileViewModel => Boolean(entry));
  }
  if (role === USER_ROLE.admin.id || role === USER_ROLE.superAdmin.id) {
    return studentRecords()
      .map((u) => toProfileViewModel(u.id))
      .filter((entry): entry is ProfileViewModel => Boolean(entry));
  }
  if (role === USER_ROLE.student.id) {
    const own = toProfileViewModel(userId);
    return own ? [own] : [];
  }
  return [];
};

export const canManageProfile = (currentUser: MockUser, profile: ProfileViewModel): boolean => {
  if (currentUser.role === USER_ROLE.teacher.id) return profile.teacherId === currentUser.id;
  return currentUser.role === USER_ROLE.admin.id || currentUser.role === USER_ROLE.superAdmin.id;
};

export const getProfileFormByUserId = (userId: number): MockProfileForm => {
  const user = mockUsers.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error(`User "${userId}" not found in mock users`);
  }
  return {
    name: user.fullName,
    email: user.email,
    telegram: user.telegram,
    phone: user.phone,
    timezoneId: user.timezoneId ?? TIME_ZONE.kyiv.id,
    nativeLanguage: user.nativeLanguage || 'Ukrainian',
    proficiencyLevelId: user.proficiencyLevelId,
    bio: user.bio,
  };
};

export const mockProfileForm: MockProfileForm = getProfileFormByUserId(activeUser.id);

export const mockProfileStatsByUserId: Array<{ userId: number; stats: ProfileStats }> = mockUsers
  .filter((u) => u.stats)
  .map((u) => ({ userId: u.id, stats: u.stats! }));

/** @deprecated Prefer mockProfileStatsByUserId — kept name for fewer call-site edits. */
export const mockProfileStatsByAccount = mockProfileStatsByUserId;

export function getProfileStatsForUser(userId: number): ProfileStats {
  const entry = mockProfileStatsByUserId.find((row) => row.userId === userId);
  return entry?.stats ?? emptyProfileStats;
}

export function getProfileAchievementsForUserId(userId: number): ProfileAchievement[] {
  return buildProfileAchievements(getProfileStatsForUser(userId));
}

export const mockProfileStats = getProfileStatsForUser(activeUser.id);

export const mockProfileGoals = getDailyGoalsForUser(activeUser.id).map((g) => ({
  text: g.text,
  done: g.done,
})) as ReadonlyArray<{ text: string; done: boolean }>;

const activeWeekRange = getRangeBounds('week');
const activeWeekPracticeSummary = getPracticeSummaryForPresetRange(activeUser.id, 'week');
const activeWeekVocabulary = getVocabularyProgressForRange(activeUser.id, activeWeekRange);
const activeWeekQuizzes = Number(
  activeWeekPracticeSummary.metrics.find((metric) => metric.id === 2)?.value ?? 0,
);
const activeWeekSpeaking = Number(
  activeWeekPracticeSummary.metrics.find((metric) => metric.id === 3)?.value ?? 0,
);

function resolvedPracticeStat(title: string, fallback?: string): string | undefined {
  if (title === 'Vocabulary') return `${activeWeekVocabulary.addedWords} new words`;
  if (title === 'Quiz') return `${activeWeekQuizzes} available`;
  if (title === 'Speaking') return `${activeWeekSpeaking} pending`;
  return fallback;
}

export const mockPracticeActivities = siteContent.practiceActivities.map((activity) => ({
  href: activity.href,
  title: activity.title,
  description: activity.description,
  icon: activity.icon,
  tag: activity.tag,
  tagClass: activity.tagClass,
  stat: resolvedPracticeStat(activity.title, 'stat' in activity ? activity.stat : undefined),
  ctaLabel: 'ctaLabel' in activity ? activity.ctaLabel : undefined,
  accent: 'accent' in activity ? activity.accent : undefined,
  disabled: 'disabled' in activity ? activity.disabled : undefined,
})) as ReadonlyArray<{
  href: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
  tagClass: 'tagGreen' | 'tagBlue' | 'tagAmber' | 'tagMuted';
  stat?: string;
  ctaLabel?: string;
  accent?: 'green' | 'blue' | 'purple' | 'amber' | 'rose';
  disabled?: boolean;
}>;
