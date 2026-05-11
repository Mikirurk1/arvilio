/** Role catalog: each entry has a stable id and a machine-friendly name (slug). */
export const USER_ROLE = {
  student: { id: 1, name: 'student' },
  teacher: { id: 2, name: 'teacher' },
  admin: { id: 3, name: 'admin' },
  superAdmin: { id: 4, name: 'super-admin' },
} as const;

export type UserRoleEntry = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type UserRoleId = UserRoleEntry['id'];

/** All role ids in stable order (matrix, session, selects). */
export const USER_ROLE_ID_LIST: readonly UserRoleId[] = [
  USER_ROLE.student.id,
  USER_ROLE.teacher.id,
  USER_ROLE.admin.id,
  USER_ROLE.superAdmin.id,
];

/** CEFR-style proficiency levels (users, lessons catalog, etc.). */
export const PROFICIENCY_LEVEL = {
  a1: { id: 1, code: 'A1', label: 'Beginner' },
  a2: { id: 2, code: 'A2', label: 'Elementary' },
  b1: { id: 3, code: 'B1', label: 'Intermediate' },
  b2: { id: 4, code: 'B2', label: 'Upper intermediate' },
  c1: { id: 5, code: 'C1', label: 'Advanced' },
  c2: { id: 6, code: 'C2', label: 'Proficient' },
} as const;

export type ProficiencyLevelEntry = (typeof PROFICIENCY_LEVEL)[keyof typeof PROFICIENCY_LEVEL];

export type ProficiencyLevelId = ProficiencyLevelEntry['id'];

export const PROFICIENCY_LEVEL_ID_LIST: readonly ProficiencyLevelId[] = [
  PROFICIENCY_LEVEL.a1.id,
  PROFICIENCY_LEVEL.a2.id,
  PROFICIENCY_LEVEL.b1.id,
  PROFICIENCY_LEVEL.b2.id,
  PROFICIENCY_LEVEL.c1.id,
  PROFICIENCY_LEVEL.c2.id,
];

export function getProficiencyLevelById(id: ProficiencyLevelId): ProficiencyLevelEntry | undefined {
  for (const key of Object.keys(PROFICIENCY_LEVEL) as (keyof typeof PROFICIENCY_LEVEL)[]) {
    const entry = PROFICIENCY_LEVEL[key];
    if (entry.id === id) return entry;
  }
  return undefined;
}

/** IANA zones for calendar math; labels use country + capital for stable UX copy. */
export const TIME_ZONE = {
  kyiv: { id: 1, iana: 'Europe/Kyiv', country: 'Ukraine', capital: 'Kyiv' },
  warsaw: { id: 2, iana: 'Europe/Warsaw', country: 'Poland', capital: 'Warsaw' },
  london: { id: 3, iana: 'Europe/London', country: 'United Kingdom', capital: 'London' },
  newYork: { id: 4, iana: 'America/New_York', country: 'United States', capital: 'New York' },
  tokyo: { id: 5, iana: 'Asia/Tokyo', country: 'Japan', capital: 'Tokyo' },
} as const;

export type TimeZoneEntry = (typeof TIME_ZONE)[keyof typeof TIME_ZONE];

export type TimeZoneId = TimeZoneEntry['id'];

export const TIME_ZONE_ID_LIST: readonly TimeZoneId[] = [
  TIME_ZONE.kyiv.id,
  TIME_ZONE.warsaw.id,
  TIME_ZONE.london.id,
  TIME_ZONE.newYork.id,
  TIME_ZONE.tokyo.id,
];

export function getTimeZoneById(id: TimeZoneId): TimeZoneEntry | undefined {
  for (const key of Object.keys(TIME_ZONE) as (keyof typeof TIME_ZONE)[]) {
    const entry = TIME_ZONE[key];
    if (entry.id === id) return entry;
  }
  return undefined;
}

export function formatTimeZoneOptionLabel(entry: TimeZoneEntry): string {
  return `${entry.country} — ${entry.capital} (${entry.iana})`;
}

/** Student / account roster status (active, paused, left, blocked). */
export const USER_ACCOUNT_STATUS = {
  active: { id: 1, name: 'active' },
  paused: { id: 2, name: 'paused' },
  leaved: { id: 3, name: 'leaved' },
  blocked: { id: 4, name: 'blocked' },
} as const;

export type UserAccountStatusEntry = (typeof USER_ACCOUNT_STATUS)[keyof typeof USER_ACCOUNT_STATUS];

export type UserAccountStatusId = UserAccountStatusEntry['id'];

export const USER_ACCOUNT_STATUS_ID_LIST: readonly UserAccountStatusId[] = [
  USER_ACCOUNT_STATUS.active.id,
  USER_ACCOUNT_STATUS.paused.id,
  USER_ACCOUNT_STATUS.leaved.id,
  USER_ACCOUNT_STATUS.blocked.id,
];

export function getUserAccountStatusById(
  id: UserAccountStatusId,
): UserAccountStatusEntry | undefined {
  for (const key of Object.keys(USER_ACCOUNT_STATUS) as (keyof typeof USER_ACCOUNT_STATUS)[]) {
    const entry = USER_ACCOUNT_STATUS[key];
    if (entry.id === id) return entry;
  }
  return undefined;
}

export type VocabularyOverviewDto = {
  totalWords: number;
  masteredWords: number;
  dueToday: number;
};

/** Stable numeric ids + labels for per-word progress. */
export const VOCABULARY_WORD_STATUS = {
  new: { id: 1, name: 'new' },
  repeated: { id: 2, name: 'repeated' },
  mistakesWork: { id: 3, name: 'mistakes_work' },
  learned: { id: 4, name: 'learned' },
} as const;

