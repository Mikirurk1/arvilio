import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  const prisma = {
    user: { findUnique: jest.fn() },
    scheduledLesson: { count: jest.fn().mockResolvedValue(0) },
    studentWordCard: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(DashboardService);
  });

  it('summaryFor returns student metrics', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });
    prisma.studentWordCard.count.mockResolvedValueOnce(10).mockResolvedValueOnce(3);

    const summary = await service.summaryFor('s1');
    expect(summary.role).toBe('student');
    expect(summary.vocabularyCount).toBe(10);
    expect(summary.reviewCount).toBe(3);
  });

  it('wordOfDayFor returns null for teacher', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'TEACHER' });
    await expect(service.wordOfDayFor('t1')).resolves.toBeNull();
  });

  it('summaryFor throws when user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.summaryFor('x')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('wordOfDayFor picks a stable card for student', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.studentWordCard.findMany.mockResolvedValue([
        {
          id: 'c1',
          word: {
            id: 'w1',
            text: 'run',
            phonetic: '/rʌn/',
            partOfSpeech: 'verb',
            definition: 'move fast',
            example: 'Run!',
          },
        },
        {
          id: 'c2',
          word: {
            id: 'w2',
            text: 'walk',
            phonetic: null,
            partOfSpeech: 'verb',
            definition: 'move slowly',
            example: null,
          },
        },
      ],
    );

    const first = await service.wordOfDayFor('student-1');
    const second = await service.wordOfDayFor('student-1');
    expect(first?.text).toBeTruthy();
    expect(second?.text).toBe(first?.text);
  });
});
