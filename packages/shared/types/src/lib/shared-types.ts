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
  new: { id: 1, name: 'new', label: 'New' },
  repeated: { id: 2, name: 'repeated', label: 'Repeated' },
  mistakesWork: { id: 3, name: 'mistakes_work', label: 'Review' },
  learned: { id: 4, name: 'learned', label: 'Learned' },
} as const;

export type VocabularyWordStatusEntry =
  (typeof VOCABULARY_WORD_STATUS)[keyof typeof VOCABULARY_WORD_STATUS];
export type VocabularyWordStatusId = VocabularyWordStatusEntry['id'];
export type VocabularyWordStatusName = VocabularyWordStatusEntry['name'];

export const VOCABULARY_WORD_STATUS_LABELS: Record<VocabularyWordStatusName, string> = {
  new: VOCABULARY_WORD_STATUS.new.label,
  repeated: VOCABULARY_WORD_STATUS.repeated.label,
  mistakes_work: VOCABULARY_WORD_STATUS.mistakesWork.label,
  learned: VOCABULARY_WORD_STATUS.learned.label,
};

export function vocabularyStatusLabel(status: VocabularyWordStatusName): string {
  return VOCABULARY_WORD_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}

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

/** Public, backend-driven shape of the authenticated user. */
export type AuthUserDto = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  status: 'active' | 'paused' | 'leaved' | 'blocked';
  proficiencyLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  timezone: string;
  teacherId?: string | null;
  hasPassword: boolean;
  linkedProviders: Array<'google' | 'facebook' | 'telegram'>;
};

