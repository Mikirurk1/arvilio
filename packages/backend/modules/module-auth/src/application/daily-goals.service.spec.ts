import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { getDailyGoalsForUser } from '@pkg/types';
import { DailyGoalsService } from './daily-goals.service';

describe('DailyGoalsService', () => {
  let service: DailyGoalsService;
  const prisma = {
    user: { findUnique: jest.fn() },
    dailyGoalCompletion: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [DailyGoalsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(DailyGoalsService);
  });

  it('listForUser returns empty for teacher', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'TEACHER' });
    await expect(service.listForUser('t1')).resolves.toEqual([]);
  });

  it('listForUser throws when user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.listForUser('x')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('setDone rejects invalid goal id', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    await expect(service.setDone('s1', 'bad-id', true)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('listForUser marks completed goals for student', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.dailyGoalCompletion.findMany.mockResolvedValue([{ difficulty: 1 }]);
    const goals = await service.listForUser('s1', '2026-05-20');
    expect(goals).toHaveLength(4);
    expect(goals.filter((g) => g.done)).toHaveLength(1);
    expect(goals[0]?.dateKey).toBe('2026-05-20');
  });

  it('setDone upserts completion and returns refreshed list', async () => {
    const dateKey = '2026-05-20';
    const goalId = getDailyGoalsForUser('s1', dateKey)[0]!.id;
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.dailyGoalCompletion.findMany.mockResolvedValue([]);
    prisma.dailyGoalCompletion.upsert.mockResolvedValue({});

    const goals = await service.setDone('s1', goalId, true);
    expect(prisma.dailyGoalCompletion.upsert).toHaveBeenCalled();
    expect(goals.some((g) => g.id === goalId)).toBe(true);
  });

  it('setDone deleteMany when marking not done', async () => {
    const dateKey = '2026-05-20';
    const goalId = getDailyGoalsForUser('s1', dateKey)[0]!.id;
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.dailyGoalCompletion.findMany.mockResolvedValue([]);
    prisma.dailyGoalCompletion.deleteMany.mockResolvedValue({ count: 1 });

    await service.setDone('s1', goalId, false);
    expect(prisma.dailyGoalCompletion.deleteMany).toHaveBeenCalled();
  });
});
