import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { PracticeSessionKind } from '@prisma/client';
import { getDailyGoalsForUser } from '@pkg/types';
import { DailyGoalProgressService } from './daily-goal-progress.service';
import { DailyGoalsService } from './daily-goals.service';

describe('DailyGoalsService', () => {
  let service: DailyGoalsService;
  const prisma = {
    user: { findUnique: jest.fn() },
    studentWordCard: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    practiceSession: { findMany: jest.fn().mockResolvedValue([]) },
    quizAttempt: { findMany: jest.fn().mockResolvedValue([]) },
    speakingSubmission: { count: jest.fn().mockResolvedValue(0) },
    scheduledLesson: { count: jest.fn().mockResolvedValue(0) },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.studentWordCard.count.mockResolvedValue(0);
    prisma.studentWordCard.findMany.mockResolvedValue([]);
    prisma.practiceSession.findMany.mockResolvedValue([]);
    prisma.quizAttempt.findMany.mockResolvedValue([]);
    prisma.speakingSubmission.count.mockResolvedValue(0);
    prisma.scheduledLesson.count.mockResolvedValue(0);

    const moduleRef = await Test.createTestingModule({
      providers: [
        DailyGoalsService,
        DailyGoalProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
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

  it('listForUser marks vocabulary cards goal done when variant uses cards', async () => {
    const dateKey = '2026-05-20';
    const vocabInstance = getDailyGoalsForUser('s1', dateKey).find((g) => g.kind === 'vocabulary')!;
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.studentWordCard.count.mockResolvedValue(10);

    const goals = await service.listForUser('s1', dateKey);
    const vocab = goals.find((g) => g.id === vocabInstance.id)!;

    if (vocabInstance.criteria.mode === 'cards') {
      expect(vocab.progressCurrent).toBe(10);
      expect(vocab.done).toBe(vocab.progressCurrent >= vocab.progressTarget);
      expect(vocab.actionPath).toBe('/vocabulary/play');
    }
  });

  it('listForUser marks quiz goal done from finished attempts', async () => {
    const dateKey = '2026-05-20';
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.quizAttempt.findMany.mockResolvedValue([
      { score: 80, correctCount: 8, totalCount: 10 },
    ]);

    const goals = await service.listForUser('s1', dateKey);
    const quiz = goals.find((g) => g.kind === 'quiz');
    expect(quiz?.done).toBe(true);
  });

  it('listForUser marks speaking goal done when variant uses minutes or submission', async () => {
    const dateKey = '2026-05-20';
    const speakInstance = getDailyGoalsForUser('s1', dateKey).find((g) => g.kind === 'speaking')!;
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.practiceSession.findMany.mockResolvedValue([
      { kind: PracticeSessionKind.SPEAKING, durationSec: 90 },
    ]);
    prisma.speakingSubmission.count.mockResolvedValue(1);

    const goals = await service.listForUser('s1', dateKey);
    const speaking = goals.find((g) => g.id === speakInstance.id)!;

    if (speakInstance.criteria.mode === 'minutes' || speakInstance.criteria.mode === 'submission') {
      expect(speaking.done).toBe(true);
    }
  });

  it('listForUser tracks words added for add_words vocabulary variants', async () => {
    const dateKey = '2026-06-15';
    const vocabInstance = getDailyGoalsForUser('user-add-words', dateKey).find(
      (g) => g.kind === 'vocabulary',
    )!;
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.studentWordCard.findMany.mockResolvedValue([
      {
        createdAt: new Date('2026-06-15T10:00:00.000Z'),
        lastReviewedAt: null,
        knownAt: null,
        status: 'NEW',
        lessonId: null,
        word: { partOfSpeech: 'adjective' },
      },
    ]);

    const goals = await service.listForUser('user-add-words', dateKey);
    const vocab = goals.find((g) => g.id === vocabInstance.id)!;

    if (
      vocabInstance.criteria.mode === 'add_words' ||
      vocabInstance.criteria.mode === 'add_part_of_speech'
    ) {
      expect(vocab.progressCurrent).toBeGreaterThanOrEqual(1);
    }
  });

  it('listForUser returns four goals with stable ids', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    const goals = await service.listForUser('s1', '2026-05-20');
    expect(goals).toHaveLength(4);
    expect(goals.map((g) => g.id)).toEqual(
      getDailyGoalsForUser('s1', '2026-05-20').map((g) => g.id),
    );
    expect(goals.every((g) => !('xpReward' in g))).toBe(true);
  });
});