export type AuthSessionDto = {
  user: AuthUserDto;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

/** Backend-returned summary row for the admin users list. */
export type AdminUserSummaryDto = {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  status: 'active' | 'paused' | 'leaved' | 'blocked';
  createdAt: string;
};

export type LanguageDto = {
  id: string;
  code: string;
  name: string;
};

export type UpdateAdminStudentRequestDto = {
  nativeLanguageId?: string | null;
  learningLanguageIds?: string[];
  /** Assign or clear the student's teacher (admin / super-admin only). */
  teacherId?: string | null;
  /** `true` = fixed schedule (recurrence allowed). */
  scheduleType?: boolean;
  /** Calendar/roster accent (#RRGGBB). Staff only. */
  displayColor?: string | null;
};

export type CreateAdminUserRequestDto = {
  email: string;
  role?: 'student' | 'teacher' | 'admin';
  displayName?: string | null;
  phone?: string | null;
  telegram?: string | null;
  bio?: string | null;
  nativeLanguageId?: string | null;
  learningLanguageIds?: string[];
  timezone?: string | null;
  proficiencyLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  status?: 'active' | 'paused' | 'leaved' | 'blocked';
  teacherId?: string | null;
};

export type CreateAdminUserResultDto = {
  user: AuthUserDto;
  welcomeEmailSent: boolean;
};

export type SystemMailStatusDto = {
  configured: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  mailFrom: string;
  templatesDir: string;
};

/** Active word lookup provider (platform setting). */
export type WordDictionaryProviderId = 'dictionary_api_dev' | 'wiktionary';

export type WordDictionaryProviderInfoDto = {
  id: WordDictionaryProviderId;
  name: string;
  description: string;
  docsUrl: string;
};

export type WordDictionarySettingsDto = {
  activeProvider: WordDictionaryProviderId;
  providers: WordDictionaryProviderInfoDto[];
};

export type SendTestWelcomeEmailRequestDto = {
  to: string;
};

export type SendTestEmailResultDto = {
  sent: boolean;
  message: string | null;
};

/** Result of lookupWord — DB hit or external preview without save. */
export type WordLookupResultDto = {
  foundInDb: boolean;
  /** Dictionary provider returned an entry (false → do not add the word). */
  foundInDictionary: boolean;
  word: WordCardDto | null;
  preview: WordCardDto | null;
};

/** Staff who may be assigned as a student's teacher or selected on a lesson. */
export type AssignableTeacherDto = {
  id: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'admin' | 'super_admin';
  timezone: string;
};

/** Backend-driven student row for the teacher/admin Students page. */
export type StudentSummaryBackendDto = {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'paused' | 'leaved' | 'blocked';
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  timezone: string;
  teacherId: string | null;
  teacherName: string | null;
  avatarUrl: string | null;
  nativeLanguageId: string | null;
  learningLanguageIds: string[];
  /** `true` = fixed schedule (recurrence allowed). */
  scheduleType: boolean;
  /** User color for calendar (#RRGGBB). */
  displayColor: string | null;
  createdAt: string;
};

/** Profile → Notifications tab toggles (persisted on User). */
export type ProfileNotificationPrefs = {
  lessonReminder: boolean;
  streakAlert: boolean;
  weeklyReport: boolean;
  newVocab: boolean;
  teacherMessages: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: ProfileNotificationPrefs = {
  lessonReminder: true,
  streakAlert: true,
  weeklyReport: true,
  newVocab: false,
  teacherMessages: true,
};

export type ProfileLinkedAccountDto = {
  provider: 'google' | 'facebook' | 'telegram';
  linked: boolean;
  connectedAs?: string | null;
  /** Google only: Calendar + Meet tokens stored for lesson scheduling. */
  calendarConnected?: boolean;
};

/** Telegram Login Widget callback payload (https://core.telegram.org/widgets/login). */
export type TelegramLoginPayloadDto = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export type MyProfileDto = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  phone: string | null;
  telegram: string | null;
  bio: string | null;
  nativeLanguageId: string | null;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  status: 'active' | 'paused' | 'leaved' | 'blocked';
  notificationPrefs: ProfileNotificationPrefs;
  linkedAccounts: ProfileLinkedAccountDto[];
};

export type UpdateMyProfileRequestDto = {
  displayName?: string;
  timezone?: string;
  avatarUrl?: string | null;
  proficiencyLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  phone?: string | null;
  telegram?: string | null;
  bio?: string | null;
  nativeLanguageId?: string | null;
  notificationPrefs?: Partial<ProfileNotificationPrefs>;
};

export type SendTeacherMessageRequestDto = {
  studentId: string;
  body: string;
};

export type TeacherMessageDto = {
  id: string;
  teacherId: string;
  studentId: string;
  body: string;
  createdAt: string;
};

/** Role label exposed in chat UI (super_admin is masked as admin for other users). */
export type ChatDisplayRole = 'student' | 'teacher' | 'admin';

export type ChatUserDto = {
  id: string;
  displayName: string;
  displayRole: ChatDisplayRole;
  roleLabel: string;
  avatarUrl: string | null;
  initials: string;
};

export type ChatConversationDto = {
  id: string;
  type: 'direct' | 'group';
  title: string;
  peer: ChatUserDto | null;
  participants?: ChatUserDto[];
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
  updatedAt: string;
};

export type ChatAttachmentDto = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Path relative to API base, e.g. `/chat/attachments/:id` → browser `/api/chat/attachments/:id` */
  url: string;
  expiresAt: string;
  expired: boolean;
};

export type ChatMessageDto = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: ChatUserDto;
  body: string;
  createdAt: string;
  isMine: boolean;
  attachment?: ChatAttachmentDto | null;
};

export type CreateGroupConversationRequestDto = {
  title: string;
  memberIds: string[];
};

export type ChangePasswordRequestDto = {
  currentPassword: string;
  newPassword: string;
};

export type DashboardSummaryDto = {
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  lessonsToday: number;
  lessonsThisWeek: number;
  lessonsCompleted: number;
  vocabularyCount: number;
  reviewCount: number;
};

export type LearningStreakDto = {
  streakDays: number;
  activeToday: boolean;
  year: number;
  month: string;
  activeDays: number[];
};

export type WordOfDayDto = {
  wordId: string;
  cardId: string | null;
  text: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
};

