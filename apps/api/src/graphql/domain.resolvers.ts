import {
  Args,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthService,
  CurrentGqlUser,
  DailyGoalsService,
  DashboardService,
  PracticeSessionsService,
  GqlAuthGuard,
  LanguagesService,
  StudentsAdminService,
  UsersService,
} from '@soenglish/module-auth';
import { PrismaService } from '@soenglish/data-access-prisma';
import { MailService } from '@soenglish/module-mail';
import { QuizGeneratorService } from '@soenglish/module-flashcards';
import { LessonsService } from '@soenglish/module-lessons';
import { StreakService, TeacherMessagesService } from '@soenglish/module-notifications';
import { PlatformSettingsService, VocabularyService } from '@soenglish/module-vocabulary';
import { UseGuards } from '@nestjs/common';
import type {
  GenerateQuizRequestDto,
  RecordPracticeSessionRequestDto,
  StudentWordCardDto,
  UpdateScheduledLessonRequestDto,
} from '@soenglish/shared-types';
import {
  AdminUserSummaryType,
  AuthUserType,
  ChangePasswordInput,
  CreateAdminUserInput,
  CreateAdminUserPayloadType,
  SendTestWelcomeEmailInput,
  SendTestEmailResultType,
  SystemMailStatusType,
  CreateScheduledLessonInput,
  CreateStudentWordCardInput,
  DailyGoalType,
  DashboardSummaryType,
  LearningStreakType,
  WordOfDayType,
  PracticeSessionType,
  PracticeWeekSummaryType,
  RecordPracticeSessionInput,
  GenerateQuizInput,
  MyProfileType,
  OkResultType,
  QuizAttemptResultType,
  QuizCardType,
  QuizDetailType,
  StudentQuizCardType,
  SubmitQuizAttemptInput,
  ScheduledLessonType,
  AssignableTeacherType,
  StudentSummaryType,
  StudentWordCardType,
  UpdateCardStatusInput,
  UpdateMyProfileInput,
  UpdateScheduledLessonInput,
  LessonHomeworkInput,
  LessonMaterialInput,
  StudentResponseInput,
  VocabularyOverviewType,
  LanguageType,
  StudentLanguagesUpdateType,
  UpdateAdminStudentInput,
  SendTeacherMessageInput,
  TeacherMessageType,
  WordCardType,
  WordDetailsType,
  WordLookupResultType,
  WordDictionarySettingsType,
  UpdateWordDictionaryProviderInput,
} from './graphql.types';

