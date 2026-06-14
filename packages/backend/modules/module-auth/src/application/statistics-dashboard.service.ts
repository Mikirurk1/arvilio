import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PracticeSessionKind,
  PracticeSessionSource,
  UserRole,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '@be/prisma';
import {
  getDailyGoalsForUser,
  resolveStatsRangeBounds,
  getPricePerLessonForCurrency,
  isoInRange,
  listUtcDateKeysInRange,
  previousStatsRangeBounds,
  statsRangeLabel,
  utcDateKey,
  type PaymentConfigDto,
  type PaymentCurrencyCode,
  isPaymentCurrencyCode,
  type StatisticsBillingOverviewDto,
  type StatisticsDashboardFocus,
  type StatisticsDashboardDto,
  type StatisticsDashboardLayout,
  type StatisticsKpiDto,
  type StatisticsRosterEntryDto,
  type StatisticsStudentScope,
  type StatsDateRange,
  type StatsRange,
  type StatsTrendDirection,
} from '@pkg/types';
import { StaffPayrollService } from '@be/billing';
import { DailyGoalProgressService } from './daily-goal-progress.service';
import { StreakService } from '../../../module-notifications/src/application/streak.service';

type StaffPeriodSnapshot = StudentPeriodSnapshot & {
  homeworkReviewed: number;
  activeStudentIds: Set<string>;
  groupLessonsCompleted: number;
};

type StudentPeriodSnapshot = {
  lessonsPlanned: number;
  lessonsCompleted: number;
  lessonsCancelled: number;
  lessonsCredited: number;
  lessonMinutes: number;
  lessonTrend: Map<string, number>;
  vocabAdded: number;
  vocabReviewed: number;
  vocabLearned: number;
  vocabStatus: Record<string, number>;
  vocabTrend: Map<string, { added: number; known: number; reviewed: number }>;
  practiceSecByKind: Record<string, number>;
  practiceTrend: Map<string, Record<string, number>>;
  quizAttempts: number;
  quizPerfect: number;
  quizBestScore: number;
  quizQuestionsCorrect: number;
  speakingSubmissions: number;
  speakingReviewed: number;
  speakingSec: number;
};