export type DailyGoalDto = {
  id: string;
  templateId: string;
  text: string;
  difficulty: 1 | 2 | 3 | 4;
  done: boolean;
  xpReward: number;
  dateKey: string;
};

export type PracticeWeekMetricDto = {
  id: string;
  label: string;
  value: string;
};

export type PracticeWeekSummaryDto = {
  practiceMinutes: number;
  metrics: PracticeWeekMetricDto[];
};

export type RecordPracticeSessionRequestDto = {
  kind: 'vocabulary' | 'quiz' | 'speaking' | 'games' | 'challenges' | 'lesson';
  startedAt: string;
  endedAt: string;
  source?: 'practice' | 'lesson' | 'manual';
};

export type PracticeSessionDto = {
  id: string;
  kind: RecordPracticeSessionRequestDto['kind'];
  source: NonNullable<RecordPracticeSessionRequestDto['source']>;
  startedAt: string;
  endedAt: string;
  durationSec: number;
};

export type WordDefinitionDto = {
  languageId: string;
  /** Translated definition in this language. */
  text: string;
  /** Translated word form (lemma) in this language. */
  lemmaText?: string | null;
  /** Part of speech for this gloss (empty for legacy rows). */
  partOfSpeech?: string;
};

/** Irregular verb conjugation forms (from curated list). */
export type VerbFormsDto = {
  pastSimple: string;
  pastParticiple: string;
};

/** Word card (global dictionary entry) returned by the backend. */
export type WordCardDto = {
  id: string;
  text: string;
  /** Primary English definition (denormalized). */
  definition: string;
  definitions: WordDefinitionDto[];
  example?: string | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  category?: string | null;
  audioUrl?: string | null;
  origin?: string | null;
  synonyms: string[];
  antonyms: string[];
  source?: string | null;
  /** Present when the lemma is a known irregular verb with a verb sense. */
  verbForms?: VerbFormsDto | null;
};

/** Full word payload for details modal (from DB only). */
export type WordDetailsDto = WordCardDto & {
  sourcePayloadJson?: string | null;
};

export type StudentWordCardDto = {
  id: string;
  word: WordCardDto;
  status: 'new' | 'repeated' | 'mistakes_work' | 'learned';
  masteryLevel: number;
  lessonId?: string | null;
  firstSeenAt?: string | null;
  lastReviewedAt?: string | null;
  nextReviewAt?: string | null;
  knownAt?: string | null;
};

export type CreateWordRequestDto = {
  text: string;
  /** Optional pre-filled fields; missing fields will be enriched server-side. */
  definition?: string;
  example?: string;
  phonetic?: string;
  partOfSpeech?: string;
  category?: string;
};

export type CreateStudentWordCardRequestDto = {
  text: string;
  lessonId?: string;
  status?: 'new' | 'repeated' | 'mistakes_work' | 'learned';
};

/** Quiz DTOs returned/expected by the backend. */
export type QuizCardDto = {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'manual' | 'vocabulary' | 'lesson' | 'mixed';
  lessonId?: string | null;
  questionCount: number;
  createdAt: string;
  /** Latest finished attempt by the current user (owner self-serve or assigned student). */
  attempt?: QuizAttemptSummaryDto | null;
};

export type QuizDetailDto = QuizCardDto & {
  questions: Array<
    QuizQuestionDto & {
      id: string;
      wordId?: string | null;
    }
  >;
};

export type GenerateQuizRequestDto = {
  studentId?: string;
  lessonId?: string;
  source?: 'vocabulary' | 'lesson' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
  title?: string;
  category?: string;
  /** When true (default), include past / past-participle drills for irregular verbs in the pool. */
  includeIrregularVerbDrills?: boolean;
};

export type QuizAttemptSummaryDto = {
  id: string;
  score: number | null;
  correctCount: number;
  totalCount: number;
  finishedAt: string | null;
};

export type StudentQuizCardDto = QuizCardDto & {
  assignmentId: string;
  attempt: QuizAttemptSummaryDto | null;
};

