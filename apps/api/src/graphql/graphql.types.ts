import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DailyGoalType {
  @Field(() => ID)
  id!: string;

  @Field()
  templateId!: string;

  @Field()
  text!: string;

  @Field(() => Int)
  difficulty!: number;

  @Field()
  done!: boolean;

  @Field(() => Int)
  xpReward!: number;

  @Field()
  dateKey!: string;
}

@ObjectType()
export class DashboardSummaryType {
  @Field()
  role!: string;

  @Field(() => Int)
  lessonsToday!: number;

  @Field(() => Int)
  lessonsThisWeek!: number;

  @Field(() => Int)
  lessonsCompleted!: number;

  @Field(() => Int)
  vocabularyCount!: number;

  @Field(() => Int)
  reviewCount!: number;
}

@ObjectType()
export class LearningStreakType {
  @Field(() => Int)
  streakDays!: number;

  @Field()
  activeToday!: boolean;

  @Field(() => Int)
  year!: number;

  @Field()
  month!: string;

  @Field(() => [Int])
  activeDays!: number[];
}

@ObjectType()
export class WordOfDayType {
  @Field(() => ID)
  wordId!: string;

  @Field(() => ID, { nullable: true })
  cardId!: string | null;

  @Field()
  text!: string;

  @Field({ nullable: true })
  phonetic!: string | null;

  @Field({ nullable: true })
  partOfSpeech!: string | null;

  @Field()
  definition!: string;

  @Field({ nullable: true })
  example!: string | null;
}

@ObjectType()
export class PracticeWeekMetricType {
  @Field()
  id!: string;

  @Field()
  label!: string;

  @Field()
  value!: string;
}

@ObjectType()
export class PracticeWeekSummaryType {
  @Field(() => Int)
  practiceMinutes!: number;

  @Field(() => [PracticeWeekMetricType])
  metrics!: PracticeWeekMetricType[];
}

@ObjectType()
export class PracticeSessionType {
  @Field(() => ID)
  id!: string;

  @Field()
  kind!: string;

  @Field()
  source!: string;

  @Field()
  startedAt!: string;

  @Field()
  endedAt!: string;

  @Field(() => Int)
  durationSec!: number;
}

@InputType()
export class RecordPracticeSessionInput {
  @Field()
  kind!: string;

  @Field()
  startedAt!: string;

  @Field()
  endedAt!: string;

  @Field({ nullable: true })
  source?: string;
}

@ObjectType()
export class VocabularyOverviewType {
  @Field(() => Int)
  totalWords!: number;

  @Field(() => Int)
  masteredWords!: number;

  @Field(() => Int)
  dueToday!: number;
}

@ObjectType()
export class LanguageType {
  @Field(() => ID)
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class WordDefinitionType {
  @Field(() => ID)
  languageId!: string;

  @Field()
  text!: string;

  @Field({ nullable: true })
  lemmaText?: string | null;

  @Field({ nullable: true })
  partOfSpeech?: string;
}

@ObjectType()
export class WordCardType {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;

  @Field()
  definition!: string;

  @Field(() => [WordDefinitionType])
  definitions!: WordDefinitionType[];

  @Field({ nullable: true })
  example?: string | null;

  @Field({ nullable: true })
  phonetic?: string | null;

  @Field({ nullable: true })
  partOfSpeech?: string | null;

  @Field({ nullable: true })
  category?: string | null;

  @Field({ nullable: true })
  audioUrl?: string | null;

  @Field({ nullable: true })
  origin?: string | null;

  @Field(() => [String])
  synonyms!: string[];

  @Field(() => [String])
  antonyms!: string[];

  @Field({ nullable: true })
  source?: string | null;
}

@ObjectType()
export class WordDetailsType extends WordCardType {
  @Field({ nullable: true })
  sourcePayloadJson?: string | null;
}

@ObjectType()
export class WordLookupResultType {
  @Field()
  foundInDb!: boolean;

