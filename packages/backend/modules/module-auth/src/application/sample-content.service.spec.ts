import type { PrismaService } from '@be/prisma';
import type { EntitlementsService } from '@be/billing';
import { SAMPLE_LESSON_TITLE, SampleContentService } from './sample-content.service';

jest.mock('@be/billing', () => ({
  EntitlementsService: class EntitlementsService {},
}));

describe('SampleContentService', () => {
  const prisma = {
    libraryMaterial: {
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    quiz: {
      count: jest.fn(),
      create: jest.fn(),
    },
    scheduledLesson: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    schoolMembership: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    language: {
      findUnique: jest.fn(),
    },
  };
  const entitlements = {
    canAddActiveStudent: jest.fn().mockResolvedValue(true),
  };
  const service = new SampleContentService(
    prisma as unknown as PrismaService,
    entitlements as unknown as EntitlementsService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.quiz.count.mockResolvedValue(0);
    prisma.quiz.create.mockResolvedValue({});
    prisma.scheduledLesson.findFirst.mockResolvedValue(null);
    prisma.scheduledLesson.create.mockResolvedValue({});
    prisma.libraryMaterial.findFirst.mockResolvedValue({ id: 'mat-1' });
    prisma.schoolMembership.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'demo-student' });
    prisma.language.findUnique.mockResolvedValue({ id: 'lang-en' });
    entitlements.canAddActiveStudent.mockResolvedValue(true);
  });

  it('creates 3 materials, 1 quiz, and 1 lesson when school is empty', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(0);
    prisma.libraryMaterial.create.mockResolvedValue({});
    // teacher timezone lookup inside seedSampleLesson
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // demo email lookup
      .mockResolvedValueOnce({ timezone: 'Europe/Kyiv' }); // teacher

    const result = await service.seed('school-1', 'admin-1');

    expect(result).toEqual({ created: 3, quizzes: 1, lessons: 1 });
    expect(prisma.libraryMaterial.create).toHaveBeenCalledTimes(3);
    expect(prisma.quiz.create).toHaveBeenCalledTimes(1);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.scheduledLesson.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: SAMPLE_LESSON_TITLE,
          teacherId: 'admin-1',
          studentId: 'demo-student',
        }),
      }),
    );
  });

  it('reuses an existing active student instead of creating demo', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(2);
    prisma.schoolMembership.findFirst.mockResolvedValue({ userId: 'existing-student' });
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ timezone: 'Europe/Kyiv' });

    const result = await service.seed('school-1', 'admin-1');

    expect(result.created).toBe(0);
    expect(result.lessons).toBe(1);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.scheduledLesson.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ studentId: 'existing-student' }),
      }),
    );
  });

  it('skips lesson when sample lesson already exists', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(0);
    prisma.libraryMaterial.create.mockResolvedValue({});
    prisma.scheduledLesson.findFirst.mockResolvedValue({ id: 'lesson-1' });

    const result = await service.seed('school-1', 'admin-1');

    expect(result.lessons).toBe(0);
    expect(prisma.scheduledLesson.create).not.toHaveBeenCalled();
  });

  it('skips lesson when no seat and no student', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(0);
    prisma.libraryMaterial.create.mockResolvedValue({});
    entitlements.canAddActiveStudent.mockResolvedValue(false);
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await service.seed('school-1', 'admin-1');

    expect(result.lessons).toBe(0);
    expect(prisma.scheduledLesson.create).not.toHaveBeenCalled();
  });

  it('skips quiz when school already has quizzes', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(0);
    prisma.libraryMaterial.create.mockResolvedValue({});
    prisma.quiz.count.mockResolvedValue(1);
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ timezone: 'Europe/Kyiv' });

    const result = await service.seed('school-1', 'admin-1');

    expect(result.created).toBe(3);
    expect(result.quizzes).toBe(0);
    expect(result.lessons).toBe(1);
    expect(prisma.quiz.create).not.toHaveBeenCalled();
  });

  it('continues seeding if one material creation fails', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(0);
    prisma.libraryMaterial.create
      .mockRejectedValueOnce(new Error('db error'))
      .mockResolvedValue({});
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ timezone: 'Europe/Kyiv' });

    const result = await service.seed('school-1', 'admin-1');

    expect(result.created).toBe(2);
    expect(result.quizzes).toBe(1);
    expect(result.lessons).toBe(1);
  });
});
