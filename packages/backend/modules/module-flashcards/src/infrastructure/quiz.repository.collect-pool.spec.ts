import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { QuizRepository } from './quiz.repository';

describe('QuizRepository.collectPool', () => {
  let repo: QuizRepository;
  let prisma: {
    studentWordCard: { findMany: jest.Mock };
  };

  const studentId = 'student-1';
  const lessonId = 'lesson-a';
  const nativeLanguageId = 'uk';

  const card = (id: string, lesson: string | null) => ({
    status: 'NEW',
    lessonId: lesson,
    word: {
      id: `word-${id}`,
      text: `lemma-${id}`,
      definition: `def ${id}`,
      example: null,
      partOfSpeech: 'noun',
      category: 'general',
      definitions: [],
    },
  });

  beforeEach(async () => {
    prisma = {
      studentWordCard: { findMany: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizRepository,
        { provide: PrismaService, useValue: prisma },
        // collectPool reads StudentWordCard via the tenant-scoped client.
        { provide: TenantPrismaService, useValue: { client: prisma } },
      ],
    }).compile();
    repo = moduleRef.get(QuizRepository);
  });

  it('lesson source queries only cards for that lessonId', async () => {
    prisma.studentWordCard.findMany.mockResolvedValue([card('1', lessonId), card('2', lessonId)]);

    const pool = await repo.collectPool(studentId, lessonId, 'lesson', nativeLanguageId);

    expect(prisma.studentWordCard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentId, lessonId },
      }),
    );
    expect(pool.map((w) => w.id).sort()).toEqual(['word-1', 'word-2']);
  });

  it('vocabulary source queries all student cards', async () => {
    prisma.studentWordCard.findMany.mockResolvedValue([
      card('1', lessonId),
      card('2', null),
    ]);

    const pool = await repo.collectPool(studentId, lessonId, 'vocabulary', nativeLanguageId);

    expect(prisma.studentWordCard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentId },
      }),
    );
    expect(pool).toHaveLength(2);
  });

  it('mixed source puts lesson words first then other vocabulary', async () => {
    prisma.studentWordCard.findMany
      .mockResolvedValueOnce([card('1', lessonId)])
      .mockResolvedValueOnce([
        card('1', lessonId),
        card('2', 'lesson-b'),
        card('3', null),
      ]);

    const pool = await repo.collectPool(studentId, lessonId, 'mixed', nativeLanguageId);

    expect(pool).toHaveLength(3);
    expect(pool[0]!.id).toBe('word-1');
    expect(pool.slice(1).map((w) => w.id).sort()).toEqual(['word-2', 'word-3']);
  });

  it('mixed without lessonId throws', async () => {
    await expect(
      repo.collectPool(studentId, undefined, 'mixed', nativeLanguageId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lesson without lessonId throws', async () => {
    await expect(
      repo.collectPool(studentId, undefined, 'lesson', nativeLanguageId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('mistakesOnly adds status filter', async () => {
    prisma.studentWordCard.findMany.mockResolvedValue([]);

    await repo.collectPool(studentId, undefined, 'vocabulary', nativeLanguageId, true);

    expect(prisma.studentWordCard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentId, status: 'MISTAKES_WORK' },
      }),
    );
  });
});