  @Field()
  foundInDictionary!: boolean;

  @Field(() => WordCardType, { nullable: true })
  word?: WordCardType | null;

  @Field(() => WordCardType, { nullable: true })
  preview?: WordCardType | null;
}

@ObjectType()
export class StudentWordCardType {
  @Field(() => ID)
  id!: string;

  @Field(() => WordCardType)
  word!: WordCardType;

  @Field()
  status!: string;

  @Field(() => Int)
  masteryLevel!: number;

  @Field({ nullable: true })
  lessonId?: string | null;

  @Field({ nullable: true })
  firstSeenAt?: string | null;

  @Field({ nullable: true })
  lastReviewedAt?: string | null;

  @Field({ nullable: true })
  nextReviewAt?: string | null;

  @Field({ nullable: true })
  knownAt?: string | null;
}

@ObjectType()
export class QuizCardType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  category!: string;

  @Field()
  difficulty!: string;

  @Field()
  source!: string;

  @Field(() => Int)
  questionCount!: number;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class QuizQuestionType {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field()
  question!: string;

  @Field(() => [String], { nullable: true })
  options?: string[] | null;

  @Field(() => String)
  correct!: string | number;

  @Field()
  explanation!: string;
}

@ObjectType()
export class QuizAttemptSummaryType {
  @Field(() => ID)
  id!: string;

  @Field(() => Float, { nullable: true })
  score?: number | null;

  @Field(() => Int)
  correctCount!: number;

  @Field(() => Int)
  totalCount!: number;

  @Field({ nullable: true })
  finishedAt?: string | null;
}

@ObjectType()
export class StudentQuizCardType extends QuizCardType {
  @Field(() => ID)
  assignmentId!: string;

  @Field(() => QuizAttemptSummaryType, { nullable: true })
  attempt?: QuizAttemptSummaryType | null;
}

@ObjectType()
export class QuizAttemptResultType {
  @Field(() => ID, { nullable: true })
  attemptId?: string | null;

  @Field(() => Float)
  score!: number;

  @Field(() => Int)
  correctCount!: number;

  @Field(() => Int)
  totalCount!: number;

  @Field()
  practiceMode!: boolean;
}

@ObjectType()
export class QuizDetailType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  category!: string;

  @Field()
  difficulty!: string;

  @Field()
  source!: string;

  @Field(() => Int)
  questionCount!: number;

  @Field()
  createdAt!: string;

  @Field(() => [QuizQuestionType])
  questions!: QuizQuestionType[];
}

@ObjectType()
export class LessonMaterialType {
  @Field(() => ID)
  id!: string;

  @Field()
  kind!: string;

  @Field()
  text!: string;

  @Field(() => [String])
  files!: string[];
}

@ObjectType()
export class LessonHomeworkType {
  @Field()
  text!: string;

  @Field(() => [String])
  files!: string[];
}

@ObjectType()
export class StudentResponseType {
  @Field()
  text!: string;

  @Field(() => [String])
  files!: string[];

  @Field()
  status!: string;

  @Field()
  homeworkChecked!: boolean;

  @Field()
  teacherHomeworkFeedback!: string;
}

@ObjectType()
export class ScheduledLessonType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  notes?: string | null;

  @Field({ nullable: true })
  lessonPlan?: string | null;

  @Field()
  date!: string;

  @Field()
  startTime!: string;

  @Field()
  endTime!: string;

  @Field(() => Int)
  duration!: number;

  @Field()
  timezone!: string;

  @Field(() => ID)
  teacherId!: string;

  @Field(() => ID)
  studentId!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  cancelReason?: string | null;

  @Field()
  credited!: boolean;

  @Field()
  recurrence!: string;

  @Field(() => [Int])
  weeklyDays!: number[];

  @Field({ nullable: true })
  seriesId?: string | null;

  @Field(() => Int)
  order!: number;

  @Field({ nullable: true })
  googleMeetUrl?: string | null;

  @Field({ nullable: true })
  googleCalendarEventId?: string | null;

  @Field({ nullable: true })
  meetCreatedAt?: string | null;

  @Field(() => [LessonMaterialType])
  materials!: LessonMaterialType[];

  @Field(() => LessonHomeworkType)
  homework!: LessonHomeworkType;

  @Field(() => StudentResponseType)
  studentResponse!: StudentResponseType;

  @Field(() => [ID])
  linkedWordIds!: string[];
}