export type VocabularyWordStatusEntry =
  (typeof VOCABULARY_WORD_STATUS)[keyof typeof VOCABULARY_WORD_STATUS];
export type VocabularyWordStatusId = VocabularyWordStatusEntry['id'];
export type VocabularyWordStatusName = VocabularyWordStatusEntry['name'];
export const VOCABULARY_WORD_STATUS_IDS = {
  new: VOCABULARY_WORD_STATUS.new.id,
  repeated: VOCABULARY_WORD_STATUS.repeated.id,
  mistakesWork: VOCABULARY_WORD_STATUS.mistakesWork.id,
  learned: VOCABULARY_WORD_STATUS.learned.id,
} as const;
/** Backward-compatible alias kept for app code; prefer `VocabularyWordStatusId`. */
export type VocabularyWordStatus = VocabularyWordStatusId;

/** Global dictionary entry — no per-user status (see ProfileVocabularyEntry). */
export type VocabularyWordDto = {
  id: number;
  word: string;
  phonetic: string;
  pos: string;
  definition: string;
  example: string;
  category: string;
};

/** Per-student progress linking a global vocabulary id to optional lesson context. */
export type ProfileVocabularyEntry = {
  id: number;
  vocabularyId: number;
  lessonId?: number;
  /** References `VOCABULARY_WORD_STATUS_IDS` values. */
  statusId: VocabularyWordStatusId;
  /** ISO datetime when this word was added to the student's profile vocabulary. */
  addedAt?: string;
  /** ISO datetime when teacher moved the word to known. */
  knownAt?: string;
  /** Teacher id who moved the word to known. */
  knownByTeacherId?: number;
  /** Optional lifecycle history for audits and statistics. */
  events?: ProfileVocabularyProgressEvent[];
};

export const PROFILE_VOCABULARY_PROGRESS_EVENT = {
  created: { id: 1, name: 'created' },
  statusChanged: { id: 2, name: 'status_changed' },
} as const;

export type ProfileVocabularyProgressEventEntry =
  (typeof PROFILE_VOCABULARY_PROGRESS_EVENT)[keyof typeof PROFILE_VOCABULARY_PROGRESS_EVENT];
export type ProfileVocabularyProgressEventTypeId = ProfileVocabularyProgressEventEntry['id'];

export type ProfileVocabularyProgressEvent = {
  id: number;
  entryId: number;
  at: string;
  typeId: ProfileVocabularyProgressEventTypeId;
  actorUserId: number;
  actorRoleId: UserRoleId;
  previousStatusId?: VocabularyWordStatusId;
  nextStatusId?: VocabularyWordStatusId;
};

export const PRACTICE_SESSION_TYPE = {
  vocabulary: { id: 1, name: 'vocabulary' },
  quiz: { id: 2, name: 'quiz' },
  speaking: { id: 3, name: 'speaking' },
  games: { id: 4, name: 'games' },
  challenges: { id: 5, name: 'challenges' },
  lesson: { id: 6, name: 'lesson' },
} as const;

export type PracticeSessionTypeEntry = (typeof PRACTICE_SESSION_TYPE)[keyof typeof PRACTICE_SESSION_TYPE];
export type PracticeSessionTypeId = PracticeSessionTypeEntry['id'];

export type PracticeSessionLogEntry = {
  id: number;
  studentId: number;
  typeId: PracticeSessionTypeId;
  startedAt: string;
  endedAt: string;
  durationMin: number;
  source: 'practice' | 'lesson' | 'manual';
};

export type LessonDto = {
  id: string;
  title: string;
  level: string;
  duration: number;
  xp: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  completed: boolean;
  locked: boolean;
};

export type QuizQuestionDto = {
  id: string;
  type: 'multiple-choice' | 'fill-in';
  question: string;
  options?: string[];
  correct: number | string;
  explanation: string;
};

export type CalendarEventDto = {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  statusId: LessonStatusId;
};

export const LESSON_STATUS = {
  planned: { id: 1, name: 'planned' },
  completed: { id: 2, name: 'completed' },
  cancelled: { id: 3, name: 'cancelled' },
} as const;
export type LessonStatusEntry =
  (typeof LESSON_STATUS)[keyof typeof LESSON_STATUS];
export type LessonStatusId = LessonStatusEntry['id'];
export type LessonCancelReason =
  | 'student_absent'
  | 'student_requested_cancel'
  | 'teacher_absent';
export type LessonRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type StudentResponseStatus =
  | 'not_submitted'
  | 'submitted'
  | 'needs_rework'
  | 'accepted';

export type ScheduledLessonDto = {
  id: number;
  lessonId?: number;
  title: string;
  /** Calendar date in the lesson's `timezoneId` (wall clock). */
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  /** Wall-clock fields above are interpreted in this zone (usually the teacher's when booking). */
  timezoneId: TimeZoneId;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  statusId: LessonStatusId;
  cancelReason?: LessonCancelReason;
  credited: boolean;
  notes?: string;
  /** Short lesson summary for the lesson hub / sidebar (distinct from internal notes). */
  description?: string;
  lessonPlan?: string;
  materials?: Array<{
    id: string;
    kind: 'text' | 'photo' | 'test' | 'file' | 'presentation';
    text: string;
    files: string[];
  }>;
  homework?: {
    text: string;
    files: string[];
  };
  studentResponse?: {
    text: string;
    files: string[];
    status?: StudentResponseStatus;
    /** Staff marked the homework submission as reviewed. */
    homeworkChecked?: boolean;
    /** Teacher feedback on homework (visible to the student after homeworkChecked). */
    teacherHomeworkFeedback?: string;
  };
  order: number;
  recurrence: LessonRecurrence;
  weeklyDays?: number[];
  seriesId?: string;
  /** Vocabulary word ids from the global catalog linked to this lesson. */
  linkedVocabularyIds?: number[];
};
