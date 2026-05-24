/**
 * Typed defaults for unit tests — keeps mocks aligned with `@pkg/types`.
 */
import {
  DEFAULT_NOTIFICATION_PREFS,
  LESSON_STATUS,
  TIME_ZONE,
  type AdminUserSummaryDto,
  type AuthUserDto,
  type ChatAttachmentDto,
  type ChatConversationDto,
  type ChatMessageDto,
  type ChatUserDto,
  type CreateAdminUserResultDto,
  type MyProfileDto,
  type PracticeWeekSummaryDto,
  type QuizAttemptSummaryDto,
  type QuizCardDto,
  type ScheduledLessonBackendDto,
  type ScheduledLessonDto,
  type StudentQuizCardDto,
  type StudentSummaryBackendDto,
  type StudentWordCardDto,
  type WordCardDto,
  type WordDefinitionDto,
  type WordDetailsDto,
  type WordLookupResultDto,
} from '@pkg/types';
import type { LessonPartyOption } from '../hooks/use-lesson-party-options';
import type { ProfileCompletenessInput } from '../lib/profile-complete';

export function mockScheduledLesson(
  overrides: Partial<ScheduledLessonDto> = {},
): ScheduledLessonDto {
  return {
    id: 1,
    title: 'Lesson',
    date: '2026-01-01',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    timezoneId: TIME_ZONE.kyiv.id,
    teacherId: 1,
    teacherName: 'Teacher',
    studentId: 2,
    studentName: 'Student',
    statusId: LESSON_STATUS.planned.id,
    credited: false,
    order: 0,
    recurrence: 'none',
    weeklyDays: [],
    materials: [],
    homework: { text: '', files: [] },
    studentResponse: { text: '', files: [], status: 'not_submitted' },
    ...overrides,
  };
}

export function mockScheduledLessonBackend(
  overrides: Partial<ScheduledLessonBackendDto> = {},
): ScheduledLessonBackendDto {
  return {
    id: 'lesson-1',
    title: 'Lesson',
    date: '2026-01-01',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    timezone: 'Europe/Kyiv',
    teacherId: 'teacher-1',
    teacherName: 'Teacher',
    studentId: 'student-1',
    studentName: 'Student',
    status: 'planned',
    credited: false,
    recurrence: 'none',
    weeklyDays: [],
    order: 0,
    materials: [],
    homework: { text: '', files: [], fileLinks: [] },
    studentResponse: {
      text: '',
      files: [],
      fileLinks: [],
      status: 'not_submitted',
      homeworkChecked: false,
      teacherHomeworkFeedback: '',
    },
    linkedWordIds: [],
    ...overrides,
  };
}

export function mockLessonPartyOption(
  overrides: Partial<LessonPartyOption> = {},
): LessonPartyOption {
  return {
    id: 1,
    fullName: 'Party',
    backendId: 'party-1',
    timezoneIana: 'Europe/Kyiv',
    scheduleType: true,
    ...overrides,
  };
}

export function mockAuthUser(overrides: Partial<AuthUserDto> = {}): AuthUserDto {
  return {
    id: 'user-1',
    email: 'user@example.com',
    displayName: 'User',
    role: 'student',
    status: 'active',
    timezone: 'Europe/Kyiv',
    hasPassword: true,
    linkedProviders: [],
    ...overrides,
  };
}