@ObjectType()
export class AdminUserSummaryType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field()
  role!: string;

  @Field()
  status!: string;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class AuthUserType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field({ nullable: true })
  avatarUrl?: string | null;

  @Field()
  role!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  proficiencyLevel?: string | null;

  @Field()
  timezone!: string;

  @Field({ nullable: true })
  teacherId?: string | null;

  @Field()
  hasPassword!: boolean;

  @Field(() => [String])
  linkedProviders!: string[];
}

@ObjectType()
export class AssignableTeacherType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field()
  role!: string;
}

@ObjectType()
export class StudentSummaryType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  proficiencyLevel?: string | null;

  @Field()
  timezone!: string;

  @Field({ nullable: true })
  teacherId?: string | null;

  @Field({ nullable: true })
  teacherName?: string | null;

  @Field({ nullable: true })
  avatarUrl?: string | null;

  @Field({ nullable: true })
  nativeLanguageId?: string | null;

  @Field(() => [ID])
  learningLanguageIds!: string[];

  @Field()
  createdAt!: string;
}

@ObjectType()
export class NotificationPrefsType {
  @Field()
  lessonReminder!: boolean;

  @Field()
  streakAlert!: boolean;

  @Field()
  weeklyReport!: boolean;

  @Field()
  newVocab!: boolean;

  @Field()
  teacherMessages!: boolean;
}

@InputType()
export class NotificationPrefsInput {
  @Field({ nullable: true })
  lessonReminder?: boolean;

  @Field({ nullable: true })
  streakAlert?: boolean;

  @Field({ nullable: true })
  weeklyReport?: boolean;

  @Field({ nullable: true })
  newVocab?: boolean;

  @Field({ nullable: true })
  teacherMessages?: boolean;
}

@ObjectType()
export class LinkedAccountType {
  @Field()
  provider!: string;

  @Field()
  linked!: boolean;

  @Field({ nullable: true })
  connectedAs?: string | null;

  @Field({ nullable: true })
  calendarConnected?: boolean;
}

@ObjectType()
export class MyProfileType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field({ nullable: true })
  avatarUrl?: string | null;

  @Field()
  timezone!: string;

  @Field({ nullable: true })
  proficiencyLevel?: string | null;

  @Field()
  role!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  phone?: string | null;

  @Field({ nullable: true })
  telegram?: string | null;

  @Field({ nullable: true })
  bio?: string | null;

  @Field({ nullable: true })
  nativeLanguageId?: string | null;

  @Field(() => NotificationPrefsType)
  notificationPrefs!: NotificationPrefsType;

  @Field(() => [LinkedAccountType])
  linkedAccounts!: LinkedAccountType[];
}

@ObjectType()
export class OkResultType {
  @Field()
  ok!: boolean;
}

@ObjectType()
export class TeacherMessageType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  teacherId!: string;

  @Field(() => ID)
  studentId!: string;

  @Field()
  body!: string;

  @Field()
  createdAt!: string;
}

@InputType()
export class SendTeacherMessageInput {
  @Field(() => ID)
  studentId!: string;

  @Field()
  body!: string;
}

@InputType()
export class CreateStudentWordCardInput {
  @Field()
  text!: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  lessonId?: string;
}

@InputType()
export class UpdateCardStatusInput {
  @Field()
  cardId!: string;

  @Field()
  status!: string;
}

