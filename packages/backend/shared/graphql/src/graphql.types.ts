import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@ObjectType()
export class DailyGoalType {
  @Field(() => ID)
  id!: string;

  @Field()
  templateId!: string;

  @Field()
  kind!: string;

  @Field()
  text!: string;

  @Field(() => Int)
  difficulty!: number;

  @Field()
  done!: boolean;

  @Field(() => Int)
  progressCurrent!: number;

  @Field(() => Int)
  progressTarget!: number;

  @Field()
  progressLabel!: string;

  @Field()
  actionPath!: string;

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
export class AchievementStatsType {
  @Field(() => Int)
  wordsLearned!: number;

  @Field(() => Int)
  lessonsCompleted!: number;

  @Field(() => Int)
  streakDays!: number;

  @Field(() => Int)
  quizzesCompleted!: number;

  @Field(() => Int)
  perfectQuizCount!: number;

  @Field(() => Int)
  speakingSessions!: number;

  @Field(() => Int)
  speakingSubmissions!: number;

  @Field(() => Int)
  speakingReviewsReceived!: number;

  @Field(() => Int)
  speakingMinutesTotal!: number;

  @Field(() => Int)
  gamesSessions!: number;

  @Field(() => Int)
  practiceMinutesTotal!: number;

  @Field(() => Int)
  lessonMinutesTotal!: number;

  @Field(() => Int)
  weeklyGoalsCompleted!: number;

  @Field(() => [String])
  unlockedAchievementIds!: string[];
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

  @Field(() => QuizAttemptSummaryType, { nullable: true })
  attempt?: QuizAttemptSummaryType | null;
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
export class StudentQuizCardType extends QuizCardType {
  @Field(() => ID)
  assignmentId!: string;
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
export class LessonFileLinkType {
  @Field()
  ref!: string;

  @Field()
  fileName!: string;

  @Field({ nullable: true })
  downloadPath?: string | null;
}

@ObjectType()
export class LibraryMaterialAssetType {
  @Field(() => ID)
  id!: string;

  @Field()
  role!: string;

  @Field()
  deliveryKind!: string;

  @Field(() => String, { nullable: true })
  url?: string | null;

  @Field(() => String, { nullable: true })
  label?: string | null;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => ID, { nullable: true })
  fileAttachmentId?: string | null;

  @Field(() => String, { nullable: true })
  fileName?: string | null;

  @Field(() => String, { nullable: true })
  downloadPath?: string | null;

  @Field(() => String, { nullable: true })
  previewDownloadPath?: string | null;
}

@ObjectType()
export class LibraryMaterialType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  kind!: string;

  @Field(() => [String])
  tags!: string[];

  @Field(() => String, { nullable: true })
  level?: string | null;

  @Field(() => String, { nullable: true })
  publisher?: string | null;

  @Field(() => ID, { nullable: true })
  schoolId?: string | null;

  @Field(() => ID)
  createdById!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;

  @Field(() => ID, { nullable: true })
  coverAttachmentId?: string | null;

  @Field(() => String, { nullable: true })
  coverDownloadPath?: string | null;

  @Field(() => [LibraryMaterialAssetType])
  assets!: LibraryMaterialAssetType[];
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

  @Field(() => [LessonFileLinkType])
  fileLinks!: LessonFileLinkType[];

  @Field(() => ID, { nullable: true })
  libraryMaterialId?: string | null;

  @Field(() => [ID], { nullable: true })
  sharedLibraryAssetIds?: string[] | null;

  @Field({ nullable: true })
  libraryMediaSelectionApplied?: boolean | null;

  @Field(() => LibraryMaterialType, { nullable: true })
  libraryMaterial?: LibraryMaterialType | null;
}

@ObjectType()
export class LessonHomeworkType {
  @Field()
  text!: string;

  @Field(() => [String])
  files!: string[];

  @Field(() => [LessonFileLinkType])
  fileLinks!: LessonFileLinkType[];
}

@ObjectType()
export class StudentResponseType {
  @Field()
  text!: string;

  @Field(() => [String])
  files!: string[];

  @Field(() => [LessonFileLinkType])
  fileLinks!: LessonFileLinkType[];

  @Field()
  status!: string;

  @Field()
  homeworkChecked!: boolean;

  @Field()
  teacherHomeworkFeedback!: string;
}

@ObjectType()
export class ScheduledLessonParticipantType {
  @Field(() => ID)
  userId!: string;

  @Field()
  displayName!: string;

  @Field()
  role!: string;

  @Field(() => Int)
  sortOrder!: number;
}

@ObjectType()
export class GroupLessonBillingType {
  @Field()
  mode!: string;

  @Field(() => Int, { nullable: true })
  priceMinor?: number | null;

  @Field({ nullable: true })
  currency?: string | null;

  @Field({ nullable: true })
  splitMode?: string | null;

  @Field(() => ID, { nullable: true })
  payerUserId?: string | null;
}

@InputType()
export class GroupLessonBillingInput {
  @Field()
  mode!: string;

  @Field(() => Int, { nullable: true })
  priceMinor?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  splitMode?: string;

  @Field(() => ID, { nullable: true })
  payerUserId?: string;
}

@ObjectType()
export class StudentGroupMemberType {
  @Field(() => ID)
  userId!: string;

  @Field()
  displayName!: string;

  @Field(() => Int)
  sortOrder!: number;
}

@ObjectType()
export class StudentGroupType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => ID, { nullable: true })
  teacherId?: string | null;

  @Field({ nullable: true })
  teacherName?: string | null;

  @Field()
  groupBillingMode!: string;

  @Field(() => Int, { nullable: true })
  groupPriceMinor?: number | null;

  @Field({ nullable: true })
  groupCurrency?: string | null;

  @Field({ nullable: true })
  groupSplitMode?: string | null;

  @Field(() => ID, { nullable: true })
  groupPayerUserId?: string | null;

  @Field(() => [StudentGroupMemberType])
  members!: StudentGroupMemberType[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}

@InputType()
export class CreateStudentGroupInput {
  @Field()
  name!: string;

  @Field(() => ID, { nullable: true })
  teacherId?: string | null;

  @Field(() => [ID])
  memberUserIds!: string[];

  @Field()
  groupBillingMode!: string;

  @Field(() => Int, { nullable: true })
  groupPriceMinor?: number;

  @Field({ nullable: true })
  groupCurrency?: string;

  @Field({ nullable: true })
  groupSplitMode?: string;