function mapQuizDetail(detail: Awaited<ReturnType<QuizGeneratorService['detailFor']>>): QuizDetailType {
  return {
    ...detail,
    questions: detail.questions.map((q) => ({
      ...q,
      correct: String(q.correct),
    })),
  };
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class DashboardResolver {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly dailyGoalsService: DailyGoalsService,
    private readonly practiceSessions: PracticeSessionsService,
    private readonly streak: StreakService,
  ) {}

  @Query(() => DashboardSummaryType, { name: 'dashboardSummary' })
  dashboardSummary(@CurrentGqlUser() userId: string) {
    return this.dashboard.summaryFor(userId);
  }

  @Query(() => LearningStreakType, { name: 'learningStreak', nullable: true })
  learningStreak(@CurrentGqlUser() userId: string) {
    return this.streak.learningStreakForDashboard(userId);
  }

  @Query(() => WordOfDayType, { name: 'wordOfDay', nullable: true })
  wordOfDay(@CurrentGqlUser() userId: string) {
    return this.dashboard.wordOfDayFor(userId);
  }

  @Query(() => [DailyGoalType], { name: 'dailyGoals' })
  dailyGoals(@CurrentGqlUser() userId: string) {
    return this.dailyGoalsService.listForUser(userId);
  }

  @Mutation(() => [DailyGoalType], { name: 'setDailyGoalDone' })
  setDailyGoalDone(
    @CurrentGqlUser() userId: string,
    @Args('goalId', { type: () => ID }) goalId: string,
    @Args('done') done: boolean,
  ) {
    return this.dailyGoalsService.setDone(userId, goalId, done);
  }

  @Query(() => PracticeWeekSummaryType, { name: 'practiceWeekSummary' })
  practiceWeekSummary(@CurrentGqlUser() userId: string) {
    return this.practiceSessions.weekSummaryFor(userId);
  }

  @Mutation(() => PracticeSessionType, { name: 'recordPracticeSession' })
  recordPracticeSession(
    @CurrentGqlUser() userId: string,
    @Args('input') input: RecordPracticeSessionInput,
  ) {
    return this.practiceSessions.record(userId, {
      kind: input.kind as RecordPracticeSessionRequestDto['kind'],
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      source: input.source as RecordPracticeSessionRequestDto['source'] | undefined,
    });
  }
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class VocabularyResolver {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Query(() => VocabularyOverviewType, { name: 'vocabularyOverview' })
  vocabularyOverview(@CurrentGqlUser() userId: string) {
    return this.vocabulary.overviewFor(userId);
  }

  @Query(() => WordLookupResultType, { name: 'lookupWord' })
  lookupWord(@Args('text') text: string) {
    return this.vocabulary.lookupWord(text);
  }

  @Query(() => [WordCardType], { name: 'wordsByIds' })
  wordsByIds(@Args('ids', { type: () => [ID] }) ids: string[]) {
    return this.vocabulary.listWordsByIds(ids);
  }

  @Query(() => WordDetailsType, { name: 'wordDetails' })
  wordDetails(@Args('id', { type: () => ID }) id: string) {
    return this.vocabulary.getWordDetails(id);
  }

  @Query(() => [WordCardType], { name: 'globalWords' })
  globalWords(
    @Args('search', { nullable: true }) search?: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ) {
    return this.vocabulary.listWords({ search, category, take });
  }

  @Query(() => [StudentWordCardType], { name: 'studentVocabulary' })
  studentVocabulary(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    return this.vocabulary.listStudentCards(studentId ?? userId);
  }

  @Mutation(() => StudentWordCardType, { name: 'addStudentWordCard' })
  addStudentWordCard(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateStudentWordCardInput,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    const targetId = studentId ?? userId;
    return this.vocabulary.createStudentCard(targetId, userId, {
      text: input.text,
      lessonId: input.lessonId,
      status: (input.status ?? 'new') as StudentWordCardDto['status'],
    });
  }

  @Mutation(() => StudentWordCardType, { name: 'updateCardStatus' })
  updateCardStatus(
    @CurrentGqlUser() userId: string,
    @Args('input') input: UpdateCardStatusInput,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    const targetId = studentId ?? userId;
    return this.vocabulary.statusUpdate(
      targetId,
      input.cardId,
      input.status as StudentWordCardDto['status'],
      userId,
    );
  }

  @Mutation(() => Boolean, { name: 'deleteStudentWordCard' })
  deleteStudentWordCard(
    @CurrentGqlUser() userId: string,
    @Args('cardId', { type: () => ID }) cardId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
  ) {
    return this.vocabulary.deleteStudentCard(userId, studentId, cardId);
  }
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class QuizzesResolver {
  constructor(private readonly quizService: QuizGeneratorService) {}

  @Query(() => [QuizCardType], { name: 'quizzes' })
  quizzes(@CurrentGqlUser() userId: string) {
    return this.quizService.listFor(userId);
  }

  @Query(() => QuizDetailType, { name: 'quiz' })
  async quiz(@CurrentGqlUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const detail = await this.quizService.detailFor(userId, id);
    return mapQuizDetail(detail);
  }

  @Mutation(() => QuizDetailType, { name: 'generateQuiz' })
  async generateQuiz(@CurrentGqlUser() userId: string, @Args('input') input: GenerateQuizInput) {
    const body: GenerateQuizRequestDto = {
      title: input.title,
      category: input.category,
      difficulty: input.difficulty as GenerateQuizRequestDto['difficulty'],
      source: input.source as GenerateQuizRequestDto['source'],
      questionCount: input.questionCount,
      lessonId: input.lessonId,
      studentId: input.studentId,
    };
    const detail = await this.quizService.generate(userId, body);
    return mapQuizDetail(detail);
  }

  @Mutation(() => Boolean, { name: 'deleteQuiz' })
  deleteQuiz(@CurrentGqlUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    return this.quizService.delete(userId, id);
  }

  @Query(() => [StudentQuizCardType], { name: 'studentQuizzes' })
  studentQuizzes(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
  ) {
    return this.quizService.listForStudent(userId, studentId);
  }

  @Mutation(() => QuizAttemptResultType, { name: 'submitQuizAttempt' })
  submitQuizAttempt(
    @CurrentGqlUser() userId: string,
    @Args('input') input: SubmitQuizAttemptInput,
  ) {
    return this.quizService.submitAttempt(userId, {
      quizId: input.quizId,
      studentId: input.studentId,
      practiceMode: input.practiceMode,
      answers: input.answers,
    });
  }
}

function mapLessonMaterialsInput(
  materials: LessonMaterialInput[] | undefined,
): UpdateScheduledLessonRequestDto['materials'] {
  if (!materials) return undefined;
  return materials.map((material) => ({
    kind: material.kind as 'text' | 'photo' | 'test' | 'file' | 'presentation',
    text: material.text ?? '',
    files: material.files ?? [],
  }));
}

function mapLessonHomeworkInput(
  homework: LessonHomeworkInput | undefined,
): UpdateScheduledLessonRequestDto['homework'] {
  if (!homework) return undefined;
  return {
    text: homework.text,
    files: homework.files,
  };
}

function mapStudentResponseInput(
  studentResponse: StudentResponseInput | undefined,
): UpdateScheduledLessonRequestDto['studentResponse'] {
  if (!studentResponse) return undefined;
  return {
    text: studentResponse.text,
    files: studentResponse.files,
    status: studentResponse.status as
      | 'not_submitted'
      | 'submitted'
      | 'needs_rework'
      | 'accepted'
      | undefined,
    homeworkChecked: studentResponse.homeworkChecked,
    teacherHomeworkFeedback: studentResponse.teacherHomeworkFeedback,
  };
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class LessonsResolver {
  constructor(private readonly lessons: LessonsService) {}

  @Query(() => [ScheduledLessonType], { name: 'scheduledLessons' })
  scheduledLessons(@CurrentGqlUser() userId: string) {
    return this.lessons.listFor(userId);
  }

  @Query(() => ScheduledLessonType, { name: 'scheduledLesson' })
  async scheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const lesson = await this.lessons.fetchLesson(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.teacherId !== userId && lesson.studentId !== userId) {
      throw new ForbiddenException();
    }
    return this.lessons.toDto(lesson);
  }

  @Mutation(() => ScheduledLessonType, { name: 'createScheduledLesson' })
  createScheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateScheduledLessonInput,
  ) {
    return this.lessons.create(userId, {
      title: input.title,
      description: input.description,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      studentId: input.studentId,
      teacherId: input.teacherId,
      duration: input.duration,
      timezone: input.timezone,
      notes: input.notes,
      lessonPlan: input.lessonPlan,
      status: input.status as 'planned' | 'completed' | 'cancelled' | undefined,
      recurrence: input.recurrence as 'none' | 'daily' | 'weekly' | 'monthly' | undefined,
      weeklyDays: input.weeklyDays,
      seriesId: input.seriesId,
      linkedWordIds: input.linkedWordIds,
    });
  }

  @Mutation(() => ScheduledLessonType, { name: 'updateScheduledLesson' })
  updateScheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateScheduledLessonInput,
  ) {
    return this.lessons.update(id, userId, {
      title: input.title,
      description: input.description,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      duration: input.duration,
      timezone: input.timezone,
      notes: input.notes,
      lessonPlan: input.lessonPlan,
      status: input.status as 'planned' | 'completed' | 'cancelled' | undefined,
      recurrence: input.recurrence as 'none' | 'daily' | 'weekly' | 'monthly' | undefined,
      weeklyDays: input.weeklyDays,
      seriesId: input.seriesId,
      linkedWordIds: input.linkedWordIds,
      cancelReason: input.cancelReason as
        | 'student_absent'
        | 'student_requested_cancel'
        | 'teacher_absent'
        | undefined,
      credited: input.credited,
      materials: mapLessonMaterialsInput(input.materials),
      homework: mapLessonHomeworkInput(input.homework),
      studentResponse: mapStudentResponseInput(input.studentResponse),
    });
  }

  @Mutation(() => ScheduledLessonType, { name: 'ensureScheduledLessonMeet' })
  ensureScheduledLessonMeet(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.lessons.ensureMeetLink(id, userId);
  }

  @Mutation(() => OkResultType, { name: 'deleteScheduledLesson' })
  async deleteScheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    await this.lessons.remove(id, userId);
    return { ok: true };
  }
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class LanguagesResolver {
  constructor(private readonly languagesService: LanguagesService) {}

  @Query(() => [LanguageType], { name: 'languages' })
  listLanguages() {
    return this.languagesService.listActive();
  }
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(
    private readonly users: UsersService,
    private readonly studentsAdmin: StudentsAdminService,
    private readonly teacherMessages: TeacherMessagesService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [StudentSummaryType], { name: 'students' })
  students(@CurrentGqlUser() userId: string) {
    return this.users.listStudents(userId);
  }

  @Query(() => [AssignableTeacherType], { name: 'assignableTeachers' })
  assignableTeachers(@CurrentGqlUser() userId: string) {
    return this.users.listAssignableTeachers(userId);
  }

  @Query(() => MyProfileType, { name: 'myProfile' })
  myProfile(@CurrentGqlUser() userId: string) {
    return this.users.getMyProfile(userId);
  }

  @Mutation(() => MyProfileType, { name: 'updateMyProfile' })
  updateMyProfile(
    @CurrentGqlUser() userId: string,
    @Args('input') input: UpdateMyProfileInput,
  ) {
    return this.users.updateMyProfile(userId, {
      displayName: input.displayName,
      timezone: input.timezone,
      avatarUrl: input.avatarUrl,
      proficiencyLevel: input.proficiencyLevel as
        | 'A1'
        | 'A2'
        | 'B1'
        | 'B2'
        | 'C1'
        | 'C2'
        | null
        | undefined,
      phone: input.phone,
      telegram: input.telegram,
      bio: input.bio,
      nativeLanguageId: input.nativeLanguageId,
      notificationPrefs: input.notificationPrefs
        ? {
            lessonReminder: input.notificationPrefs.lessonReminder,
            streakAlert: input.notificationPrefs.streakAlert,
            weeklyReport: input.notificationPrefs.weeklyReport,
            newVocab: input.notificationPrefs.newVocab,
            teacherMessages: input.notificationPrefs.teacherMessages,
          }
        : undefined,
    });
  }

  @Mutation(() => StudentLanguagesUpdateType, { name: 'updateStudentLanguages' })
  async updateStudentLanguages(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
    @Args('input') input: UpdateAdminStudentInput,
  ) {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN')) {
      throw new ForbiddenException('Only admins can update student admin fields');
    }
    return this.studentsAdmin.updateStudent(
      actor.role as 'ADMIN' | 'SUPER_ADMIN',
      studentId,
      input,
    );
  }

  @Mutation(() => TeacherMessageType, { name: 'sendTeacherMessage' })
  sendTeacherMessage(
    @CurrentGqlUser() userId: string,
    @Args('input') input: SendTeacherMessageInput,
  ) {
    return this.teacherMessages.send(userId, {
      studentId: input.studentId,
      body: input.body,
    });
  }

  @Mutation(() => OkResultType, { name: 'changeMyPassword' })
  changeMyPassword(
    @CurrentGqlUser() userId: string,
    @Args('input') input: ChangePasswordInput,
  ) {
    return this.users.changeMyPassword(userId, input);
  }
}