@InputType()
export class GenerateQuizInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  source?: string;

  @Field(() => Int, { nullable: true })
  questionCount?: number;

  @Field({ nullable: true })
  lessonId?: string;

  @Field({ nullable: true })
  studentId?: string;
}

@InputType()
export class QuizAnswerInput {
  @Field(() => ID)
  questionId!: string;

  @Field()
  givenAnswer!: string;
}

@InputType()
export class SubmitQuizAttemptInput {
  @Field(() => ID)
  quizId!: string;

  @Field({ nullable: true })
  studentId?: string;

  @Field({ nullable: true })
  practiceMode?: boolean;

  @Field(() => [QuizAnswerInput])
  answers!: QuizAnswerInput[];
}

@InputType()
export class LessonMaterialInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field()
  kind!: string;

  @Field({ nullable: true })
  text?: string;

  @Field(() => [String], { nullable: true })
  files?: string[];
}

@InputType()
export class LessonHomeworkInput {
  @Field({ nullable: true })
  text?: string;

  @Field(() => [String], { nullable: true })
  files?: string[];
}

@InputType()
export class StudentResponseInput {
  @Field({ nullable: true })
  text?: string;

  @Field(() => [String], { nullable: true })
  files?: string[];

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  homeworkChecked?: boolean;

  @Field({ nullable: true })
  teacherHomeworkFeedback?: string;
}

@InputType()
export class CreateScheduledLessonInput {
  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  date!: string;

  @Field()
  startTime!: string;

  @Field()
  endTime!: string;

  @Field(() => ID)
  studentId!: string;

  @Field(() => ID, { nullable: true })
  teacherId?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  lessonPlan?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  recurrence?: string;

  @Field(() => [Int], { nullable: true })
  weeklyDays?: number[];

  @Field({ nullable: true })
  seriesId?: string;

  @Field(() => [ID], { nullable: true })
  linkedWordIds?: string[];

  @Field(() => [LessonMaterialInput], { nullable: true })
  materials?: LessonMaterialInput[];

  @Field(() => LessonHomeworkInput, { nullable: true })
  homework?: LessonHomeworkInput;

  @Field(() => StudentResponseInput, { nullable: true })
  studentResponse?: StudentResponseInput;
}

@InputType()
export class UpdateScheduledLessonInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  date?: string;

  @Field({ nullable: true })
  startTime?: string;

  @Field({ nullable: true })
  endTime?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  lessonPlan?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  recurrence?: string;

  @Field(() => [Int], { nullable: true })
  weeklyDays?: number[];

  @Field({ nullable: true })
  seriesId?: string;

  @Field(() => [ID], { nullable: true })
  linkedWordIds?: string[];

  @Field({ nullable: true })
  cancelReason?: string;

  @Field({ nullable: true })
  credited?: boolean;

  @Field(() => [LessonMaterialInput], { nullable: true })
  materials?: LessonMaterialInput[];

  @Field(() => LessonHomeworkInput, { nullable: true })
  homework?: LessonHomeworkInput;

  @Field(() => StudentResponseInput, { nullable: true })
  studentResponse?: StudentResponseInput;
}

@InputType()
export class UpdateMyProfileInput {
  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  avatarUrl?: string | null;

  @Field({ nullable: true })
  proficiencyLevel?: string;

  @Field({ nullable: true })
  phone?: string | null;

  @Field({ nullable: true })
  telegram?: string | null;

  @Field({ nullable: true })
  bio?: string | null;

  @Field({ nullable: true })
  nativeLanguageId?: string | null;

  @Field(() => NotificationPrefsInput, { nullable: true })
  notificationPrefs?: NotificationPrefsInput;
}

@ObjectType()
export class StudentLanguagesUpdateType {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  nativeLanguageId?: string | null;

  @Field(() => [ID])
  learningLanguageIds!: string[];

  @Field({ nullable: true })
  teacherId?: string | null;
}

@InputType()
export class UpdateAdminStudentInput {
  @Field({ nullable: true })
  nativeLanguageId?: string | null;