  @Field(() => ID, { nullable: true })
  groupPayerUserId?: string | null;
}

@InputType()
export class UpdateStudentGroupInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  teacherId?: string | null;

  @Field(() => [ID], { nullable: true })
  memberUserIds?: string[];

  @Field({ nullable: true })
  groupBillingMode?: string;

  @Field(() => Int, { nullable: true })
  groupPriceMinor?: number;

  @Field({ nullable: true })
  groupCurrency?: string;

  @Field({ nullable: true })
  groupSplitMode?: string;

  @Field(() => ID, { nullable: true })
  groupPayerUserId?: string | null;
}

@InputType()
export class SchoolGroupLessonsSettingsInput {
  @Field()
  enabled!: boolean;

  @Field()
  defaultBillingMode!: string;

  @Field(() => Int)
  defaultPriceMinor!: number;

  @Field()
  defaultCurrency!: string;

  @Field()
  defaultSplitMode!: string;
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

  @Field()
  teacherName!: string;

  @Field(() => ID)
  studentId!: string;

  @Field()
  studentName!: string;

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
  videoProvider?: string | null;

  @Field({ nullable: true })
  videoMeetingUrl?: string | null;

  @Field({ nullable: true })
  videoMeetingExternalId?: string | null;

  @Field({ nullable: true })
  videoMeetingStartedAt?: string | null;

  @Field({ nullable: true })
  videoMeetingEndedAt?: string | null;

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

  @Field({ nullable: true })
  kind?: string;

  @Field(() => [ScheduledLessonParticipantType], { nullable: true })
  participants?: ScheduledLessonParticipantType[];

  @Field(() => GroupLessonBillingType, { nullable: true })
  groupBilling?: GroupLessonBillingType | null;
}