@Injectable()
export class StatisticsDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaks: StreakService,
    private readonly dailyGoalProgress: DailyGoalProgressService,
    private readonly staffPayroll: StaffPayrollService,
  ) {}

  async dashboardFor(
    viewerId: string,
    range: StatsRange,
    studentId?: string,
    studentScope?: StatisticsStudentScope,
    now = new Date(),
    statisticsFocus: StatisticsDashboardFocus = 'operations',
    rangeFrom?: string,
    rangeTo?: string,
    staffUserId?: string,
  ): Promise<StatisticsDashboardDto> {
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      select: { id: true, role: true },
    });
    if (!viewer) throw new UnauthorizedException();

    if (staffUserId && studentId) {
      throw new BadRequestException('Cannot combine studentId and staffUserId');
    }

    if (staffUserId) {
      return this.dashboardForStaffSubject(
        viewer,
        staffUserId,
        range,
        statisticsFocus,
        now,
        rangeFrom,
        rangeTo,
      );
    }

    const targetStudentId = await this.resolveStudentSubjectId(viewer, studentId);

    if (!targetStudentId) {
      return this.dashboardForStaff(
        viewer,
        range,
        studentScope,
        statisticsFocus,
        now,
        rangeFrom,
        rangeTo,
      );
    }

    const rangeBounds = this.resolveRangeBounds(range, now, rangeFrom, rangeTo);
    const previousBounds = previousStatsRangeBounds(rangeBounds);
    const current = await this.snapshotStudentPeriod(targetStudentId, rangeBounds);
    const previous = await this.snapshotStudentPeriod(targetStudentId, previousBounds);
    const streak = await this.streaks.snapshotForStudent(targetStudentId);
    const dailyGoals = await this.snapshotDailyGoals(targetStudentId, rangeBounds, now);

    const kpis = this.buildStudentKpis(current, previous, streak.streakDays, dailyGoals);

    return {
      layout: 'student',
      subjectRole: 'student',
      range,
      rangeLabel: statsRangeLabel(range, rangeBounds),
      rangeBounds,
      title: studentId && studentId !== viewerId ? 'Student statistics' : 'Your statistics',
      streakDays: streak.streakDays,
      kpis,
      lessons: this.buildLessonsSection(current),
      vocabulary: this.buildVocabularySection(current),
      practice: this.buildPracticeSection(current),
      quiz: {
        attempts: current.quizAttempts,
        perfectAttempts: current.quizPerfect,
        bestScorePercent: Math.round(current.quizBestScore),
        questionsCorrect: current.quizQuestionsCorrect,
      },
      speaking: {
        submissions: current.speakingSubmissions,
        reviewsReceived: current.speakingReviewed,
        minutes: Math.round(current.speakingSec / 60),
      },
      dailyGoals,
    };
  }

  private async dashboardForStaffSubject(
    viewer: { id: string; role: UserRole },
    staffUserId: string,
    range: StatsRange,
    statisticsFocus: StatisticsDashboardFocus,
    now: Date,
    rangeFrom?: string,
    rangeTo?: string,
  ): Promise<StatisticsDashboardDto> {
    if (viewer.role !== 'ADMIN' && viewer.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException();
    }

    const subject = await this.prisma.user.findUnique({
      where: { id: staffUserId },
      select: { id: true, role: true, displayName: true },
    });
    if (!subject) {
      throw new NotFoundException('Staff member not found');
    }
    if (subject.role === 'STUDENT') {
      throw new BadRequestException('User is not staff');
    }

    return this.dashboardForStaff(
      subject,
      range,
      'my_students',
      statisticsFocus,
      now,
      rangeFrom,
      rangeTo,
      `${subject.displayName} statistics`,
    );
  }

  private staffTitle(role: UserRole): string {
    if (role === 'TEACHER') return 'Teacher statistics';
    if (role === 'ADMIN') return 'Admin statistics';
    if (role === 'SUPER_ADMIN') return 'Super-admin statistics';
    return 'Statistics';
  }

  private staffLayout(role: UserRole): StatisticsDashboardLayout {
    if (role === 'TEACHER') return 'teacher';
    if (role === 'ADMIN') return 'admin';
    return 'super_admin';
  }

  private resolveRangeBounds(
    range: StatsRange,
    now: Date,
    rangeFrom?: string,
    rangeTo?: string,
  ) {
    try {
      return resolveStatsRangeBounds(
        range,
        now,
        rangeFrom && rangeTo ? { from: rangeFrom, to: rangeTo } : undefined,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid statistics range';
      throw new BadRequestException(message);
    }
  }

  private async resolveStaffStudentScope(
    viewer: { id: string; role: UserRole },
    studentScope?: StatisticsStudentScope,
  ): Promise<StatisticsStudentScope> {
    if (viewer.role === 'TEACHER') return 'my_students';
    if (studentScope === 'all' || studentScope === 'my_students') return studentScope;

    if (viewer.role === 'ADMIN') return 'my_students';

    const myStudentCount = await this.prisma.user.count({
      where: { role: 'STUDENT', teacherId: viewer.id },
    });
    return myStudentCount > 0 ? 'my_students' : 'all';
  }

  private studentWhereForScope(
    viewer: { id: string; role: UserRole },
    scope: StatisticsStudentScope,
  ): Prisma.UserWhereInput {
    if (scope === 'my_students') {
      return { role: 'STUDENT', teacherId: viewer.id };
    }
    return { role: 'STUDENT' };
  }

  private lessonScopeForStaff(
    viewer: { id: string; role: UserRole },
    scope: StatisticsStudentScope,
  ): Prisma.ScheduledLessonWhereInput {
    if (viewer.role === 'TEACHER') {
      return { teacherId: viewer.id };
    }
    if (scope === 'my_students') {
      return { student: { teacherId: viewer.id } };
    }
    return {};
  }

  private async dashboardForStaff(
    viewer: { id: string; role: UserRole },
    range: StatsRange,
    studentScopeInput: StatisticsStudentScope | undefined,
    statisticsFocus: StatisticsDashboardFocus,
    now: Date,
    rangeFrom?: string,
    rangeTo?: string,
    titleOverride?: string,
  ): Promise<StatisticsDashboardDto> {
    if (viewer.role === 'STUDENT') {
      throw new ForbiddenException();
    }

    const scope = await this.resolveStaffStudentScope(viewer, studentScopeInput);
    const rangeBounds = this.resolveRangeBounds(range, now, rangeFrom, rangeTo);
    const previousBounds = previousStatsRangeBounds(rangeBounds);
    const lessonScope = this.lessonScopeForStaff(viewer, scope);
    const studentWhere = this.studentWhereForScope(viewer, scope);
    const from = new Date(rangeBounds.from);
    const to = new Date(rangeBounds.to);

    const rosterStudents = await this.prisma.user.findMany({
      where: studentWhere,
      select: { id: true, displayName: true },
      orderBy: { displayName: 'asc' },
      take: 100,
    });
    const rosterStudentIds = rosterStudents.map((s) => s.id);

    const [
      current,
      previous,
      rosterBuild,
      totalStudents,
      studentCount,
      teacherCount,
      speakingReviewsDone,
      speakingPendingReview,
      schoolQuizAttempts,
      schoolWordsAdded,
      schoolSpeakingSubmissions,
    ] = await Promise.all([
      this.snapshotStaffPeriod(lessonScope, rangeBounds),
      this.snapshotStaffPeriod(lessonScope, previousBounds),
      this.buildStudentRoster(
        rosterStudents,
        lessonScope,
        rangeBounds,
        statisticsFocus === 'operations' && viewer.role !== 'TEACHER',
      ),
      this.prisma.user.count({ where: studentWhere }),
      viewer.role !== 'TEACHER'
        ? this.prisma.user.count({ where: { role: 'STUDENT' } })
        : Promise.resolve(0),
      viewer.role !== 'TEACHER'
        ? this.prisma.user.count({
            where: { role: { in: ['TEACHER', 'ADMIN', 'SUPER_ADMIN'] } },
          })
        : Promise.resolve(0),
      viewer.role === 'TEACHER' || scope === 'my_students'
        ? this.prisma.speakingSubmission.count({
            where: {
              reviewedById: viewer.id,
              reviewedAt: { gte: from, lte: to },
            },
          })
        : Promise.resolve(0),
      viewer.role === 'TEACHER' || scope === 'my_students'
        ? this.prisma.speakingSubmission.count({
            where: {
              status: { not: 'REVIEWED' },
              submittedAt: { gte: from, lte: to },
              student: { teacherId: viewer.id },
            },
          })
        : Promise.resolve(0),
      viewer.role !== 'TEACHER'
        ? this.prisma.quizAttempt.count({
            where: {
              finishedAt: { not: null, gte: from, lte: to },
              ...(rosterStudentIds.length
                ? { studentId: { in: rosterStudentIds } }
                : {}),
            },
          })
        : Promise.resolve(0),
      viewer.role === 'SUPER_ADMIN'
        ? this.prisma.studentWordCard.count({
            where: {
              createdAt: { gte: from, lte: to },
              ...(rosterStudentIds.length ? { userId: { in: rosterStudentIds } } : {}),
            },
          })
        : Promise.resolve(0),
      viewer.role === 'SUPER_ADMIN'
        ? this.prisma.speakingSubmission.count({
            where: {
              submittedAt: { gte: from, lte: to },
              ...(rosterStudentIds.length ? { studentId: { in: rosterStudentIds } } : {}),
            },
          })
        : Promise.resolve(0),
    ]);

    const roster = rosterBuild.rows;
    const billingOverview = rosterBuild.billingOverview;

    const inactiveStudents = roster.filter((row) => this.rosterRowIsInactive(row)).length;
    const staffOverview = {
      totalStudents,
      activeStudents: current.activeStudentIds.size,
      inactiveStudents,
      homeworkReviewed: current.homeworkReviewed,
      speakingReviewsDone,
      speakingPendingReview,
    };

    const lessonsInPeriod =
      current.lessonsPlanned + current.lessonsCompleted + current.lessonsCancelled;
    const schoolOverview =
      viewer.role !== 'TEACHER' && scope === 'all'
        ? {
            studentCount,
            teacherCount,
            lessonsInPeriod,
            utilizationPercent: lessonsInPeriod
              ? Math.round((current.lessonsCompleted / lessonsInPeriod) * 100)
              : 0,
          }
        : undefined;

    const title =
      titleOverride ??
      (scope === 'my_students' && viewer.role !== 'TEACHER'
        ? 'My students statistics'
        : this.staffTitle(viewer.role));

    const kpis = this.buildStaffKpis({
      layout: this.staffLayout(viewer.role),
      scope,
      focus: statisticsFocus,
      current,
      previous,
      staffOverview,
      schoolOverview,
      billingOverview,
      schoolQuizAttempts,
      schoolWordsAdded,
      schoolSpeakingSubmissions,
    });

    const staffEarnings =
      statisticsFocus === 'operations' &&
      (viewer.role === 'TEACHER' ||
        viewer.role === 'ADMIN' ||
        viewer.role === 'SUPER_ADMIN')
        ? await this.staffPayroll.buildMyEarnings(
            viewer.id,
            range,
            rangeBounds,
            statsRangeLabel(range, rangeBounds),
          )
        : undefined;

    return {
      layout: this.staffLayout(viewer.role),
      subjectRole: viewer.role.toLowerCase(),
      range,
      studentScope: scope,
      statisticsFocus,
      rangeLabel: statsRangeLabel(range, rangeBounds),
      rangeBounds,
      title,
      streakDays: 0,
      kpis,
      lessons: this.buildLessonsSection(current),
      staffOverview,
      schoolOverview,
      roster,
      billingOverview,
      staffEarnings,
    };
  }

  private rosterRowIsInactive(row: StatisticsRosterEntryDto): boolean {
    return (
      row.completedLessons === 0 &&
      row.practiceMinutes === 0 &&
      row.quizAttempts === 0 &&
      row.speakingSubmissions === 0 &&
      row.wordsAdded === 0
    );
  }

  private async snapshotStaffPeriod(
    lessonScope: Prisma.ScheduledLessonWhereInput,
    bounds: StatsDateRange,
  ): Promise<StaffPeriodSnapshot> {
    const from = new Date(bounds.from);
    const to = new Date(bounds.to);
    const fromKey = utcDateKey(from);
    const toKey = utcDateKey(to);

    const lessons = await this.prisma.scheduledLesson.findMany({
      where: {
        ...lessonScope,
        date: { gte: fromKey, lte: toKey },
      },
      select: {
        date: true,
        status: true,
        credited: true,
        duration: true,
        homeworkChecked: true,
        studentId: true,
        kind: true,
      },
    });

    const snap = this.emptySnapshot() as StaffPeriodSnapshot;
    snap.homeworkReviewed = 0;
    snap.activeStudentIds = new Set<string>();
    snap.groupLessonsCompleted = 0;

    for (const lesson of lessons) {
      snap.activeStudentIds.add(lesson.studentId);
      const bucket = lesson.date;
      if (lesson.status === 'COMPLETED') {
        snap.lessonTrend.set(bucket, (snap.lessonTrend.get(bucket) ?? 0) + 1);
      }
      if (lesson.status === 'PLANNED') snap.lessonsPlanned += 1;
      if (lesson.status === 'COMPLETED') {
        snap.lessonsCompleted += 1;
        snap.lessonMinutes += lesson.duration ?? 0;
        if (lesson.kind === 'GROUP') snap.groupLessonsCompleted += 1;
      }
      if (lesson.status === 'CANCELLED') {
        snap.lessonsCancelled += 1;
        if (lesson.credited) snap.lessonsCredited += 1;
      }
      if (lesson.homeworkChecked) snap.homeworkReviewed += 1;
    }

    return snap;
  }

  private async loadPlatformLessonPricing(): Promise<{
    defaultCurrency: string;
    config: Pick<
      PaymentConfigDto,
      'defaultCurrency' | 'defaultPricePerLessonMinor' | 'pricePerLessonByCurrency'
    >;
  }> {
    const row = await this.prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: { paymentConfig: true },
    });
    const raw = row?.paymentConfig ?? {};
    const obj =
      typeof raw === 'object' && raw != null ? (raw as Record<string, unknown>) : {};
    const defaultCurrencyRaw =
      typeof obj['defaultCurrency'] === 'string' ? obj['defaultCurrency'] : 'UAH';
    const defaultCurrency: PaymentCurrencyCode = isPaymentCurrencyCode(defaultCurrencyRaw)
      ? defaultCurrencyRaw
      : 'UAH';
    const defaultPricePerLessonMinor =
      typeof obj['defaultPricePerLessonMinor'] === 'number'
        ? Math.max(0, Math.round(obj['defaultPricePerLessonMinor']))
        : 0;
    const pricePerLessonByCurrency = Array.isArray(obj['pricePerLessonByCurrency'])
      ? obj['pricePerLessonByCurrency']
          .map((entry) => {
            if (typeof entry !== 'object' || entry == null) return null;
            const rowEntry = entry as Record<string, unknown>;
            const currencyRaw =
              typeof rowEntry['currency'] === 'string' ? rowEntry['currency'] : null;
            const pricePerLessonMinor =
              typeof rowEntry['pricePerLessonMinor'] === 'number'
                ? Math.max(0, Math.round(rowEntry['pricePerLessonMinor']))
                : null;
            if (!currencyRaw || !isPaymentCurrencyCode(currencyRaw) || pricePerLessonMinor == null) {
              return null;
            }
            return { currency: currencyRaw, pricePerLessonMinor };
          })
          .filter((x): x is { currency: PaymentCurrencyCode; pricePerLessonMinor: number } => x != null)
      : undefined;
    return {
      defaultCurrency,
      config: {
        defaultCurrency,
        defaultPricePerLessonMinor,
        pricePerLessonByCurrency,
      },
    };
  }

  private async buildStudentRoster(
    students: Array<{ id: string; displayName: string | null }>,
    lessonScope: Prisma.ScheduledLessonWhereInput,
    bounds: StatsDateRange,
    includeBilling = false,
  ): Promise<{ rows: StatisticsRosterEntryDto[]; billingOverview?: StatisticsBillingOverviewDto }> {
    if (students.length === 0) return { rows: [] };

    const from = new Date(bounds.from);
    const to = new Date(bounds.to);
    const fromKey = utcDateKey(from);
    const toKey = utcDateKey(to);
    const studentIds = students.map((s) => s.id);
    const nameById = new Map(students.map((s) => [s.id, s.displayName ?? 'Student']));

    const lessonAgg = new Map<
      string,
      {
        completed: number;
        planned: number;
        cancelled: number;
        cancelledCredited: number;
        minutes: number;
        homeworkReviewed: number;
        groupCompleted: number;
        individualCompleted: number;
      }
    >();
    for (const id of studentIds) {
      lessonAgg.set(id, {
        completed: 0,
        planned: 0,
        cancelled: 0,
        cancelledCredited: 0,
        minutes: 0,
        homeworkReviewed: 0,
        groupCompleted: 0,
        individualCompleted: 0,
      });
    }

    const billingFetches = includeBilling
      ? Promise.all([
          this.loadPlatformLessonPricing(),
          this.prisma.studentLessonBalance.findMany({
            where: { userId: { in: studentIds } },
            select: { userId: true, pricePerLessonMinor: true },
          }),
          this.prisma.payment.groupBy({
            by: ['userId'],
            where: {
              userId: { in: studentIds },
              status: 'SUCCEEDED',
              createdAt: { gte: from, lte: to },
            },
            _sum: { amountMinor: true },
          }),
          this.prisma.lessonBalanceLedger.groupBy({
            by: ['userId'],
            where: {
              userId: { in: studentIds },
              kind: { in: ['PURCHASE', 'MANUAL_CREDIT'] },
              createdAt: { gte: from, lte: to },
            },
            _sum: { delta: true },
          }),
          this.prisma.lessonBalanceLedger.groupBy({
            by: ['userId'],
            where: {
              userId: { in: studentIds },
              kind: 'GROUP_CHARGE',
              createdAt: { gte: from, lte: to },
            },
            _sum: { amountMinor: true },
          }),
        ])
      : Promise.resolve(null);

    const [
      lessons,
      practiceRows,
      wordsAddedRows,
      wordsLearnedRows,
      quizRows,
      speakingRows,
      billingData,
    ] = await Promise.all([
      this.prisma.scheduledLesson.findMany({
        where: {
          ...lessonScope,
          OR: [
            { studentId: { in: studentIds } },
            { participants: { some: { userId: { in: studentIds } } } },
          ],
          date: { gte: fromKey, lte: toKey },
        },
        select: {
          id: true,
          studentId: true,
          kind: true,
          status: true,
          duration: true,
          homeworkChecked: true,
          credited: true,
          participants: { select: { userId: true } },
        },
      }),
      this.prisma.practiceSession.groupBy({
        by: ['userId'],
        where: {
          userId: { in: studentIds },
          source: PracticeSessionSource.PRACTICE,
          startedAt: { gte: from, lte: to },
        },
        _sum: { durationSec: true },
      }),
      this.prisma.studentWordCard.groupBy({
        by: ['userId'],
        where: { userId: { in: studentIds }, createdAt: { gte: from, lte: to } },
        _count: { _all: true },
      }),
      this.prisma.studentWordCard.findMany({
        where: {
          userId: { in: studentIds },
          knownAt: { gte: from, lte: to },
        },
        select: { userId: true },
      }),
      this.prisma.quizAttempt.groupBy({
        by: ['studentId'],
        where: {
          studentId: { in: studentIds },
          finishedAt: { not: null, gte: from, lte: to },
        },
        _count: { _all: true },
      }),
      this.prisma.speakingSubmission.groupBy({
        by: ['studentId'],
        where: {
          studentId: { in: studentIds },
          submittedAt: { gte: from, lte: to },
        },
        _count: { _all: true },
      }),
      billingFetches,
    ]);

    for (const lesson of lessons) {
      const attributed = new Set<string>();
      if (studentIds.includes(lesson.studentId)) attributed.add(lesson.studentId);
      for (const participant of lesson.participants) {
        if (studentIds.includes(participant.userId)) attributed.add(participant.userId);
      }
      for (const studentId of attributed) {
        const row = lessonAgg.get(studentId)!;
        if (lesson.status === 'PLANNED') row.planned += 1;
        if (lesson.status === 'COMPLETED') {
          row.completed += 1;
          row.minutes += lesson.duration ?? 0;
          if (lesson.kind === 'GROUP') row.groupCompleted += 1;
          else row.individualCompleted += 1;
        }
        if (lesson.status === 'CANCELLED') {
          row.cancelled += 1;
          if (lesson.credited) row.cancelledCredited += 1;
        }
        if (lesson.homeworkChecked) row.homeworkReviewed += 1;
      }
    }

    const practiceByStudent = new Map(
      practiceRows.map((r) => [r.userId, Math.round((r._sum.durationSec ?? 0) / 60)]),
    );
    const wordsAddedByStudent = new Map(wordsAddedRows.map((r) => [r.userId, r._count._all]));
    const wordsLearnedByStudent = new Map<string, number>();
    for (const card of wordsLearnedRows) {
      wordsLearnedByStudent.set(card.userId, (wordsLearnedByStudent.get(card.userId) ?? 0) + 1);
    }
    const quizByStudent = new Map(quizRows.map((r) => [r.studentId, r._count._all]));
    const speakingByStudent = new Map(speakingRows.map((r) => [r.studentId, r._count._all]));

    const streakByStudent = new Map<string, number>();
    if (studentIds.length <= 30) {
      const streaks = await Promise.all(
        studentIds.map((id) => this.streaks.snapshotForStudent(id)),
      );
      studentIds.forEach((id, index) => {
        streakByStudent.set(id, streaks[index]?.streakDays ?? 0);
      });
    }

    let pricing:
      | Awaited<ReturnType<StatisticsDashboardService['loadPlatformLessonPricing']>>
      | undefined;
    const customPriceByStudent = new Map<string, number | null>();
    const paidByStudent = new Map<string, number>();
    const grantedByStudent = new Map<string, number>();
    const groupChargeByStudent = new Map<string, number>();

    if (billingData) {
      const [platformPricing, balances, payments, ledger, groupCharges] = billingData;
      pricing = platformPricing;
      for (const balance of balances) {
        customPriceByStudent.set(balance.userId, balance.pricePerLessonMinor);
      }
      for (const payment of payments) {
        paidByStudent.set(payment.userId, payment._sum.amountMinor ?? 0);
      }
      for (const entry of ledger) {
        grantedByStudent.set(entry.userId, Math.max(0, entry._sum.delta ?? 0));
      }
      for (const entry of groupCharges) {
        groupChargeByStudent.set(entry.userId, entry._sum.amountMinor ?? 0);
      }
    }

    const defaultCurrency = pricing?.defaultCurrency ?? 'UAH';
    let totalPaidInPeriodMinor = 0;
    let totalLessonsGrantedInPeriod = 0;
    let totalBillableMinor = 0;
    const completedGroupLessonIds = new Set(
      lessons
        .filter((lesson) => lesson.kind === 'GROUP' && lesson.status === 'COMPLETED')
        .map((lesson) => lesson.id),
    );
    let groupRevenueMinor = 0;
    for (const amount of groupChargeByStudent.values()) {
      groupRevenueMinor += amount;
    }

    const rows: StatisticsRosterEntryDto[] = studentIds.map((studentId) => {
      const lessonsRow = lessonAgg.get(studentId)!;
      const customPrice = customPriceByStudent.get(studentId);
      const resolvedPrice =
        includeBilling && pricing
          ? customPrice != null
            ? customPrice
            : getPricePerLessonForCurrency(pricing.config, defaultCurrency)
          : undefined;
      const paidInPeriodMinor = paidByStudent.get(studentId) ?? 0;
      const lessonsGrantedInPeriod = grantedByStudent.get(studentId) ?? 0;
      const creditBillable =
        resolvedPrice != null ? lessonsRow.completed * resolvedPrice : 0;
      const groupChargeMinor = groupChargeByStudent.get(studentId) ?? 0;
      const billableMinor =
        includeBilling && (resolvedPrice != null || groupChargeMinor > 0)
          ? creditBillable + groupChargeMinor
          : undefined;
      const lessonTypeParts: string[] = [];
      if (lessonsRow.individualCompleted > 0) {
        lessonTypeParts.push(`${lessonsRow.individualCompleted}× 1:1`);
      }
      if (lessonsRow.groupCompleted > 0) {
        lessonTypeParts.push(`${lessonsRow.groupCompleted}× Group`);
      }
      const lessonTypeLabel = lessonTypeParts.length ? lessonTypeParts.join(', ') : '—';

      if (includeBilling) {
        totalPaidInPeriodMinor += paidInPeriodMinor;
        totalLessonsGrantedInPeriod += lessonsGrantedInPeriod;
        totalBillableMinor += billableMinor ?? 0;
      }

      return {
        studentId,
        displayName: nameById.get(studentId) ?? 'Student',
        completedLessons: lessonsRow.completed,
        lessonTypeLabel,
        groupLessonsCompleted: lessonsRow.groupCompleted,
        individualLessonsCompleted: lessonsRow.individualCompleted,
        plannedLessons: lessonsRow.planned,
        cancelledLessons: lessonsRow.cancelled,
        cancelledCredited: lessonsRow.cancelledCredited,
        lessonHours: Number((lessonsRow.minutes / 60).toFixed(1)),
        practiceMinutes: practiceByStudent.get(studentId) ?? 0,
        wordsAdded: wordsAddedByStudent.get(studentId) ?? 0,
        wordsLearned: wordsLearnedByStudent.get(studentId) ?? 0,
        quizAttempts: quizByStudent.get(studentId) ?? 0,
        speakingSubmissions: speakingByStudent.get(studentId) ?? 0,
        homeworkReviewed: lessonsRow.homeworkReviewed,
        streakDays: streakByStudent.get(studentId) ?? 0,
        ...(includeBilling
          ? {
              pricePerLessonMinor: resolvedPrice ?? 0,
              currency: defaultCurrency,
              paidInPeriodMinor,
              lessonsGrantedInPeriod,
              billableMinor: billableMinor ?? 0,
            }
          : {}),
      };
    });

    const sorted = rows.sort((a, b) => {
      const scoreA =
        a.completedLessons * 10 +
        a.practiceMinutes +
        a.quizAttempts +
        a.speakingSubmissions +
        (a.paidInPeriodMinor ?? 0) / 1000;
      const scoreB =
        b.completedLessons * 10 +
        b.practiceMinutes +
        b.quizAttempts +
        b.speakingSubmissions +
        (b.paidInPeriodMinor ?? 0) / 1000;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.displayName.localeCompare(b.displayName);
    });

    return {
      rows: sorted,
      billingOverview: includeBilling
        ? {
            currency: defaultCurrency,
            totalPaidInPeriodMinor,
            totalLessonsGrantedInPeriod,
            totalBillableMinor,
            groupLessonsCount: completedGroupLessonIds.size,
            groupRevenueMinor,
          }
        : undefined,
    };
  }

  private buildStaffKpis(params: {
    layout: StatisticsDashboardLayout;
    scope: StatisticsStudentScope;
    focus: StatisticsDashboardFocus;
    current: StaffPeriodSnapshot;
    previous: StaffPeriodSnapshot;
    staffOverview: {
      totalStudents: number;
      activeStudents: number;
      inactiveStudents: number;
      homeworkReviewed: number;
      speakingReviewsDone: number;
      speakingPendingReview: number;
    };
    schoolOverview?: {
      studentCount: number;
      teacherCount: number;
      lessonsInPeriod: number;
      utilizationPercent: number;
    };
    billingOverview?: StatisticsBillingOverviewDto;
    schoolQuizAttempts: number;
    schoolWordsAdded: number;
    schoolSpeakingSubmissions: number;
  }): StatisticsKpiDto[] {
    const { layout, focus, current, previous, staffOverview, schoolOverview, billingOverview } =
      params;
    const lessonTotal =
      current.lessonsPlanned + current.lessonsCompleted + current.lessonsCancelled;
    const completionRate = lessonTotal
      ? Math.round((current.lessonsCompleted / lessonTotal) * 100)
      : 0;
    const prevLessonTotal =
      previous.lessonsPlanned + previous.lessonsCompleted + previous.lessonsCancelled;
    const prevCompletionRate = prevLessonTotal
      ? Math.round((previous.lessonsCompleted / prevLessonTotal) * 100)
      : 0;
    const cancelRate = lessonTotal
      ? Math.round((current.lessonsCancelled / lessonTotal) * 100)
      : 0;
    const prevCancelRate = prevLessonTotal
      ? Math.round((previous.lessonsCancelled / prevLessonTotal) * 100)
      : 0;

    const kpis: StatisticsKpiDto[] = [
      this.kpi(
        'staff-active-students',
        'roster',
        'Active students',
        staffOverview.activeStudents,
        previous.activeStudentIds.size,
      ),
      this.kpi(
        'staff-roster-size',
        'roster',
        layout === 'teacher' || params.scope === 'my_students'
          ? 'Students on roster'
          : 'Students (school)',
        staffOverview.totalStudents,
        staffOverview.totalStudents,
        '',
        'flat',
      ),
      this.kpi(
        'staff-inactive',
        'roster',
        'Inactive in period',
        staffOverview.inactiveStudents,
        0,
      ),
      this.kpi(
        'lessons-completed',
        'lessons',
        'Completed lessons',
        current.lessonsCompleted,
        previous.lessonsCompleted,
      ),
      this.kpi(
        'group-lessons-completed',
        'lessons',
        'Group lessons completed',
        current.groupLessonsCompleted,
        previous.groupLessonsCompleted,
      ),
      this.kpi(
        'lessons-hours',
        'lessons',
        'Lesson hours',
        Number((current.lessonMinutes / 60).toFixed(1)),
        Number((previous.lessonMinutes / 60).toFixed(1)),
        'h',
      ),
      this.kpi(
        'lessons-rate',
        'lessons',
        'Completion rate',
        completionRate,
        prevCompletionRate,
        '%',
        'pp',
      ),
      this.kpi('lessons-cancel-rate', 'lessons', 'Cancellation rate', cancelRate, prevCancelRate, '%', 'pp'),
      this.kpi(
        'homework-reviewed',
        'lessons',
        'Homework reviewed',
        staffOverview.homeworkReviewed,
        previous.homeworkReviewed,
      ),
    ];

    if (layout === 'teacher' || params.scope === 'my_students') {
      kpis.push(
        this.kpi(
          'speaking-reviewed',
          'speaking',
          'Speaking reviews done',
          staffOverview.speakingReviewsDone,
          0,
        ),
        this.kpi(
          'speaking-pending',
          'speaking',
          'Speaking awaiting review',
          staffOverview.speakingPendingReview,
          0,
        ),
      );
    }

    if (schoolOverview && layout !== 'teacher' && params.scope === 'all') {
      kpis.push(
        this.kpi('school-teachers', 'school', 'Teachers', schoolOverview.teacherCount, schoolOverview.teacherCount, '', 'flat'),
        this.kpi(
          'school-utilization',
          'school',
          'Lesson utilization',
          schoolOverview.utilizationPercent,
          schoolOverview.utilizationPercent,
          '%',
          'flat',
        ),
      );
    }

    if (layout !== 'teacher' && focus === 'operations' && billingOverview) {
      const { currency, totalPaidInPeriodMinor, totalLessonsGrantedInPeriod, totalBillableMinor } =
        billingOverview;
      kpis.push(
        this.kpiMoney('billing-paid', 'Paid in period', totalPaidInPeriodMinor, currency),
        this.kpi(
          'billing-lessons-credited',
          'billing',
          'Lessons credited',
          totalLessonsGrantedInPeriod,
          0,
        ),
        this.kpiMoney('billing-billable', 'Billable (completed × rate)', totalBillableMinor, currency),
      );
    }

    if (layout !== 'teacher' && focus === 'learning') {
      kpis.push(
        this.kpi(
          'school-quizzes',
          'quiz',
          'Quizzes completed',
          params.schoolQuizAttempts,
          0,
        ),
      );
      if (layout === 'super_admin') {
        kpis.push(
          this.kpi('school-words-added', 'vocabulary', 'New words added', params.schoolWordsAdded, 0),
          this.kpi(
            'school-speaking-sub',
            'speaking',
            'Speaking submissions',
            params.schoolSpeakingSubmissions,
            0,
          ),
        );
      }
    }

    return kpis;
  }

  private kpiMoney(
    id: string,
    label: string,
    amountMinor: number,
    currency: string,
  ): StatisticsKpiDto {
    const major = amountMinor / 100;
    const formatted = Number.isInteger(major) ? `${major}` : major.toFixed(2);
    return {
      id,
      category: 'billing',
      label,
      value: `${formatted} ${currency}`,
      deltaLabel: '',
      trend: 'flat',
    };
  }

  private async resolveStudentSubjectId(
    viewer: { id: string; role: UserRole },
    studentId?: string,
  ): Promise<string | null> {
    if (viewer.role === 'STUDENT') {
      if (studentId && studentId !== viewer.id) {
        throw new ForbiddenException('Students can only view their own statistics');
      }
      return viewer.id;
    }

    if (!studentId) return null;

    const target = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true, teacherId: true },
    });
    if (!target) throw new UnauthorizedException();
    if (target.role !== 'STUDENT') {
      throw new ForbiddenException('Statistics subject must be a student');
    }
    if (viewer.role === 'TEACHER' && target.teacherId !== viewer.id) {
      throw new ForbiddenException('You can only view statistics for your own students');
    }
    return target.id;
  }

  private async snapshotStudentPeriod(
    studentId: string,
    bounds: StatsDateRange,
  ): Promise<StudentPeriodSnapshot> {
    const from = new Date(bounds.from);
    const to = new Date(bounds.to);
    const fromKey = utcDateKey(from);
    const toKey = utcDateKey(to);

    const [lessons, cards, vocabStatusRows, practiceSessions, quizAttempts, speakingSubmissions] =
      await Promise.all([
        this.prisma.scheduledLesson.findMany({
          where: { studentId, date: { gte: fromKey, lte: toKey } },
          select: { date: true, status: true, credited: true, duration: true },
        }),
        this.prisma.studentWordCard.findMany({
          where: {
            userId: studentId,
            OR: [
              { createdAt: { gte: from, lte: to } },
              { lastReviewedAt: { gte: from, lte: to } },
              { knownAt: { gte: from, lte: to } },
            ],
          },
          select: {
            createdAt: true,
            lastReviewedAt: true,
            knownAt: true,
          },
        }),
        this.prisma.studentWordCard.groupBy({
          by: ['status'],
          where: { userId: studentId },
          _count: { _all: true },
        }),
        this.prisma.practiceSession.findMany({
          where: {
            userId: studentId,
            source: PracticeSessionSource.PRACTICE,
            startedAt: { gte: from, lte: to },
          },
          select: { kind: true, durationSec: true, startedAt: true },
        }),
        this.prisma.quizAttempt.findMany({
          where: {
            studentId,
            finishedAt: { not: null, gte: from, lte: to },
          },
          select: { score: true, correctCount: true, totalCount: true, finishedAt: true },
        }),
        this.prisma.speakingSubmission.findMany({
          where: {
            studentId,
            submittedAt: { gte: from, lte: to },
          },
          select: { status: true, durationSec: true },
        }),
      ]);

    const snap = this.emptySnapshot();

    for (const lesson of lessons) {
      const bucket = lesson.date;
      snap.lessonTrend.set(bucket, (snap.lessonTrend.get(bucket) ?? 0) + 1);
      if (lesson.status === 'PLANNED') snap.lessonsPlanned += 1;
      if (lesson.status === 'COMPLETED') {
        snap.lessonsCompleted += 1;
        snap.lessonMinutes += lesson.duration ?? 0;
      }
      if (lesson.status === 'CANCELLED') {
        snap.lessonsCancelled += 1;
        if (lesson.credited) snap.lessonsCredited += 1;
      }
    }

    for (const row of vocabStatusRows) {
      snap.vocabStatus[row.status] = row._count._all;
    }

    for (const card of cards) {
      if (isoInRange(card.createdAt.toISOString(), from, to)) {
        snap.vocabAdded += 1;
        const key = utcDateKey(card.createdAt);
        const row = snap.vocabTrend.get(key) ?? { added: 0, known: 0, reviewed: 0 };
        row.added += 1;
        snap.vocabTrend.set(key, row);
      }
      if (card.lastReviewedAt && isoInRange(card.lastReviewedAt.toISOString(), from, to)) {
        snap.vocabReviewed += 1;
        const key = utcDateKey(card.lastReviewedAt);
        const row = snap.vocabTrend.get(key) ?? { added: 0, known: 0, reviewed: 0 };
        row.reviewed += 1;
        snap.vocabTrend.set(key, row);
      }
      if (card.knownAt && isoInRange(card.knownAt.toISOString(), from, to)) {
        snap.vocabLearned += 1;
        const key = utcDateKey(card.knownAt);
        const row = snap.vocabTrend.get(key) ?? { added: 0, known: 0, reviewed: 0 };
        row.known += 1;
        snap.vocabTrend.set(key, row);
      }
    }

    for (const session of practiceSessions) {
      const kind = session.kind;
      snap.practiceSecByKind[kind] = (snap.practiceSecByKind[kind] ?? 0) + session.durationSec;
      const key = utcDateKey(session.startedAt);
      const bucket = snap.practiceTrend.get(key) ?? {};
      bucket[kind] = (bucket[kind] ?? 0) + session.durationSec;
      snap.practiceTrend.set(key, bucket);
    }

    for (const attempt of quizAttempts) {
      snap.quizAttempts += 1;
      snap.quizQuestionsCorrect += attempt.correctCount;
      const score =
        attempt.score ??
        (attempt.totalCount > 0 ? (attempt.correctCount / attempt.totalCount) * 100 : 0);
      if (score >= 99.5) snap.quizPerfect += 1;
      if (score > snap.quizBestScore) snap.quizBestScore = score;
    }

    for (const sub of speakingSubmissions) {
      snap.speakingSubmissions += 1;
      if (sub.status === 'REVIEWED') snap.speakingReviewed += 1;
      snap.speakingSec += sub.durationSec ?? 0;
    }

    return snap;
  }

  private emptySnapshot(): StudentPeriodSnapshot {
    return {
      lessonsPlanned: 0,
      lessonsCompleted: 0,
      lessonsCancelled: 0,
      lessonsCredited: 0,
      lessonMinutes: 0,
      lessonTrend: new Map(),
      vocabAdded: 0,
      vocabReviewed: 0,
      vocabLearned: 0,
      vocabStatus: {},
      vocabTrend: new Map(),
      practiceSecByKind: {},
      practiceTrend: new Map(),
      quizAttempts: 0,
      quizPerfect: 0,
      quizBestScore: 0,
      quizQuestionsCorrect: 0,
      speakingSubmissions: 0,
      speakingReviewed: 0,
      speakingSec: 0,
    };
  }

  private async snapshotDailyGoals(
    studentId: string,
    bounds: StatsDateRange,
    now: Date,
  ) {
    const from = new Date(bounds.from);
    const to = new Date(bounds.to);
    const dayKeys = listUtcDateKeysInRange(from, to, 90);
    let slotsCompleted = 0;
    let daysWithAllGoals = 0;
    const trend: Array<{ label: string; completionPercent: number; slotsCompleted: number }> = [];

    for (const dateKey of dayKeys) {
      const goals = getDailyGoalsForUser(studentId, dateKey);
      const progress = await this.dailyGoalProgress.evaluateForGoals(studentId, goals, dateKey);
      let done = 0;
      for (const goal of goals) {
        if (progress.get(goal.id)?.done) done += 1;
      }
      slotsCompleted += done;
      if (done === 4) daysWithAllGoals += 1;
      const label = new Date(`${dateKey}T12:00:00.000Z`).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC',
      });
      trend.push({
        label,
        slotsCompleted: done,
        completionPercent: Math.round((done / 4) * 100),
      });
    }

    return {
      slotsCompleted,
      slotsAvailable: dayKeys.length * 4,
      daysWithAllGoals,
      daysInRange: dayKeys.length,
      trend,
    };
  }

  private buildLessonsSection(s: StudentPeriodSnapshot & { groupLessonsCompleted?: number }) {
    const total = s.lessonsPlanned + s.lessonsCompleted + s.lessonsCancelled;
    return {
      planned: s.lessonsPlanned,
      completed: s.lessonsCompleted,
      cancelled: s.lessonsCancelled,
      credited: s.lessonsCredited,
      completionRatePercent: total ? Math.round((s.lessonsCompleted / total) * 100) : 0,
      hours: Number((s.lessonMinutes / 60).toFixed(1)),
      groupLessonsCompleted: s.groupLessonsCompleted,
      trend: [...s.lessonTrend.entries()].map(([label, value]) => ({ label, value })),
      statusBreakdown: [
        { id: 'completed', label: 'Completed', value: s.lessonsCompleted },
        { id: 'cancelled', label: 'Cancelled', value: s.lessonsCancelled },
        { id: 'planned', label: 'Planned', value: s.lessonsPlanned },
      ],
    };
  }

  private buildVocabularySection(s: StudentPeriodSnapshot) {
    return {
      wordsAdded: s.vocabAdded,
      wordsReviewed: s.vocabReviewed,
      wordsMarkedLearned: s.vocabLearned,
      trend: [...s.vocabTrend.entries()].map(([label, row]) => ({
        label,
        added: row.added,
        known: row.known,
        reviewed: row.reviewed,
      })),
      statusBreakdown: [
        { id: 'NEW', label: 'New', value: s.vocabStatus.NEW ?? 0 },
        { id: 'REPEATED', label: 'Learning', value: s.vocabStatus.REPEATED ?? 0 },
        { id: 'MISTAKES_WORK', label: 'Review', value: s.vocabStatus.MISTAKES_WORK ?? 0 },
        { id: 'LEARNED', label: 'Learned', value: s.vocabStatus.LEARNED ?? 0 },
      ],
    };
  }

  private buildPracticeSection(s: StudentPeriodSnapshot) {
    const sec = (kind: PracticeSessionKind) => s.practiceSecByKind[kind] ?? 0;
    const toMin = (n: number) => Math.round(n / 60);
    return {
      totalMinutes: toMin(Object.values(s.practiceSecByKind).reduce((a, b) => a + b, 0)),
      vocabularyMinutes: toMin(sec(PracticeSessionKind.VOCABULARY)),
      quizMinutes: toMin(sec(PracticeSessionKind.QUIZ)),
      speakingMinutes: toMin(sec(PracticeSessionKind.SPEAKING)),
      gamesMinutes: toMin(sec(PracticeSessionKind.GAMES)),
      trend: [...s.practiceTrend.entries()].map(([label, kinds]) => ({
        label,
        vocabularyMinutes: toMin(kinds.VOCABULARY ?? 0),
        quizMinutes: toMin(kinds.QUIZ ?? 0),
        speakingMinutes: toMin(kinds.SPEAKING ?? 0),
        gamesMinutes: toMin(kinds.GAMES ?? 0),
      })),
    };
  }

  private buildStudentKpis(
    current: StudentPeriodSnapshot,
    previous: StudentPeriodSnapshot,
    streakDays: number,
    dailyGoals: { slotsCompleted: number; daysWithAllGoals: number; daysInRange: number },
  ): StatisticsKpiDto[] {
    const lessonTotal =
      current.lessonsPlanned + current.lessonsCompleted + current.lessonsCancelled;
    const completionRate = lessonTotal
      ? Math.round((current.lessonsCompleted / lessonTotal) * 100)
      : 0;
    const prevLessonTotal =
      previous.lessonsPlanned + previous.lessonsCompleted + previous.lessonsCancelled;
    const prevCompletionRate = prevLessonTotal
      ? Math.round((previous.lessonsCompleted / prevLessonTotal) * 100)
      : 0;

    const practiceMin = (s: StudentPeriodSnapshot) =>
      Math.round(
        Object.values(s.practiceSecByKind).reduce((a, b) => a + b, 0) / 60,
      );

    return [
      this.kpi('lessons-completed', 'lessons', 'Completed lessons', current.lessonsCompleted, previous.lessonsCompleted),
      this.kpi('lessons-hours', 'lessons', 'Lesson hours', Number((current.lessonMinutes / 60).toFixed(1)), Number((previous.lessonMinutes / 60).toFixed(1)), 'h'),
      this.kpi('lessons-rate', 'lessons', 'Completion rate', completionRate, prevCompletionRate, '%', 'pp'),
      this.kpi('vocab-added', 'vocabulary', 'Words added', current.vocabAdded, previous.vocabAdded),
      this.kpi('vocab-reviewed', 'vocabulary', 'Cards reviewed', current.vocabReviewed, previous.vocabReviewed),
      this.kpi('vocab-learned', 'vocabulary', 'Marked learned', current.vocabLearned, previous.vocabLearned),
      this.kpi('practice-min', 'practice', 'Practice minutes', practiceMin(current), practiceMin(previous), ' min'),
      this.kpi('quiz-attempts', 'quiz', 'Quizzes completed', current.quizAttempts, previous.quizAttempts),
      this.kpi('quiz-perfect', 'quiz', 'Perfect quizzes', current.quizPerfect, previous.quizPerfect),
      this.kpi('speaking-sub', 'speaking', 'Speaking recordings', current.speakingSubmissions, previous.speakingSubmissions),
      this.kpi('speaking-min', 'speaking', 'Speaking minutes', Math.round(current.speakingSec / 60), Math.round(previous.speakingSec / 60), ' min'),
      this.kpi('goals-days', 'dailyGoals', 'Days all goals done', dailyGoals.daysWithAllGoals, 0),
      this.kpi('streak', 'streak', 'Learning streak', streakDays, streakDays, ' days', 'flat'),
    ];
  }

  private kpi(
    id: string,
    category: StatisticsKpiDto['category'],
    label: string,
    current: number,
    previous: number,
    suffix = '',
    deltaMode: 'count' | 'pp' | 'flat' = 'count',
  ): StatisticsKpiDto {
    const delta = this.deltaFor(current, previous, deltaMode);
    return {
      id,
      category,
      label,
      value: `${current}${suffix}`,
      deltaLabel: delta.label,
      trend: delta.trend,
    };
  }

  private deltaFor(
    current: number,
    previous: number,
    mode: 'count' | 'pp' | 'flat',
  ): { label: string; trend: StatsTrendDirection } {
    if (mode === 'flat') {
      return { label: 'Current', trend: 'flat' };
    }
    const diff = current - previous;
    const normalized =
      Math.abs(diff % 1) < 1e-9 ? Math.trunc(diff) : Number(diff.toFixed(1));
    if (diff === 0) return { label: 'No change', trend: 'flat' };
    if (mode === 'pp') {
      return {
        label: `${normalized > 0 ? '+' : ''}${normalized}pp vs prev`,
        trend: diff > 0 ? 'up' : 'down',
      };
    }
    return {
      label: `${normalized > 0 ? '+' : ''}${normalized} vs prev`,
      trend: diff > 0 ? 'up' : 'down',
    };
  }
}