export function mockAdminUserSummary(
  overrides: Partial<AdminUserSummaryDto> = {},
): AdminUserSummaryDto {
  return {
    id: 'user-1',
    email: 'user@example.com',
    displayName: 'User',
    role: 'student',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function mockCreateAdminUserResult(
  overrides: Partial<CreateAdminUserResultDto> = {},
): CreateAdminUserResultDto {
  return {
    user: mockAuthUser(),
    welcomeEmailSent: false,
    ...overrides,
  };
}

export function mockMyProfile(overrides: Partial<MyProfileDto> = {}): MyProfileDto {
  return {
    id: 'user-1',
    email: 'user@example.com',
    displayName: 'User',
    avatarUrl: null,
    timezone: 'Europe/Kyiv',
    proficiencyLevel: 'B1',
    phone: null,
    telegram: null,
    bio: null,
    nativeLanguageId: null,
    role: 'student',
    status: 'active',
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
    linkedAccounts: [],
    ...overrides,
  };
}

export function mockProfileCompletenessInput(
  overrides: Partial<ProfileCompletenessInput> = {},
): ProfileCompletenessInput {
  return {
    displayName: 'User',
    email: 'user@example.com',
    avatarUrl: '',
    timezone: 'Europe/Kyiv',
    proficiencyLevel: 'B1',
    phone: '',
    telegram: '',
    bio: '',
    nativeLanguageId: '',
    ...overrides,
  };
}

export function mockChatUser(overrides: Partial<ChatUserDto> = {}): ChatUserDto {
  return {
    id: 'user-1',
    displayName: 'User',
    displayRole: 'student',
    roleLabel: 'Student',
    avatarUrl: null,
    initials: 'U',
    ...overrides,
  };
}

export function mockChatConversation(
  overrides: Partial<ChatConversationDto> = {},
): ChatConversationDto {
  return {
    id: 'conv-1',
    type: 'direct',
    title: 'Chat',
    peer: mockChatUser(),
    lastMessage: null,
    lastMessageAt: '2026-01-01T00:00:00.000Z',
    unreadCount: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function mockChatMessage(overrides: Partial<ChatMessageDto> = {}): ChatMessageDto {
  return {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    sender: mockChatUser(),
    body: 'Hello',
    createdAt: '2026-01-01T00:00:00.000Z',
    isMine: true,
    ...overrides,
  };
}

export function mockChatAttachment(
  overrides: Partial<ChatAttachmentDto> = {},
): ChatAttachmentDto {
  return {
    id: 'att-1',
    fileName: 'file.txt',
    mimeType: 'text/plain',
    sizeBytes: 10,
    url: '/chat/attachments/att-1',
    expiresAt: '2026-12-31T00:00:00.000Z',
    expired: false,
    ...overrides,
  };
}

export function mockQuizCard(overrides: Partial<QuizCardDto> = {}): QuizCardDto {
  return {
    id: 'q1',
    title: 'Quiz',
    category: 'general',
    difficulty: 'medium',
    source: 'manual',
    questionCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function mockQuizAttempt(
  overrides: Partial<QuizAttemptSummaryDto> = {},
): QuizAttemptSummaryDto {
  return {
    id: 'attempt-1',
    score: null,
    correctCount: 0,
    totalCount: 0,
    finishedAt: null,
    ...overrides,
  };
}

export function mockStudentQuizCard(
  overrides: Partial<StudentQuizCardDto> = {},
): StudentQuizCardDto {
  return {
    ...mockQuizCard(),
    assignmentId: 'assign-1',
    attempt: null,
    ...overrides,
  };
}

export function mockStudentSummary(
  overrides: Partial<StudentSummaryBackendDto> = {},
): StudentSummaryBackendDto {
  return {
    id: 'student-1',
    email: 'student@example.com',
    displayName: 'Student',
    status: 'active',
    proficiencyLevel: 'B1',
    timezone: 'Europe/Kyiv',
    teacherId: null,
    teacherName: null,
    avatarUrl: null,
    nativeLanguageId: null,
    learningLanguageIds: [],
    scheduleType: true,
    displayColor: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function mockWordCard(overrides: Partial<WordCardDto> = {}): WordCardDto {
  return {
    id: 'word-1',
    text: 'hello',
    definition: 'greeting',
    definitions: [],
    synonyms: [],
    antonyms: [],
    ...overrides,
  };
}

export function mockWordDefinition(
  overrides: Partial<WordDefinitionDto> = {},
): WordDefinitionDto {
  return {
    languageId: 'en',
    text: 'definition',
    ...overrides,
  };
}

export function mockWordDetails(overrides: Partial<WordDetailsDto> = {}): WordDetailsDto {
  return {
    ...mockWordCard(),
    ...overrides,
  };
}

export function mockWordLookupResult(
  overrides: Partial<WordLookupResultDto> = {},
): WordLookupResultDto {
  return {
    foundInDb: false,
    foundInDictionary: false,
    word: null,
    preview: null,
    ...overrides,
  };
}

export function mockStudentWordCard(
  overrides: Partial<StudentWordCardDto> = {},
): StudentWordCardDto {
  return {
    id: 'card-1',
    word: mockWordCard(),
    status: 'new',
    masteryLevel: 0,
    ...overrides,
  };
}

export function mockPracticeWeekSummary(
  overrides: Partial<PracticeWeekSummaryDto> = {},
): PracticeWeekSummaryDto {
  return {
    practiceMinutes: 0,
    metrics: [],
    ...overrides,
  };
}
