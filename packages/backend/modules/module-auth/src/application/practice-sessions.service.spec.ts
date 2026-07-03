import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import { PracticeSessionsService } from './practice-sessions.service';

describe('PracticeSessionsService', () => {
  let service: PracticeSessionsService;
  const prisma = {
    user: { findUnique: jest.fn() },
    practiceSession: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    studentWordCard: { count: jest.fn().mockResolvedValue(0) },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PracticeSessionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: { schoolId: 'school_default' } },
      ],
    }).compile();
    service = moduleRef.get(PracticeSessionsService);
  });

  it('record rejects unknown kind', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1' });
    await expect(
      service.record('s1', {
        kind: 'invalid' as never,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('record rejects short session', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1' });
    const start = new Date();
    const end = new Date(start.getTime() + 1000);
    await expect(
      service.record('s1', {
        kind: 'vocabulary',
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('record throws when user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.record('x', {
        kind: 'vocabulary',
        startedAt: new Date(Date.now() - 120_000).toISOString(),
        endedAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('weekSummaryFor aggregates practice sessions for student', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });
    prisma.practiceSession.findMany.mockResolvedValue([
      {
        source: 'PRACTICE',
        kind: 'QUIZ',
        durationSec: 3600,
      },
      {
        source: 'PRACTICE',
        kind: 'SPEAKING',
        durationSec: 1800,
      },
    ]);
    prisma.studentWordCard = { count: jest.fn().mockResolvedValue(3) };

    const summary = await service.weekSummaryFor('s1');
    expect(summary.practiceMinutes).toBe(90);
    expect(summary.metrics).toHaveLength(4);
    expect(summary.metrics[3]?.value).toBe('1.5h');
  });

  it('record creates session for valid input', async () => {
    const startedAt = new Date(Date.now() - 120_000).toISOString();
    const endedAt = new Date().toISOString();
    prisma.user.findUnique.mockResolvedValue({ id: 's1' });
    prisma.practiceSession.create.mockResolvedValue({
      id: 'ps1',
      kind: 'VOCABULARY',
      source: 'LESSON',
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
      durationSec: 120,
    });

    const dto = await service.record('s1', {
      kind: 'vocabulary',
      startedAt,
      endedAt,
      source: 'lesson',
    });
    expect(dto.kind).toBe('vocabulary');
    expect(dto.source).toBe('lesson');
    expect(dto.durationSec).toBe(120);
  });

  it('record rejects invalid timestamps', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1' });
    await expect(
      service.record('s1', {
        kind: 'quiz',
        startedAt: 'not-a-date',
        endedAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('record rejects endedAt before startedAt', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1' });
    const end = new Date();
    const start = new Date(end.getTime() + 60_000);
    await expect(
      service.record('s1', {
        kind: 'quiz',
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('record rejects unknown source', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1' });
    await expect(
      service.record('s1', {
        kind: 'quiz',
        startedAt: new Date(Date.now() - 120_000).toISOString(),
        endedAt: new Date().toISOString(),
        source: 'unknown' as never,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('weekSummaryFor uses minutes label when under one hour', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });
    prisma.practiceSession.findMany.mockResolvedValue([
      { source: 'PRACTICE', kind: 'VOCABULARY', durationSec: 900 },
    ]);
    prisma.studentWordCard = { count: jest.fn().mockResolvedValue(0) };
    const summary = await service.weekSummaryFor('s1');
    expect(summary.metrics[3]?.value).toBe('15m');
  });

  it('weekSummaryFor skips new words count for teachers', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 't1', role: 'TEACHER' });
    prisma.practiceSession.findMany.mockResolvedValue([]);
    const summary = await service.weekSummaryFor('t1');
    expect(summary.metrics[0]?.value).toBe('0');
    expect(prisma.studentWordCard.count).not.toHaveBeenCalled();
  });

  it('weekSummaryFor throws when user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.weekSummaryFor('missing')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