  @Field(() => [ID], { nullable: true })
  learningLanguageIds?: string[];

  @Field({ nullable: true })
  teacherId?: string | null;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  currentPassword!: string;

  @Field()
  newPassword!: string;
}

@ObjectType()
export class CreateAdminUserPayloadType {
  @Field(() => AuthUserType)
  user!: AuthUserType;

  @Field()
  welcomeEmailSent!: boolean;
}

@ObjectType()
export class SystemMailStatusType {
  @Field()
  configured!: boolean;

  @Field({ nullable: true })
  smtpHost?: string | null;

  @Field(() => Int, { nullable: true })
  smtpPort?: number | null;

  @Field()
  mailFrom!: string;

  @Field()
  templatesDir!: string;
}

@ObjectType()
export class SendTestEmailResultType {
  @Field()
  sent!: boolean;

  @Field({ nullable: true })
  message?: string | null;
}

@InputType()
export class SendTestWelcomeEmailInput {
  @Field()
  to!: string;
}

@ObjectType()
export class WordDictionaryProviderInfoType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  docsUrl!: string;
}

@ObjectType()
export class WordDictionarySettingsType {
  @Field()
  activeProvider!: string;

  @Field(() => [WordDictionaryProviderInfoType])
  providers!: WordDictionaryProviderInfoType[];
}

@InputType()
export class UpdateWordDictionaryProviderInput {
  @Field()
  provider!: string;
}

@InputType()
export class CreateAdminUserInput {
  @Field()
  email!: string;

  @Field({ nullable: true })
  displayName?: string | null;

  @Field({ defaultValue: 'student' })
  role!: string;

  @Field({ nullable: true })
  phone?: string | null;

  @Field({ nullable: true })
  telegram?: string | null;

  @Field({ nullable: true })
  bio?: string | null;

  @Field({ nullable: true })
  nativeLanguageId?: string | null;

  @Field(() => [ID], { nullable: true })
  learningLanguageIds?: string[];

  @Field({ nullable: true })
  timezone?: string | null;

  @Field({ nullable: true })
  proficiencyLevel?: string | null;

  @Field({ nullable: true })
  status?: string | null;

  @Field({ nullable: true })
  teacherId?: string | null;
}

@ObjectType()
export class ChatUserType {
  @Field(() => ID)
  id!: string;

  @Field()
  displayName!: string;

  @Field()
  displayRole!: string;

  @Field()
  roleLabel!: string;

  @Field({ nullable: true })
  avatarUrl?: string | null;

  @Field()
  initials!: string;
}

@ObjectType()
export class ChatConversationType {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field(() => ChatUserType, { nullable: true })
  peer?: ChatUserType | null;

  @Field(() => [ChatUserType], { nullable: true })
  participants?: ChatUserType[];

  @Field({ nullable: true })
  lastMessage?: string | null;

  @Field()
  lastMessageAt!: string;

  @Field(() => Int)
  unreadCount!: number;

  @Field()
  updatedAt!: string;
}

@ObjectType()
export class ChatAttachmentType {
  @Field(() => ID)
  id!: string;

  @Field()
  fileName!: string;

  @Field()
  mimeType!: string;

  @Field(() => Int)
  sizeBytes!: number;

  @Field()
  url!: string;

  @Field()
  expiresAt!: string;

  @Field()
  expired!: boolean;
}

@ObjectType()
export class ChatMessageType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  conversationId!: string;

  @Field(() => ID)
  senderId!: string;

  @Field(() => ChatUserType)
  sender!: ChatUserType;

  @Field()
  body!: string;

  @Field()
  createdAt!: string;

  @Field()
  isMine!: boolean;

  @Field(() => ChatAttachmentType, { nullable: true })
  attachment?: ChatAttachmentType | null;
}

@InputType()
export class CreateGroupConversationInput {
  @Field()
  title!: string;

  @Field(() => [ID])
  memberIds!: string[];
}