@ObjectType()
export class ScheduledLessonsPageType {
  @Field(() => [ScheduledLessonType])
  items!: ScheduledLessonType[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string | null;
}

@ObjectType()
export class StudentVocabularyPageType {
  @Field(() => [StudentWordCardType])
  items!: StudentWordCardType[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string | null;
}

@ObjectType()
export class QuizzesPageType {
  @Field(() => [QuizCardType])
  items!: QuizCardType[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string | null;
}

@ObjectType()
export class StudentQuizzesPageType {
  @Field(() => [StudentQuizCardType])
  items!: StudentQuizCardType[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string | null;
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

  @Field()
  timezone!: string;
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
  scheduleType!: boolean;

  @Field()
  lessonFormat!: string;

  @Field({ nullable: true })
  displayColor?: string | null;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class StudentsPageType {
  @Field(() => [StudentSummaryType])
  items!: StudentSummaryType[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string | null;
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

  @Field(() => Boolean, { nullable: true })
  includeIrregularVerbDrills?: boolean;

  @Field(() => Boolean, { nullable: true })
  mistakesOnly?: boolean;
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

  @Field(() => ID, { nullable: true })
  libraryMaterialId?: string | null;

  @Field(() => [ID], { nullable: true })
  sharedLibraryAssetIds?: string[];

  @Field({ nullable: true })
  libraryMediaSelectionApplied?: boolean;
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

  @Field({ nullable: true })
  createMeetLink?: boolean;

  @Field({ nullable: true })
  kind?: string;

  @Field(() => [ID], { nullable: true })
  participantIds?: string[];

  @Field(() => GroupLessonBillingInput, { nullable: true })
  groupBilling?: GroupLessonBillingInput;

  @Field(() => ID, { nullable: true })
  studentGroupId?: string;
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

  @Field({ nullable: true })
  kind?: string;

  @Field(() => [ID], { nullable: true })
  participantIds?: string[];

  @Field(() => GroupLessonBillingInput, { nullable: true })
  groupBilling?: GroupLessonBillingInput;
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

  @Field({ nullable: true })
  displayColor?: string | null;
}

@InputType()
export class UpdateAdminStudentInput {
  @Field({ nullable: true })
  nativeLanguageId?: string | null;

  @Field(() => [ID], { nullable: true })
  learningLanguageIds?: string[];

  @Field({ nullable: true })
  teacherId?: string | null;

  @Field({ nullable: true })
  scheduleType?: boolean;

  @Field({ nullable: true })
  lessonFormat?: string;

  @Field({ nullable: true })
  displayColor?: string | null;
}

@InputType()
export class UpdateStaffUserProfileInput {
  @Field(() => ID)
  userId!: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  phone?: string | null;

  @Field({ nullable: true })
  telegram?: string | null;

  @Field({ nullable: true })
  bio?: string | null;

  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class ChangePasswordInput {
  // class-validator decorators are required: the global ValidationPipe runs with
  // `whitelist: true`, which strips any GraphQL input property that has no
  // validation decorator — without these the fields never reach the resolver.
  @Field()
  @IsString()
  currentPassword!: string;

  @Field()
  @IsString()
  @MinLength(8)
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

  @Field({ nullable: true })
  smtpMode?: string | null;
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
export class TranslationProviderInfoType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  docsUrl!: string;

  @Field()
  requiresServiceSubscription!: boolean;
}

@ObjectType()
export class TranslationApiUrlsType {
  @Field()
  deeplApiUrl!: string;

  @Field()
  googleTranslateApiUrl!: string;

  @Field()
  microsoftTranslatorApiUrl!: string;

  @Field()
  myMemoryUrl!: string;

  @Field()
  reversoApiUrl!: string;

  @Field({ nullable: true })
  libreTranslateUrl?: string | null;
}

@ObjectType()
export class TranslationSettingsType {
  @Field()
  activeProvider!: string;

  @Field(() => [TranslationProviderInfoType])
  providers!: TranslationProviderInfoType[];

  @Field(() => TranslationApiUrlsType)
  apiUrls!: TranslationApiUrlsType;
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

@ObjectType()
export class IntegrationSecretFieldStatusType {
  @Field()
  configured!: boolean;

  @Field()
  source!: string;
}

@ObjectType()
export class IntegrationSecretStatusesType {
  @Field(() => IntegrationSecretFieldStatusType)
  smtpPass!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  libreTranslateApiKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  reversoApiKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  deeplAuthKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  googleTranslateApiKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  azureTranslatorKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  openaiWhisperApiKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  llmApiKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  anthropicApiKey!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  telegramBotToken!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  googleClientSecret!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  facebookAppSecret!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  zoomClientSecret!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  zoomWebhookSecret!: IntegrationSecretFieldStatusType;

  @Field(() => IntegrationSecretFieldStatusType)
  livekitApiSecret!: IntegrationSecretFieldStatusType;
}

@ObjectType()
export class PlatformTranslationConfigType {
  @Field()
  activeProvider!: string;

  @Field({ nullable: true })
  apiEmail?: string | null;

  @Field()
  reversoContextResults!: boolean;

  @Field()
  reversoContextTargetLang!: string;
}

@ObjectType()
export class PlatformSmtpConfigType {
  @Field()
  mode!: string;

  @Field({ nullable: true })
  host?: string | null;

  @Field(() => Int, { nullable: true })
  port?: number | null;

  @Field({ nullable: true })
  user?: string | null;

  @Field()
  mailFrom!: string;

  @Field()
  secure!: boolean;
}

@ObjectType()
export class PlatformTelegramConfigType {
  @Field({ nullable: true })
  botUsername?: string | null;

  @Field()
  devPolling!: boolean;
}

@ObjectType()
export class PlatformGoogleConfigType {
  @Field({ nullable: true })
  clientId?: string | null;

  @Field()
  callbackUrl!: string;

  @Field()
  successRedirect!: string;

  @Field({ nullable: true })
  linkSuccessRedirect?: string | null;

  @Field({ nullable: true })
  failureRedirect?: string | null;
}

@ObjectType()
export class PlatformFacebookConfigType {
  @Field({ nullable: true })
  appId?: string | null;

  @Field()
  callbackUrl!: string;
}

@ObjectType()
export class PlatformLiveKitConfigType {
  @Field()
  wsUrl!: string;

  @Field({ nullable: true })
  apiKey?: string | null;
}

@ObjectType()
export class PlatformZoomConfigType {
  @Field({ nullable: true })
  clientId?: string | null;

  @Field()
  callbackUrl!: string;

  @Field()
  useServerToServer!: boolean;
}

@ObjectType()
export class PlatformVideoMeetingConfigType {
  @Field()
  provider!: string;

  @Field(() => PlatformLiveKitConfigType)
  livekit!: PlatformLiveKitConfigType;

  @Field(() => PlatformZoomConfigType)
  zoom!: PlatformZoomConfigType;
}

@ObjectType()
export class PlatformMediaCaptionsConfigType {
  @Field()
  enabled!: boolean;

  @Field()
  sttProvider!: string;

  @Field({ nullable: true })
  sourceLanguage?: string | null;

  @Field(() => [String])
  targetLanguages!: string[];
}

@ObjectType()
export class PlatformLlmConfigType {
  @Field()
  enabled!: boolean;

  @Field()
  provider!: string;

  @Field({ nullable: true })
  baseUrl?: string | null;

  @Field({ nullable: true })
  model?: string | null;

  @Field(() => Int)
  maxTokens!: number;

  @Field()
  temperature!: number;
}

@ObjectType()
export class PlatformIntegrationConfigType {
  @Field(() => PlatformTranslationConfigType)
  translation!: PlatformTranslationConfigType;

  @Field(() => PlatformMediaCaptionsConfigType)
  mediaCaptions!: PlatformMediaCaptionsConfigType;

  @Field(() => PlatformLlmConfigType)
  llm!: PlatformLlmConfigType;

  @Field(() => PlatformSmtpConfigType)
  smtp!: PlatformSmtpConfigType;

  @Field(() => PlatformTelegramConfigType)
  telegram!: PlatformTelegramConfigType;

  @Field(() => PlatformGoogleConfigType)
  google!: PlatformGoogleConfigType;

  @Field(() => PlatformFacebookConfigType)
  facebook!: PlatformFacebookConfigType;

  @Field(() => PlatformVideoMeetingConfigType)
  videoMeeting!: PlatformVideoMeetingConfigType;
}

@ObjectType()
export class PlatformIntegrationSecretsType {
  @Field({ nullable: true })
  smtpPass?: string | null;

  @Field({ nullable: true })
  libreTranslateApiKey?: string | null;

  @Field({ nullable: true })
  reversoApiKey?: string | null;

  @Field({ nullable: true })
  deeplAuthKey?: string | null;

  @Field({ nullable: true })
  googleTranslateApiKey?: string | null;

  @Field({ nullable: true })
  azureTranslatorKey?: string | null;

  @Field({ nullable: true })
  openaiWhisperApiKey?: string | null;

  @Field({ nullable: true })
  llmApiKey?: string | null;

  @Field({ nullable: true })
  anthropicApiKey?: string | null;

  @Field({ nullable: true })
  telegramBotToken?: string | null;

  @Field({ nullable: true })
  googleClientSecret?: string | null;

  @Field({ nullable: true })
  facebookAppSecret?: string | null;

  @Field({ nullable: true })
  zoomClientSecret?: string | null;

  @Field({ nullable: true })
  zoomWebhookSecret?: string | null;

  @Field({ nullable: true })
  livekitApiSecret?: string | null;
}

@ObjectType()
export class PlatformIntegrationSettingsType {
  @Field(() => PlatformIntegrationConfigType)
  config!: PlatformIntegrationConfigType;

  @Field(() => PlatformIntegrationSecretsType)
  secrets!: PlatformIntegrationSecretsType;

  @Field(() => IntegrationSecretStatusesType)
  secretStatuses!: IntegrationSecretStatusesType;

  @Field()
  secretsStorageAvailable!: boolean;
}

@InputType()
export class PlatformTranslationConfigInput {
  @Field({ nullable: true })
  activeProvider?: string;

  @Field({ nullable: true })
  apiEmail?: string | null;

  @Field({ nullable: true })
  reversoContextResults?: boolean;

  @Field({ nullable: true })
  reversoContextTargetLang?: string;
}

@InputType()
export class PlatformSmtpConfigInput {
  @Field({ nullable: true })
  mode?: string;

  @Field({ nullable: true })
  host?: string | null;

  @Field(() => Int, { nullable: true })
  port?: number | null;

  @Field({ nullable: true })
  user?: string | null;

  @Field({ nullable: true })
  mailFrom?: string;

  @Field({ nullable: true })
  secure?: boolean;
}

@InputType()
export class PlatformTelegramConfigInput {
  @Field({ nullable: true })
  botUsername?: string | null;

  @Field({ nullable: true })
  devPolling?: boolean;
}

@InputType()
export class PlatformGoogleConfigInput {
  @Field({ nullable: true })
  clientId?: string | null;

  @Field({ nullable: true })
  callbackUrl?: string;

  @Field({ nullable: true })
  successRedirect?: string;

  @Field({ nullable: true })
  linkSuccessRedirect?: string | null;

  @Field({ nullable: true })
  failureRedirect?: string | null;
}

@InputType()
export class PlatformFacebookConfigInput {
  @Field({ nullable: true })
  appId?: string | null;

  @Field({ nullable: true })
  callbackUrl?: string;
}

@InputType()
export class PlatformLiveKitConfigInput {
  @Field({ nullable: true })
  wsUrl?: string;

  @Field({ nullable: true })
  apiKey?: string | null;
}

@InputType()
export class PlatformZoomConfigInput {
  @Field({ nullable: true })
  clientId?: string | null;

  @Field({ nullable: true })
  callbackUrl?: string;

  @Field({ nullable: true })
  useServerToServer?: boolean;
}

@InputType()
export class PlatformVideoMeetingConfigInput {
  @Field({ nullable: true })
  provider?: string;

  @Field(() => PlatformLiveKitConfigInput, { nullable: true })
  livekit?: PlatformLiveKitConfigInput;

  @Field(() => PlatformZoomConfigInput, { nullable: true })
  zoom?: PlatformZoomConfigInput;
}

@InputType()
export class PlatformMediaCaptionsConfigInput {
  @Field({ nullable: true })
  enabled?: boolean;

  @Field({ nullable: true })
  sttProvider?: string;

  @Field({ nullable: true })
  sourceLanguage?: string | null;

  @Field(() => [String], { nullable: true })
  targetLanguages?: string[];
}

@InputType()
export class PlatformLlmConfigInput {
  @Field({ nullable: true })
  enabled?: boolean;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  baseUrl?: string | null;

  @Field({ nullable: true })
  model?: string | null;

  @Field(() => Int, { nullable: true })
  maxTokens?: number;

  @Field({ nullable: true })
  temperature?: number;
}

@InputType()
export class PlatformIntegrationConfigInput {
  @Field(() => PlatformTranslationConfigInput, { nullable: true })
  translation?: PlatformTranslationConfigInput;

  @Field(() => PlatformMediaCaptionsConfigInput, { nullable: true })
  mediaCaptions?: PlatformMediaCaptionsConfigInput;

  @Field(() => PlatformLlmConfigInput, { nullable: true })
  llm?: PlatformLlmConfigInput;

  @Field(() => PlatformSmtpConfigInput, { nullable: true })
  smtp?: PlatformSmtpConfigInput;

  @Field(() => PlatformTelegramConfigInput, { nullable: true })
  telegram?: PlatformTelegramConfigInput;

  @Field(() => PlatformGoogleConfigInput, { nullable: true })
  google?: PlatformGoogleConfigInput;

  @Field(() => PlatformFacebookConfigInput, { nullable: true })
  facebook?: PlatformFacebookConfigInput;

  @Field(() => PlatformVideoMeetingConfigInput, { nullable: true })
  videoMeeting?: PlatformVideoMeetingConfigInput;
}

@InputType()
export class PlatformIntegrationSecretsInput {
  @Field({ nullable: true })
  smtpPass?: string | null;

  @Field({ nullable: true })
  libreTranslateApiKey?: string | null;

  @Field({ nullable: true })
  reversoApiKey?: string | null;

  @Field({ nullable: true })
  deeplAuthKey?: string | null;

  @Field({ nullable: true })
  googleTranslateApiKey?: string | null;

  @Field({ nullable: true })
  azureTranslatorKey?: string | null;

  @Field({ nullable: true })
  openaiWhisperApiKey?: string | null;

  @Field({ nullable: true })
  llmApiKey?: string | null;

  @Field({ nullable: true })
  anthropicApiKey?: string | null;

  @Field({ nullable: true })
  telegramBotToken?: string | null;

  @Field({ nullable: true })
  googleClientSecret?: string | null;

  @Field({ nullable: true })
  facebookAppSecret?: string | null;

  @Field({ nullable: true })
  zoomClientSecret?: string | null;

  @Field({ nullable: true })
  zoomWebhookSecret?: string | null;

  @Field({ nullable: true })
  livekitApiSecret?: string | null;
}

@InputType()
export class UpdatePlatformIntegrationSettingsInput {
  @Field(() => PlatformIntegrationConfigInput, { nullable: true })
  config?: PlatformIntegrationConfigInput;

  @Field(() => PlatformIntegrationSecretsInput, { nullable: true })
  secrets?: PlatformIntegrationSecretsInput;
}

@ObjectType()
export class VerifyPlatformConnectionResultType {
  @Field()
  ok!: boolean;

  @Field()
  message!: string;
}

@InputType()
export class VerifySmtpConnectionInput {
  @Field(() => PlatformIntegrationConfigInput, { nullable: true })
  config?: PlatformIntegrationConfigInput;

  @Field(() => PlatformIntegrationSecretsInput, { nullable: true })
  secrets?: PlatformIntegrationSecretsInput;
}

@InputType()
export class VerifyPlatformConnectionInput {
  /** `google` | `facebook` | `telegram` */
  @Field()
  provider!: string;

  @Field(() => PlatformIntegrationConfigInput, { nullable: true })
  config?: PlatformIntegrationConfigInput;

  @Field(() => PlatformIntegrationSecretsInput, { nullable: true })
  secrets?: PlatformIntegrationSecretsInput;
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
export class ChatInboxPageType {
  @Field(() => [ChatConversationType])
  items!: ChatConversationType[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string | null;
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

@ObjectType()
export class LessonPackageType {
  @Field()
  id!: string;

  @Field(() => Int)
  lessons!: number;

  @Field()
  label!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  currency?: string | null;

  @Field({ nullable: true })
  creditTrack?: string | null;
}

@ObjectType()
export class ResolvedLessonPackageType {
  @Field()
  id!: string;

  @Field(() => Int)
  lessons!: number;

  @Field()
  label!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
  currency!: string;

  @Field(() => Int)
  amountMinor!: number;

  @Field(() => Int)
  pricePerLessonMinor!: number;

  @Field()
  isCustomPrice!: boolean;

  @Field()
  creditTrack!: string;

  @Field()
  lessonsLocked!: boolean;
}

@ObjectType()
export class StudentPackageOverrideType {
  @Field()
  packageId!: string;

  @Field(() => Int, { nullable: true })
  lessons?: number | null;

  @Field()
  lessonsLocked!: boolean;

  @Field()
  enabled!: boolean;
}

@ObjectType()
export class PaymentMethodStatusType {
  @Field()
  id!: string;

  @Field()
  enabled!: boolean;

  @Field()
  configured!: boolean;

  @Field()
  configuredLabel!: string;

  @Field({ nullable: true })
  mode?: string | null;
}

@ObjectType()
export class ManualInvoiceMethodType {
  @Field()
  id!: string;

  @Field()
  kind!: string;

  @Field()
  label!: string;

  @Field()
  description!: string;

  @Field()
  receiptHintUk!: string;

  @Field()
  paymentReferenceHint!: string;

  @Field({ nullable: true })
  recipientTaxId?: string | null;

  @Field({ nullable: true })
  paymentPurpose?: string | null;

  @Field(() => [String], { nullable: true })
  importantNotes?: string[] | null;

  @Field({ nullable: true })
  beneficiaryName?: string | null;

  @Field({ nullable: true })
  iban?: string | null;

  @Field({ nullable: true })
  bankName?: string | null;

  @Field({ nullable: true })
  bankCountry?: string | null;

  @Field({ nullable: true })
  bic?: string | null;

  @Field({ nullable: true })
  accountNumber?: string | null;

  @Field({ nullable: true })
  bankAddress?: string | null;

  @Field({ nullable: true })
  swiftBic?: string | null;

  @Field({ nullable: true })
  beneficiaryAddress?: string | null;

  @Field({ nullable: true })
  intermediaryBankName?: string | null;

  @Field({ nullable: true })
  intermediarySwiftBic?: string | null;

  @Field({ nullable: true })
  cardNumber?: string | null;

  @Field({ nullable: true })
  instructionsUk?: string | null;
}

@ObjectType()
export class StudentManualInvoiceSelectionType {
  @Field(() => [String])
  allowedMethodIds!: string[];

  @Field({ nullable: true })
  defaultMethodId?: string | null;
}

@ObjectType()
export class StudentPaymentMethodSelectionType {
  @Field(() => [String])
  allowedMethods!: string[];

  @Field({ nullable: true, defaultValue: false })
  restrictToAllowlistOnly?: boolean;
}

@ObjectType()
export class PaymentSecretFieldStatusType {
  @Field()
  configured!: boolean;

  @Field()
  source!: string;
}

@ObjectType()
export class StripeSecretsStatusType {
  @Field(() => PaymentSecretFieldStatusType)
  liveSecretKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  liveWebhookSecret!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testSecretKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testWebhookSecret!: PaymentSecretFieldStatusType;
}

@ObjectType()
export class LiqPaySecretsStatusType {
  @Field(() => PaymentSecretFieldStatusType)
  livePrivateKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testPrivateKey!: PaymentSecretFieldStatusType;
}

@ObjectType()
export class WayForPaySecretsStatusType {
  @Field(() => PaymentSecretFieldStatusType)
  liveSecretKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testSecretKey!: PaymentSecretFieldStatusType;
}

@ObjectType()
export class LemonSqueezySecretsStatusType {
  @Field(() => PaymentSecretFieldStatusType)
  liveApiKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  liveWebhookSecret!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testApiKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testWebhookSecret!: PaymentSecretFieldStatusType;
}

@ObjectType()
export class PaddleSecretsStatusType {
  @Field(() => PaymentSecretFieldStatusType)
  liveApiKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  liveWebhookSecret!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testApiKey!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testWebhookSecret!: PaymentSecretFieldStatusType;
}

@ObjectType()
export class MonoPaySecretsStatusType {
  @Field(() => PaymentSecretFieldStatusType)
  liveToken!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testToken!: PaymentSecretFieldStatusType;
}

@ObjectType()
export class PayPalSecretsStatusType {
  @Field(() => PaymentSecretFieldStatusType)
  liveClientSecret!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  liveWebhookId!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testClientSecret!: PaymentSecretFieldStatusType;

  @Field(() => PaymentSecretFieldStatusType)
  testWebhookId!: PaymentSecretFieldStatusType;
}

@ObjectType()
export class PaymentSecretsStatusType {
  @Field(() => StripeSecretsStatusType)
  stripe!: StripeSecretsStatusType;

  @Field(() => LiqPaySecretsStatusType)
  liqpay!: LiqPaySecretsStatusType;

  @Field(() => WayForPaySecretsStatusType)
  wayforpay!: WayForPaySecretsStatusType;

  @Field(() => LemonSqueezySecretsStatusType)
  lemonsqueezy!: LemonSqueezySecretsStatusType;

  @Field(() => PaddleSecretsStatusType)
  paddle!: PaddleSecretsStatusType;

  @Field(() => MonoPaySecretsStatusType)
  monopay!: MonoPaySecretsStatusType;

  @Field(() => PayPalSecretsStatusType)
  paypal!: PayPalSecretsStatusType;
}

@ObjectType()
export class LessonPriceByCurrencyType {
  @Field()
  currency!: string;

  @Field(() => Int)
  pricePerLessonMinor!: number;
}

@ObjectType()
export class SchoolGroupLessonsSettingsType {
  @Field()
  enabled!: boolean;

  @Field()
  defaultBillingMode!: string;

  @Field(() => Int)
  defaultPriceMinor!: number;

  @Field()
  defaultCurrency!: string;

  @Field()
  defaultSplitMode!: string;
}

@ObjectType()
export class PaymentConfigType {
  @Field(() => [LessonPackageType])
  packages!: LessonPackageType[];

  @Field(() => Int)
  defaultPricePerLessonMinor!: number;

  @Field(() => [LessonPriceByCurrencyType])
  pricePerLessonByCurrency!: LessonPriceByCurrencyType[];

  @Field()
  defaultCurrency!: string;

  @Field(() => [String])
  allowedCurrencies!: string[];

  @Field(() => Int)
  minPackageLessons!: number;

  @Field(() => [ManualInvoiceMethodType])
  manualInvoiceMethods!: ManualInvoiceMethodType[];

  @Field({ nullable: true })
  stripeMode?: string | null;

  @Field({ nullable: true })
  stripeLivePublishableKey?: string | null;

  @Field({ nullable: true })
  stripeTestPublishableKey?: string | null;

  @Field({ nullable: true })
  liqpayMode?: string | null;

  @Field({ nullable: true })
  liqpayLivePublicKey?: string | null;

  @Field({ nullable: true })
  liqpayTestPublicKey?: string | null;

  @Field({ nullable: true })
  wayforpayMode?: string | null;

  @Field({ nullable: true })
  wayforpayLiveMerchantAccount?: string | null;

  @Field({ nullable: true })
  wayforpayLiveMerchantDomainName?: string | null;

  @Field({ nullable: true })
  wayforpayTestMerchantAccount?: string | null;

  @Field({ nullable: true })
  wayforpayTestMerchantDomainName?: string | null;

  @Field({ nullable: true })
  lemonsqueezyMode?: string | null;

  @Field({ nullable: true })
  lemonsqueezyLiveStoreId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyLiveVariantId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyTestStoreId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyTestVariantId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyLiveVariantCurrency?: string | null;

  @Field({ nullable: true })
  lemonsqueezyTestVariantCurrency?: string | null;

  @Field({ nullable: true })
  paddleMode?: string | null;

  @Field({ nullable: true })
  monopayMode?: string | null;

  @Field({ nullable: true })
  paypalMode?: string | null;

  @Field({ nullable: true })
  paypalLiveClientId?: string | null;

  @Field({ nullable: true })
  paypalTestClientId?: string | null;

  @Field(() => SchoolGroupLessonsSettingsType, { nullable: true })
  groupLessons?: SchoolGroupLessonsSettingsType | null;
}

@ObjectType()
export class PaymentSettingsType {
  @Field(() => [String])
  enabledMethods!: string[];

  @Field(() => PaymentConfigType)
  config!: PaymentConfigType;

  @Field(() => [PaymentMethodStatusType])
  methods!: PaymentMethodStatusType[];

  @Field(() => PaymentSecretsStatusType)
  secretStatuses!: PaymentSecretsStatusType;
}

@InputType()
export class LessonPackageInput {
  @Field()
  id!: string;

  @Field(() => Int)
  lessons!: number;

  @Field()
  label!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  currency?: string | null;
}

@InputType()
export class ManualInvoiceMethodInput {
  @Field()
  id!: string;

  @Field()
  kind!: string;

  @Field()
  label!: string;

  @Field()
  description!: string;

  @Field()
  receiptHintUk!: string;

  @Field()
  paymentReferenceHint!: string;

  @Field({ nullable: true })
  recipientTaxId?: string | null;

  @Field({ nullable: true })
  paymentPurpose?: string | null;

  @Field(() => [String], { nullable: true })
  importantNotes?: string[] | null;

  @Field({ nullable: true })
  beneficiaryName?: string | null;

  @Field({ nullable: true })
  iban?: string | null;

  @Field({ nullable: true })
  bankName?: string | null;

  @Field({ nullable: true })
  bankCountry?: string | null;

  @Field({ nullable: true })
  bic?: string | null;

  @Field({ nullable: true })
  accountNumber?: string | null;

  @Field({ nullable: true })
  bankAddress?: string | null;

  @Field({ nullable: true })
  swiftBic?: string | null;

  @Field({ nullable: true })
  beneficiaryAddress?: string | null;

  @Field({ nullable: true })
  intermediaryBankName?: string | null;

  @Field({ nullable: true })
  intermediarySwiftBic?: string | null;

  @Field({ nullable: true })
  cardNumber?: string | null;

  @Field({ nullable: true })
  instructionsUk?: string | null;
}

@InputType()
export class StudentManualInvoiceSelectionInput {
  @Field(() => [String])
  allowedMethodIds!: string[];

  @Field({ nullable: true })
  defaultMethodId?: string | null;
}

@InputType()
export class StudentPaymentMethodSelectionInput {
  @Field(() => [String])
  allowedMethods!: string[];

  @Field({ nullable: true, defaultValue: false })
  restrictToAllowlistOnly?: boolean;
}

@InputType()
export class LessonPriceByCurrencyInput {
  @Field()
  currency!: string;

  @Field(() => Int)
  pricePerLessonMinor!: number;
}

@InputType()
export class PaymentConfigInput {
  @Field(() => [LessonPackageInput])
  packages!: LessonPackageInput[];

  @Field(() => Int)
  defaultPricePerLessonMinor!: number;

  @Field(() => [LessonPriceByCurrencyInput], { nullable: true })
  pricePerLessonByCurrency?: LessonPriceByCurrencyInput[];

  @Field()
  defaultCurrency!: string;

  @Field(() => [String])
  allowedCurrencies!: string[];

  @Field(() => Int)
  minPackageLessons!: number;

  @Field(() => [ManualInvoiceMethodInput])
  manualInvoiceMethods!: ManualInvoiceMethodInput[];

  @Field({ nullable: true })
  stripeMode?: string | null;

  @Field({ nullable: true })
  stripeLivePublishableKey?: string | null;

  @Field({ nullable: true })
  stripeTestPublishableKey?: string | null;

  @Field({ nullable: true })
  liqpayMode?: string | null;

  @Field({ nullable: true })
  liqpayLivePublicKey?: string | null;

  @Field({ nullable: true })
  liqpayTestPublicKey?: string | null;

  @Field({ nullable: true })
  wayforpayMode?: string | null;

  @Field({ nullable: true })
  wayforpayLiveMerchantAccount?: string | null;

  @Field({ nullable: true })
  wayforpayLiveMerchantDomainName?: string | null;

  @Field({ nullable: true })
  wayforpayTestMerchantAccount?: string | null;

  @Field({ nullable: true })
  wayforpayTestMerchantDomainName?: string | null;

  @Field({ nullable: true })
  lemonsqueezyMode?: string | null;

  @Field({ nullable: true })
  lemonsqueezyLiveStoreId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyLiveVariantId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyTestStoreId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyTestVariantId?: string | null;

  @Field({ nullable: true })
  lemonsqueezyLiveVariantCurrency?: string | null;

  @Field({ nullable: true })
  lemonsqueezyTestVariantCurrency?: string | null;

  @Field({ nullable: true })
  paddleMode?: string | null;

  @Field({ nullable: true })
  monopayMode?: string | null;

  @Field({ nullable: true })
  paypalMode?: string | null;

  @Field({ nullable: true })
  paypalLiveClientId?: string | null;

  @Field({ nullable: true })
  paypalTestClientId?: string | null;

  @Field(() => SchoolGroupLessonsSettingsInput, { nullable: true })
  groupLessons?: SchoolGroupLessonsSettingsInput | null;
}

@InputType()
export class StripeSecretsInput {
  @Field({ nullable: true })
  liveSecretKey?: string | null;

  @Field({ nullable: true })
  liveWebhookSecret?: string | null;

  @Field({ nullable: true })
  testSecretKey?: string | null;

  @Field({ nullable: true })
  testWebhookSecret?: string | null;
}

@InputType()
export class LiqPaySecretsInput {
  @Field({ nullable: true })
  livePrivateKey?: string | null;

  @Field({ nullable: true })
  testPrivateKey?: string | null;
}

@InputType()
export class WayForPaySecretsInput {
  @Field({ nullable: true })
  liveSecretKey?: string | null;

  @Field({ nullable: true })
  testSecretKey?: string | null;
}

@InputType()
export class LemonSqueezySecretsInput {
  @Field({ nullable: true })
  liveApiKey?: string | null;

  @Field({ nullable: true })
  liveWebhookSecret?: string | null;

  @Field({ nullable: true })
  testApiKey?: string | null;

  @Field({ nullable: true })
  testWebhookSecret?: string | null;
}

@InputType()
export class PaddleSecretsInput {
  @Field({ nullable: true })
  liveApiKey?: string | null;

  @Field({ nullable: true })
  liveWebhookSecret?: string | null;

  @Field({ nullable: true })
  testApiKey?: string | null;

  @Field({ nullable: true })
  testWebhookSecret?: string | null;
}

@InputType()
export class MonoPaySecretsInput {
  @Field({ nullable: true })
  liveToken?: string | null;

  @Field({ nullable: true })
  testToken?: string | null;
}

@InputType()
export class PayPalSecretsInput {
  @Field({ nullable: true })
  liveClientSecret?: string | null;

  @Field({ nullable: true })
  liveWebhookId?: string | null;

  @Field({ nullable: true })
  testClientSecret?: string | null;

  @Field({ nullable: true })
  testWebhookId?: string | null;
}

@InputType()
export class PaymentSecretsInput {
  @Field(() => StripeSecretsInput, { nullable: true })
  stripe?: StripeSecretsInput | null;

  @Field(() => LiqPaySecretsInput, { nullable: true })
  liqpay?: LiqPaySecretsInput | null;

  @Field(() => WayForPaySecretsInput, { nullable: true })
  wayforpay?: WayForPaySecretsInput | null;

  @Field(() => LemonSqueezySecretsInput, { nullable: true })
  lemonsqueezy?: LemonSqueezySecretsInput | null;

  @Field(() => PaddleSecretsInput, { nullable: true })
  paddle?: PaddleSecretsInput | null;

  @Field(() => MonoPaySecretsInput, { nullable: true })
  monopay?: MonoPaySecretsInput | null;

  @Field(() => PayPalSecretsInput, { nullable: true })
  paypal?: PayPalSecretsInput | null;
}

@InputType()
export class UpdatePaymentSettingsInput {
  @Field(() => [String])
  enabledMethods!: string[];

  @Field(() => PaymentConfigInput)
  config!: PaymentConfigInput;

  @Field(() => PaymentSecretsInput, { nullable: true })
  secrets?: PaymentSecretsInput | null;
}

@ObjectType()
export class LessonBalanceLedgerEntryType {
  @Field(() => ID)
  id!: string;

  @Field(() => Int)
  delta!: number;

  @Field(() => Int)
  balanceAfter!: number;

  @Field()
  kind!: string;

  @Field({ nullable: true })
  note?: string | null;

  @Field()
  createdAt!: string;

  @Field({ nullable: true })
  scheduledLessonId?: string | null;

  @Field(() => Int, { nullable: true })
  amountMinor?: number | null;

  @Field({ nullable: true })
  currency?: string | null;
}

@ObjectType()
export class StudentGroupMembershipSummaryType {
  @Field(() => ID)
  groupId!: string;

  @Field()
  name!: string;

  @Field()
  groupBillingMode!: string;

  @Field(() => Int, { nullable: true })
  groupPriceMinor?: number | null;

  @Field({ nullable: true })
  groupCurrency?: string | null;

  @Field({ nullable: true })
  groupSplitMode?: string | null;

  @Field({ nullable: true })
  groupPayerUserId?: string | null;
}

@ObjectType()
export class StudentLessonBalanceType {
  @Field(() => Int)
  balance!: number;

  @Field()
  isDebt!: boolean;

  @Field(() => Int)
  groupBalance!: number;

  @Field()
  groupIsDebt!: boolean;

  @Field(() => [String])
  availableMethods!: string[];

  @Field(() => [String])
  enabledPaymentMethods!: string[];

  @Field(() => StudentPaymentMethodSelectionType)
  paymentMethodSelection!: StudentPaymentMethodSelectionType;

  @Field(() => [ManualInvoiceMethodType])
  manualInvoiceMethods!: ManualInvoiceMethodType[];

  @Field(() => [ManualInvoiceMethodType])
  platformManualInvoiceMethods!: ManualInvoiceMethodType[];

  @Field(() => StudentManualInvoiceSelectionType)
  manualInvoiceSelection!: StudentManualInvoiceSelectionType;

  @Field()
  billingMode!: string;

  @Field(() => [StudentPackageOverrideType])
  packageOverrides!: StudentPackageOverrideType[];

  @Field(() => [LessonPackageType])
  platformPackages!: LessonPackageType[];

  @Field()
  showPerLessonPricing!: boolean;

  @Field()
  showSelfServePackages!: boolean;

  @Field(() => [String])
  allowedCurrencies!: string[];

  @Field(() => Int)
  minPackageLessons!: number;

  @Field(() => Int, { nullable: true })
  pricePerLessonMinor?: number | null;

  @Field(() => Int)
  defaultPricePerLessonMinor!: number;

  @Field(() => Int)
  resolvedPricePerLessonMinor!: number;

  @Field(() => Int, { nullable: true })
  groupPricePerLessonMinor?: number | null;

  @Field(() => Int)
  defaultGroupPricePerLessonMinor!: number;

  @Field(() => Int)
  resolvedGroupPricePerLessonMinor!: number;

  @Field()
  groupCurrency!: string;

  @Field()
  defaultCurrency!: string;

  @Field()
  isCustomPrice!: boolean;

  @Field()
  isCustomGroupPrice!: boolean;

  @Field(() => [ResolvedLessonPackageType])
  packages!: ResolvedLessonPackageType[];

  @Field(() => [LessonBalanceLedgerEntryType])
  recentLedger!: LessonBalanceLedgerEntryType[];

  /** Active Lemon Squeezy variant currency for checkout filtering (when enabled). */
  @Field({ nullable: true })
  lemonSqueezyVariantCurrency?: string | null;

  @Field({ nullable: true })
  lessonFormat?: string | null;

  @Field(() => [StudentGroupMembershipSummaryType], { nullable: true })
  groupMemberships?: StudentGroupMembershipSummaryType[] | null;
}

@InputType()
export class UpdateStudentLessonPricingInput {
  @Field(() => ID)
  studentId!: string;

  @Field(() => Int, { nullable: true })
  pricePerLessonMinor?: number | null;

  @Field(() => Int, { nullable: true })
  groupPricePerLessonMinor?: number | null;
}

@InputType()
export class StudentPackageOverrideInput {
  @Field()
  packageId!: string;

  @Field(() => Int, { nullable: true })
  lessons?: number | null;

  @Field({ nullable: true })
  lessonsLocked?: boolean;

  @Field({ nullable: true })
  enabled?: boolean;
}

@InputType()
export class UpdateStudentLessonBillingInput {
  @Field(() => ID)
  studentId!: string;

  @Field()
  billingMode!: string;

  @Field(() => [StudentPackageOverrideInput])
  packageOverrides!: StudentPackageOverrideInput[];

  @Field(() => StudentPaymentMethodSelectionInput)
  paymentMethodSelection!: StudentPaymentMethodSelectionInput;

  @Field(() => StudentManualInvoiceSelectionInput)
  manualInvoiceSelection!: StudentManualInvoiceSelectionInput;
}

@InputType()
export class AdjustStudentLessonBalanceInput {
  @Field(() => ID)
  studentId!: string;

  @Field(() => Int)
  lessons!: number;

  @Field({ nullable: true })
  note?: string | null;

  @Field({ nullable: true })
  creditTrack?: string | null;
}

@InputType()
export class CreateLessonPurchaseCheckoutInput {
  @Field()
  method!: string;

  @Field()
  packageId!: string;
}

@ObjectType()
export class LessonPurchaseCheckoutType {
  @Field()
  checkoutUrl!: string;
}

@ObjectType()
export class SpeakingTopicAssignmentType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  studentId!: string;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  personalNote?: string | null;

  @Field(() => String, { nullable: true })
  dueDate?: string | null;
}

@ObjectType()
export class SpeakingSubmissionSummaryType {
  @Field(() => ID)
  id!: string;

  @Field()
  status!: string;

  @Field(() => Int, { nullable: true })
  durationSec?: number | null;

  @Field(() => String, { nullable: true })
  teacherFeedback?: string | null;

  @Field()
  submittedAt!: string;

  @Field()
  hasAudio!: boolean;
}

@ObjectType()
export class SpeakingTopicCardType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  prompt!: string;

  @Field(() => [String])
  wordIds!: string[];

  @Field(() => ID)
  ownerId!: string;

  @Field()
  createdAt!: string;

  @Field(() => SpeakingTopicAssignmentType, { nullable: true })
  assignment?: SpeakingTopicAssignmentType | null;

  @Field(() => SpeakingSubmissionSummaryType, { nullable: true })
  latestSubmission?: SpeakingSubmissionSummaryType | null;
}

@ObjectType()
export class SpeakingSubmissionType extends SpeakingSubmissionSummaryType {
  @Field(() => ID)
  topicId!: string;

  @Field(() => ID, { nullable: true })
  assignmentId?: string | null;

  @Field(() => ID)
  studentId!: string;

  @Field()
  topicTitle!: string;

  @Field()
  topicPrompt!: string;

  @Field(() => [String])
  topicWordIds!: string[];
}

@InputType()
export class CreateSpeakingTopicInput {
  @Field()
  title!: string;

  @Field()
  prompt!: string;

  @Field(() => [String], { nullable: true })
  wordIds?: string[] | null;

  @Field(() => ID, { nullable: true })
  studentId?: string | null;

  @Field(() => String, { nullable: true })
  personalNote?: string | null;

  @Field(() => String, { nullable: true })
  dueDate?: string | null;
}

@InputType()
export class SubmitSpeakingRecordingInput {
  @Field(() => ID)
  topicId!: string;

  @Field(() => ID, { nullable: true })
  assignmentId?: string | null;

  @Field(() => Int, { nullable: true })
  durationSec?: number | null;
}

@InputType()
export class ReviewSpeakingSubmissionInput {
  @Field(() => ID)
  submissionId!: string;

  @Field()
  teacherFeedback!: string;
}

@ObjectType()
export class LibraryMaterialKindCountsType {
  @Field(() => Int)
  all!: number;

  @Field(() => Int)
  board!: number;

  @Field(() => Int)
  presentation!: number;

  @Field(() => Int)
  book!: number;

  @Field(() => Int)
  other!: number;
}

@ObjectType()
export class LibraryMaterialPageType {
  @Field(() => [LibraryMaterialType])
  items!: LibraryMaterialType[];

  @Field(() => String, { nullable: true })
  nextCursor?: string | null;

  @Field(() => LibraryMaterialKindCountsType)
  kindCounts!: LibraryMaterialKindCountsType;
}

@InputType()
export class LibraryMaterialsQueryInput {
  @Field({ nullable: true })
  kind?: string;

  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  cursor?: string;

  @Field(() => Int, { nullable: true })
  take?: number;
}

@InputType()
export class LibraryMaterialAssetInput {
  @Field()
  role!: string;

  @Field()
  deliveryKind!: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => ID, { nullable: true })
  fileAttachmentId?: string;

  @Field({ nullable: true })
  label?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class CreateLibraryMaterialInput {
  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  kind!: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  level?: string;

  @Field({ nullable: true })
  publisher?: string;

  @Field(() => ID, { nullable: true })
  schoolId?: string;

  @Field(() => ID, { nullable: true })
  coverAttachmentId?: string | null;

  @Field(() => [LibraryMaterialAssetInput], { nullable: true })
  assets?: LibraryMaterialAssetInput[];
}

@InputType()
export class UpdateLibraryMaterialInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  kind?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  level?: string;

  @Field({ nullable: true })
  publisher?: string;

  @Field(() => ID, { nullable: true })
  coverAttachmentId?: string | null;

  @Field(() => [LibraryMaterialAssetInput], { nullable: true })
  assets?: LibraryMaterialAssetInput[];
}

@InputType()
export class UpsertLibraryMaterialAssetsInput {
  @Field(() => [LibraryMaterialAssetInput])
  assets!: LibraryMaterialAssetInput[];
}
