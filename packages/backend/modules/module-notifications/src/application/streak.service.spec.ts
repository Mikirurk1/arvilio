import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { StreakService } from './streak.service';

describe('StreakService', () => {
  let service: StreakService;
  const prisma = {
    user: { findUnique: jest.fn() },
    studentWordCard: { findMany: jest.fn() },
    quizAttempt: { findMany: jest.fn() },
    scheduledLesson: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T15:00:00.000Z'));
    const moduleRef = await Test.createTestingModule({
      providers: [StreakService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(StreakService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function mockActivity(dates: string[]) {
    prisma.studentWordCard.findMany.mockResolvedValue(
      dates.map((d) => ({ updatedAt: new Date(`${d}T10:00:00.000Z`) })),
    );
    prisma.quizAttempt.findMany.mockResolvedValue([]);
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
  }

  it('counts consecutive days including today', async () => {
    mockActivity(['2026-05-20', '2026-05-19', '2026-05-18']);
    const snapshot = await service.snapshotForStudent('s1');
    expect(snapshot.activeToday).toBe(true);
    expect(snapshot.streakDays).toBe(3);
    expect(snapshot.atRisk).toBe(false);
  });

  it('marks at risk when yesterday active but not today', async () => {
    mockActivity(['2026-05-19']);
    const snapshot = await service.snapshotForStudent('s1');
    expect(snapshot.activeToday).toBe(false);
    expect(snapshot.streakDays).toBe(1);
    expect(snapshot.atRisk).toBe(true);
  });

  it('activityDaysForMonth returns sorted day numbers', async () => {
    mockActivity(['2026-05-05', '2026-05-20', '2026-04-30']);
    const days = await service.activityDaysForMonth('s1', 2026, 5);
    expect(days).toEqual([5, 20]);
  });

  it('learningStreakForDashboard returns null for teacher', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'TEACHER' });
    await expect(service.learningStreakForDashboard('t1')).resolves.toBeNull();
  });

  it('learningStreakForDashboard builds dto for student', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    mockActivity(['2026-05-20']);
    const dto = await service.learningStreakForDashboard('s1');
    expect(dto).toMatchObject({
      streakDays: 1,
      activeToday: true,
      year: 2026,
      month: 'May',
      activeDays: [20],
    });
  });
});
