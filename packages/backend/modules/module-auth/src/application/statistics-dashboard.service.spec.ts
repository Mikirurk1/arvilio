import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';

// @be/billing imports @be/auth guards, which re-imports this module — break the cycle at test time
jest.mock('@be/billing', () => ({
  StaffPayrollService: class {
    getPayrollSummary = jest.fn();
  },
}));

import { StatisticsDashboardService } from './statistics-dashboard.service';
import { DailyGoalProgressService } from './daily-goal-progress.service';
import { StreakService } from '../../../module-notifications/src/application/streak.service';
import { StaffPayrollService } from '@be/billing';

describe('StatisticsDashboardService', () => {
  let service: StatisticsDashboardService;

  const prisma = {
    user: { findUnique: jest.fn(), count: jest.fn(), findMany: jest.fn() },
    scheduledLesson: { findMany: jest.fn() },
    studentWordCard: { findMany: jest.fn(), groupBy: jest.fn(), count: jest.fn() },
    practiceSession: { findMany: jest.fn(), groupBy: jest.fn() },
    quizAttempt: { findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    speakingSubmission: { findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    platformSettings: { findUnique: jest.fn() },
    studentLessonBalance: { findMany: jest.fn() },
    payment: { groupBy: jest.fn() },
    lessonBalanceLedger: { groupBy: jest.fn() },
  };

  const streaks = { snapshotForStudent: jest.fn() };
  const dailyGoalProgress = { evaluateForGoals: jest.fn() };

  const fixedNow = new Date('2026-06-02T12:00:00.000Z');

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.studentWordCard.findMany.mockResolvedValue([]);
    prisma.studentWordCard.groupBy.mockResolvedValue([]);
    prisma.practiceSession.findMany.mockResolvedValue([]);
    prisma.practiceSession.groupBy.mockResolvedValue([]);
    prisma.quizAttempt.findMany.mockResolvedValue([]);
    prisma.speakingSubmission.findMany.mockResolvedValue([]);
    prisma.speakingSubmission.groupBy.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);
    prisma.user.findMany.mockResolvedValue([]);
    prisma.speakingSubmission.count.mockResolvedValue(0);
    prisma.quizAttempt.count.mockResolvedValue(0);
    prisma.quizAttempt.groupBy.mockResolvedValue([]);
    prisma.studentWordCard.count.mockResolvedValue(0);
    prisma.platformSettings.findUnique.mockResolvedValue({
      paymentConfig: { defaultCurrency: 'UAH', defaultPricePerLessonMinor: 50000 },
    });
    prisma.studentLessonBalance.findMany.mockResolvedValue([]);
    prisma.payment.groupBy.mockResolvedValue([]);
    prisma.lessonBalanceLedger.groupBy.mockResolvedValue([]);
    streaks.snapshotForStudent.mockResolvedValue({
      streakDays: 5,
      activeToday: true,
      atRisk: false,
    });
    dailyGoalProgress.evaluateForGoals.mockResolvedValue(new Map());

    const moduleRef = await Test.createTestingModule({
      providers: [
        StatisticsDashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: StreakService, useValue: streaks },
        { provide: DailyGoalProgressService, useValue: dailyGoalProgress },
        { provide: StaffPayrollService, useValue: { buildMyEarnings: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();
    service = moduleRef.get(StatisticsDashboardService);
  });

  it('defaults admin profile scope to my_students', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(2);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.dashboardFor('admin-1', 'week', undefined, undefined, fixedNow);

    expect(result.studentScope).toBe('my_students');
  });

  it('super-admin without assigned students defaults to all', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'super-1', role: 'SUPER_ADMIN' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.dashboardFor('super-1', 'week', undefined, undefined, fixedNow);

    expect(result.studentScope).toBe('all');
  });

  it('returns teacher dashboard on own profile', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'teacher-1', role: 'TEACHER' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(3);
    prisma.user.findMany.mockResolvedValue([
      { id: 's1', displayName: 'Student One' },
      { id: 's2', displayName: 'Student Two' },
    ]);
    prisma.speakingSubmission.count.mockResolvedValue(0);

    const result = await service.dashboardFor('teacher-1', 'week', undefined, undefined, fixedNow);

    expect(result.layout).toBe('teacher');
    expect(result.kpis.length).toBeGreaterThan(0);
    expect(result.staffOverview).toMatchObject({
      totalStudents: 3,
      inactiveStudents: expect.any(Number),
    });
    expect(result.studentScope).toBe('my_students');
    expect(result.lessons).toBeDefined();
  });

  it('builds student dashboard with KPIs and sections', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'student-1', role: 'STUDENT' });
    prisma.scheduledLesson.findMany.mockResolvedValue([
      { date: '2026-06-01', status: 'COMPLETED', credited: false, duration: 60 },
      { date: '2026-06-02', status: 'PLANNED', credited: false, duration: 45 },
    ]);
    prisma.studentWordCard.findMany.mockResolvedValue([
      {
        createdAt: new Date('2026-06-01T10:00:00.000Z'),
        lastReviewedAt: null,
        knownAt: null,
      },
    ]);
    prisma.studentWordCard.groupBy.mockResolvedValue([
      { status: 'NEW', _count: { _all: 3 } },
      { status: 'LEARNED', _count: { _all: 2 } },
    ]);
    prisma.quizAttempt.findMany.mockResolvedValue([
      { score: 100, correctCount: 10, totalCount: 10, finishedAt: new Date('2026-06-01T11:00:00.000Z') },
    ]);

    const result = await service.dashboardFor('student-1', 'week', undefined, undefined, fixedNow);

    expect(result.layout).toBe('student');
    expect(result.kpis.length).toBeGreaterThan(0);
    expect(result.lessons?.completed).toBe(1);
    expect(result.vocabulary?.wordsAdded).toBe(1);
    expect(result.quiz?.attempts).toBe(1);
    expect(result.quiz?.perfectAttempts).toBe(1);
    expect(result.streakDays).toBe(5);
  });

  it('allows teacher to load a linked student dashboard', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'teacher-1', role: 'TEACHER' })
      .mockResolvedValueOnce({ id: 'student-1', role: 'STUDENT', teacherId: 'teacher-1' });

    const result = await service.dashboardFor('teacher-1', 'month', 'student-1', undefined, fixedNow);

    expect(result.layout).toBe('student');
    expect(result.title).toBe('Student statistics');
  });

  it('rejects student viewing another student', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'student-1', role: 'STUDENT' })
      .mockResolvedValueOnce({ id: 'student-2', role: 'STUDENT', teacherId: 'teacher-1' });

    await expect(
      service.dashboardFor('student-1', 'week', 'student-2', fixedNow),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('admin all-students operations omits learning KPIs', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    prisma.user.findMany.mockResolvedValue([{ id: 's1', displayName: 'A' }]);
    prisma.quizAttempt.count.mockResolvedValue(99);
    prisma.studentWordCard.count.mockResolvedValue(50);

    const result = await service.dashboardFor(
      'admin-1',
      'week',
      undefined,
      'all',
      fixedNow,
      'operations',
    );

    const ids = result.kpis.map((k) => k.id);
    expect(ids).not.toContain('school-quizzes');
    expect(ids).not.toContain('school-words-added');
    expect(result.statisticsFocus).toBe('operations');
  });

  it('admin my_students learning includes quiz KPI', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValueOnce(2).mockResolvedValueOnce(2);
    prisma.user.findMany.mockResolvedValue([{ id: 's1', displayName: 'A' }]);
    prisma.quizAttempt.count.mockResolvedValue(7);

    const result = await service.dashboardFor(
      'admin-1',
      'week',
      undefined,
      'my_students',
      fixedNow,
      'learning',
    );

    expect(result.kpis.some((k) => k.id === 'school-quizzes')).toBe(true);
    expect(result.kpis.some((k) => k.id === 'billing-paid')).toBe(false);
    expect(result.statisticsFocus).toBe('learning');
  });

  it('admin my_students operations includes billing KPIs when roster has payments', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    prisma.user.findMany.mockResolvedValue([{ id: 's1', displayName: 'A' }]);
    prisma.payment.groupBy.mockResolvedValue([{ userId: 's1', _sum: { amountMinor: 50000 } }]);
    prisma.lessonBalanceLedger.groupBy.mockResolvedValue([{ userId: 's1', _sum: { delta: 2 } }]);

    const result = await service.dashboardFor(
      'admin-1',
      'week',
      undefined,
      'my_students',
      fixedNow,
      'operations',
    );

    expect(result.kpis.some((k) => k.id === 'billing-paid')).toBe(true);
    expect(result.billingOverview).toBeDefined();
    expect(result.roster?.[0]?.paidInPeriodMinor).toBe(50000);
  });

  it('admin all-students learning includes school quiz KPI', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    prisma.user.findMany.mockResolvedValue([]);
    prisma.quizAttempt.count.mockResolvedValue(12);

    const result = await service.dashboardFor(
      'admin-1',
      'week',
      undefined,
      'all',
      fixedNow,
      'learning',
    );

    expect(result.kpis.some((k) => k.id === 'school-quizzes')).toBe(true);
    expect(result.kpis.some((k) => k.id === 'billing-paid')).toBe(false);
  });

  it('loads custom date range for student dashboard', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'student-1', role: 'STUDENT' });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.studentWordCard.findMany.mockResolvedValue([]);
    prisma.studentWordCard.groupBy.mockResolvedValue([]);
    prisma.quizAttempt.findMany.mockResolvedValue([]);

    const result = await service.dashboardFor(
      'student-1',
      'custom',
      undefined,
      undefined,
      fixedNow,
      'operations',
      '2026-05-01',
      '2026-05-15',
    );

    expect(result.range).toBe('custom');
    expect(result.rangeBounds.from).toContain('2026-05-01');
    expect(result.rangeBounds.to).toContain('2026-05-15');
    expect(result.rangeLabel).toBe('2026-05-01 — 2026-05-15');
  });

  it('throws when viewer is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.dashboardFor('missing', 'week')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