type UserRoleName = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AdminResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [AdminUserSummaryType], { name: 'adminUsers' })
  async adminUsers(@CurrentGqlUser() userId: string) {
    const actor = await this.requireAdmin(userId);
    const users = await this.prisma.user.findMany({
      where:
        actor.role === 'ADMIN'
          ? { role: { in: ['STUDENT', 'TEACHER', 'ADMIN'] } }
          : { role: { not: 'SUPER_ADMIN' } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return users.map((user) => ({
      ...user,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
    }));
  }

  @Mutation(() => CreateAdminUserPayloadType, { name: 'createAdminUser' })
  async createAdminUser(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateAdminUserInput,
  ) {
    const actor = await this.requireAdmin(userId);
    const { user, welcomeEmailSent } = await this.authService.createUserAsAdmin(actor, {
      email: input.email,
      role: (input.role ?? 'student') as 'student' | 'teacher' | 'admin',
      displayName: input.displayName,
      phone: input.phone,
      telegram: input.telegram,
      bio: input.bio,
      nativeLanguageId: input.nativeLanguageId,
      learningLanguageIds: input.learningLanguageIds,
      timezone: input.timezone,
      proficiencyLevel: input.proficiencyLevel as
        | 'A1'
        | 'A2'
        | 'B1'
        | 'B2'
        | 'C1'
        | 'C2'
        | null
        | undefined,
      status: input.status as 'active' | 'paused' | 'leaved' | 'blocked' | null | undefined,
      teacherId: input.teacherId,
    });
    return {
      welcomeEmailSent,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role.toLowerCase(),
        status: user.status.toLowerCase(),
        proficiencyLevel: user.proficiencyLevel ?? null,
        timezone: user.timezone,
        teacherId: user.teacherId,
        hasPassword: Boolean(user.passwordHash),
        linkedProviders: (user.oauthAccounts ?? []).map((a) => a.provider.toLowerCase()),
      },
    };
  }

  @Mutation(() => OkResultType, { name: 'deleteAdminUser' })
  async deleteAdminUser(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) targetId: string,
  ) {
    const actor = await this.requireAdmin(userId);
    await this.authService.deleteUserAsAdmin(actor, targetId);
    return { ok: true };
  }

  private async requireAdmin(userId: string): Promise<{ id: string; role: UserRoleName }> {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can manage accounts');
    }
    return { id: actor.id, role: actor.role };
  }
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class SystemResolver {
  constructor(
    private readonly mail: MailService,
    private readonly prisma: PrismaService,
    private readonly platformSettings: PlatformSettingsService,
  ) {}

  @Query(() => SystemMailStatusType, { name: 'systemMailStatus' })
  async systemMailStatus(@CurrentGqlUser() userId: string) {
    await this.requireSuperAdmin(userId);
    return this.mail.getStatus();
  }

  @Mutation(() => OkResultType, { name: 'verifySmtpConnection' })
  async verifySmtpConnection(@CurrentGqlUser() userId: string) {
    await this.requireSuperAdmin(userId);
    try {
      await this.mail.verifyConnection();
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SMTP verification failed';
      throw new BadRequestException(message);
    }
  }

  @Mutation(() => SendTestEmailResultType, { name: 'sendTestWelcomeEmail' })
  async sendTestWelcomeEmail(
    @CurrentGqlUser() userId: string,
    @Args('input') input: SendTestWelcomeEmailInput,
  ) {
    await this.requireSuperAdmin(userId);
    const to = input.to?.trim().toLowerCase();
    if (!to || !to.includes('@')) {
      throw new BadRequestException('Invalid email address');
    }
    const result = await this.mail.sendTestWelcomeEmail(to);
    return {
      sent: result.sent,
      message: result.sent ? 'Test welcome email sent' : (result.error ?? 'Send failed'),
    };
  }

  @Query(() => WordDictionarySettingsType, { name: 'wordDictionarySettings' })
  async wordDictionarySettings(@CurrentGqlUser() userId: string) {
    await this.requireSuperAdmin(userId);
    return this.platformSettings.getWordDictionarySettings();
  }

  @Mutation(() => WordDictionarySettingsType, { name: 'updateWordDictionaryProvider' })
  async updateWordDictionaryProvider(
    @CurrentGqlUser() userId: string,
    @Args('input') input: UpdateWordDictionaryProviderInput,
  ) {
    await this.requireSuperAdmin(userId);
    const provider = input.provider?.trim();
    if (provider !== 'dictionary_api_dev' && provider !== 'wiktionary') {
      throw new BadRequestException('Invalid dictionary provider');
    }
    return this.platformSettings.setWordDictionaryProvider(provider);
  }

  private async requireSuperAdmin(userId: string): Promise<void> {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('System tools are available only to super-admins');
    }
  }
}