export type SubmitQuizAttemptRequestDto = {
  quizId: string;
  studentId?: string;
  /** Staff preview — score is returned but not stored. */
  practiceMode?: boolean;
  answers: Array<{ questionId: string; givenAnswer: string }>;
};

export type QuizAttemptResultDto = {
  attemptId: string | null;
  score: number;
  correctCount: number;
  totalCount: number;
  practiceMode: boolean;
};

/** Download metadata for a lesson file ref (`att:{id}` or legacy filename). */
export type LessonFileLinkDto = {
  ref: string;
  fileName: string;
  downloadPath: string | null;
};

/** Scheduled tutoring session — replaces the in-memory mock used by the web app. */
export type ScheduledLessonBackendDto = {
  id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  lessonPlan?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  status: 'planned' | 'completed' | 'cancelled';
  cancelReason?: 'student_absent' | 'student_requested_cancel' | 'teacher_absent' | null;
  credited: boolean;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  weeklyDays: number[];
  seriesId?: string | null;
  order: number;
  googleMeetUrl?: string | null;
  googleCalendarEventId?: string | null;
  meetCreatedAt?: string | null;
  materials: Array<{
    id: string;
    kind: 'text' | 'photo' | 'test' | 'file' | 'presentation';
    text: string;
    files: string[];
    fileLinks: LessonFileLinkDto[];
  }>;
  homework: {
    text: string;
    files: string[];
    fileLinks: LessonFileLinkDto[];
  };
  studentResponse: {
    text: string;
    files: string[];
    fileLinks: LessonFileLinkDto[];
    status: 'not_submitted' | 'submitted' | 'needs_rework' | 'accepted';
    homeworkChecked: boolean;
    teacherHomeworkFeedback: string;
  };
  linkedWordIds: string[];
};

export type CreateScheduledLessonRequestDto = {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  timezone?: string;
  teacherId?: string;
  studentId: string;
  status?: 'planned' | 'completed' | 'cancelled';
  notes?: string;
  lessonPlan?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  weeklyDays?: number[];
  seriesId?: string;
  linkedWordIds?: string[];
  createMeetLink?: boolean;
  homework?: {
    text?: string;
    files?: string[];
  };
  studentResponse?: {
    text?: string;
    files?: string[];
    status?: 'not_submitted' | 'submitted' | 'needs_rework' | 'accepted';
    homeworkChecked?: boolean;
    teacherHomeworkFeedback?: string;
  };
  materials?: Array<{
    id?: string;
    kind: 'text' | 'photo' | 'test' | 'file' | 'presentation';
    text?: string;
    files?: string[];
  }>;
};

export type UpdateScheduledLessonRequestDto = Partial<CreateScheduledLessonRequestDto> & {
  cancelReason?: 'student_absent' | 'student_requested_cancel' | 'teacher_absent' | null;
  credited?: boolean;
};

export type ScheduledLessonDto = {
  id: number;
  /** Backend `ScheduledLesson` UUID (cuid). Stable across reloads — use for API writes. */
  backendId?: string;
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
    fileLinks?: LessonFileLinkDto[];
  }>;
  homework?: {
    text: string;
    files: string[];
    fileLinks?: LessonFileLinkDto[];
  };
  studentResponse?: {
    text: string;
    files: string[];
    fileLinks?: LessonFileLinkDto[];
    status?: StudentResponseStatus;
    /** Staff marked the homework submission as reviewed. */
    homeworkChecked?: boolean;
    /** Teacher feedback on homework (visible to the student after homeworkChecked). */
    teacherHomeworkFeedback?: string;
  };
  order: number;
  /** Google Meet join URL when Calendar integration created the event. */
  googleMeetUrl?: string | null;
  recurrence: LessonRecurrence;
  weeklyDays?: number[];
  seriesId?: string;
  /** @deprecated Mock numeric ids — use linkedWordIds (backend Word cuid). */
  linkedVocabularyIds?: number[];
  /** Global Word ids (cuid) linked to this lesson. */
  linkedWordIds?: string[];
};
