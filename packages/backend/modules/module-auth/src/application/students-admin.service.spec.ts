import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { StudentsAdminService } from './students-admin.service';
import { LanguagesService } from './languages.service';

describe('StudentsAdminService', () => {
  let service: StudentsAdminService;
  const tx = {
    user: { update: jest.fn().mockResolvedValue({}) },
    studentLearningLanguage: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };
  const prisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn((fn: (client: typeof tx) => Promise<void>) => fn(tx)),
  };
  const languages = { assertLanguageIds: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        StudentsAdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: LanguagesService, useValue: languages },
      ],
    }).compile();
    service = moduleRef.get(StudentsAdminService);
  });

  it('rejects teacher updating another teachers student', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      teacherId: 'other-teacher',
    });

    await expect(
      service.updateStudent(
        { role: 'TEACHER', id: 'teacher-1' },
        'student-1',
        { displayColor: '#ff0000' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows teacher to update display color for own student', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'student-1',
        role: 'STUDENT',
        teacherId: 'teacher-1',
      })
      .mockResolvedValueOnce({
        id: 'student-1',
        nativeLanguageId: null,
        teacherId: 'teacher-1',
        displayColor: '#ff0000',
        learningLanguages: [],
      });

    const result = await service.updateStudent(
      { role: 'TEACHER', id: 'teacher-1' },
      'student-1',
      { displayColor: '#ff0000' },
    );

    expect(result.displayColor).toBe('#ff0000');
  });

  it('throws when student not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.updateStudent({ role: 'ADMIN', id: 'admin-1' }, 'missing', {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forbids teacher from changing native language', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      teacherId: 'teacher-1',
    });
    await expect(
      service.updateStudent(
        { role: 'TEACHER', id: 'teacher-1' },
        'student-1',
        { nativeLanguageId: 'lang-en' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects invalid teacher assignment for admin', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'student-1', role: 'STUDENT', teacherId: null })
      .mockResolvedValueOnce({ role: 'STUDENT' });
    await expect(
      service.updateStudent(
        { role: 'ADMIN', id: 'admin-1' },
        'student-1',
        { teacherId: 'not-a-teacher' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when user is not a student', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 't1', role: 'TEACHER', teacherId: null });
    await expect(
      service.updateStudent({ role: 'ADMIN', id: 'admin-1' }, 't1', { displayColor: '#ff0000' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid display color hex', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      teacherId: 'teacher-1',
    });
    await expect(
      service.updateStudent(
        { role: 'TEACHER', id: 'teacher-1' },
        'student-1',
        { displayColor: 'red' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('admin updates native and learning languages', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'student-1', role: 'STUDENT', teacherId: null })
      .mockResolvedValueOnce({
        id: 'student-1',
        nativeLanguageId: 'lang-uk',
        teacherId: null,
        displayColor: null,
        learningLanguages: [{ languageId: 'lang-en' }],
      });
    languages.assertLanguageIds.mockResolvedValue(undefined);

    const result = await service.updateStudent(
      { role: 'ADMIN', id: 'admin-1' },
      'student-1',
      { nativeLanguageId: 'lang-uk', learningLanguageIds: ['lang-en'] },
    );

    expect(languages.assertLanguageIds).toHaveBeenCalled();
    expect(result.learningLanguageIds).toEqual(['lang-en']);
    expect(tx.studentLearningLanguage.deleteMany).toHaveBeenCalled();
    expect(tx.studentLearningLanguage.createMany).toHaveBeenCalled();
  });

  it('admin assigns eligible teacher', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'student-1', role: 'STUDENT', teacherId: null })
      .mockResolvedValueOnce({ role: 'TEACHER' })
      .mockResolvedValueOnce({
        id: 'student-1',
        nativeLanguageId: null,
        teacherId: 'teacher-1',
        displayColor: null,
        learningLanguages: [],
      });

    const result = await service.updateStudent(
      { role: 'ADMIN', id: 'admin-1' },
      'student-1',
      { teacherId: 'teacher-1' },
    );
    expect(result.teacherId).toBe('teacher-1');
  });
});
