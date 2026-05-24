import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { LanguagesService } from './languages.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const profileRow = {
  id: 'u1',
  email: 'u@test.local',
  displayName: 'User',
  avatarUrl: null,
  timezone: 'Europe/Kyiv',
  proficiencyLevel: 'B1' as const,
  phone: null,
  telegram: null,
  bio: null,
  nativeLanguageId: 'en',
  role: 'STUDENT' as const,
  status: 'ACTIVE' as const,
  notifyLessonReminder: true,
  notifyStreakAlert: false,
  notifyWeeklyReport: true,
  notifyNewVocab: false,
  notifyTeacherMessages: true,
  oauthAccounts: [{ provider: 'GOOGLE' as const, providerEmail: 'u@gmail.com' }],
  calendarConnection: { refreshToken: 'rt' },
};

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const languages = { assertLanguageIds: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: LanguagesService, useValue: languages },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('listStudents rejects student role', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });
    await expect(service.listStudents('s1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('listStudents returns teacher-scoped students', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 't1', role: 'TEACHER' });
    prisma.user.findMany.mockResolvedValue([
      {
        id: 's1',
        email: 's@test',
        displayName: 'Student',
        status: 'ACTIVE',
        proficiencyLevel: null,
        timezone: 'UTC',
        teacherId: 't1',
        teacher: { displayName: 'Teacher' },
        avatarUrl: null,
        nativeLanguageId: null,
        learningLanguages: [],
        scheduleType: false,
        displayColor: null,
        createdAt: new Date('2024-01-01'),
      },
    ]);

    const rows = await service.listStudents('t1');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.teacherId).toBe('t1');
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: 'STUDENT', teacherId: 't1' },
      }),
    );
  });

  it('listStudents throws when actor missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.listStudents('missing')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('listStudentsPage returns paginated items', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin', role: 'ADMIN' });
    prisma.user.findMany.mockResolvedValue([
      {
        id: 's1',
        email: 's@test',
        displayName: 'Alpha',
        status: 'ACTIVE',
        proficiencyLevel: null,
        timezone: 'UTC',
        teacherId: null,
        teacher: null,
        avatarUrl: null,
        nativeLanguageId: null,
        learningLanguages: [],
        scheduleType: false,
        displayColor: null,
        createdAt: new Date(),
      },
    ]);

    const page = await service.listStudentsPage('admin', 25);
    expect(page.items).toHaveLength(1);
    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBeNull();
  });

  it('listAssignableTeachers returns teachers for admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin', role: 'ADMIN' });
    prisma.user.findMany.mockResolvedValue([
      {
        id: 't1',
        displayName: 'Teacher One',
        email: 't@test',
        role: 'TEACHER',
        timezone: 'UTC',
      },
    ]);
    const rows = await service.listAssignableTeachers('admin');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.displayName).toBe('Teacher One');
    expect(rows[0]?.role).toBe('teacher');
  });

  it('listAssignableTeachers rejects students', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });
    await expect(service.listAssignableTeachers('s1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('listStudentsPage returns nextCursor when more rows exist', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin', role: 'ADMIN' });
    const row = {
      id: 's1',
      email: 's@test',
      displayName: 'Alpha',
      status: 'ACTIVE',
      proficiencyLevel: null,
      timezone: 'UTC',
      teacherId: null,
      teacher: null,
      avatarUrl: null,
      nativeLanguageId: null,
      learningLanguages: [],
      scheduleType: false,
      displayColor: null,
      createdAt: new Date(),
    };
    prisma.user.findMany.mockResolvedValue([row, { ...row, id: 's2', displayName: 'Beta' }]);

    const page = await service.listStudentsPage('admin', 1);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe('Alpha|s1');
    expect(page.items).toHaveLength(1);
  });

  it('listStudentsPage applies cursor filter', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'admin', role: 'ADMIN' });
    prisma.user.findMany.mockResolvedValue([]);
    await service.listStudentsPage('admin', 25, 'Alpha|s1');
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { role: 'STUDENT' },
            expect.objectContaining({ OR: expect.any(Array) }),
          ]),
        }),
      }),
    );
  });

  it('getMyProfile maps linked accounts and prefs', async () => {
    prisma.user.findUnique.mockResolvedValue(profileRow);
    const profile = await service.getMyProfile('u1');
    expect(profile.role).toBe('student');
    expect(profile.notificationPrefs.lessonReminder).toBe(true);
    expect(profile.linkedAccounts.find((a) => a.provider === 'google')?.linked).toBe(true);
    expect(profile.linkedAccounts.find((a) => a.provider === 'google')?.calendarConnected).toBe(true);
  });

  it('updateMyProfile rejects learningLanguageIds from self-service', async () => {
    await expect(
      service.updateMyProfile('u1', { learningLanguageIds: ['en'] } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updateMyProfile normalizes phone and telegram', async () => {
    languages.assertLanguageIds.mockResolvedValue(undefined);
    prisma.user.update.mockResolvedValue({
      ...profileRow,
      phone: '+380501234567',
      telegram: '@teacher_bot',
    });
    const profile = await service.updateMyProfile('u1', {
      phone: '380 50 123 45 67',
      telegram: 'teacher_bot',
      displayName: '  New Name  ',
    });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          phone: '+380501234567',
          telegram: '@teacher_bot',
          displayName: 'New Name',
        }),
      }),
    );
    expect(profile.phone).toBe('+380501234567');
  });

  it('updateMyProfile validates phone length', async () => {
    await expect(service.updateMyProfile('u1', { phone: '123' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('changeMyPassword updates hash when current password matches', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    prisma.user.update.mockResolvedValue({});
    await expect(
      service.changeMyPassword('u1', { currentPassword: 'old', newPassword: 'newpass12' }),
    ).resolves.toEqual({ ok: true });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { passwordHash: 'new-hash' },
    });
  });

  it('changeMyPassword rejects oauth-only accounts', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: null });
    await expect(
      service.changeMyPassword('u1', { currentPassword: 'x', newPassword: 'newpass12' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
