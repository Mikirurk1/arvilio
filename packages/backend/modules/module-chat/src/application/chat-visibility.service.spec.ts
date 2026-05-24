import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { ChatVisibilityService } from './chat-visibility.service';

describe('ChatVisibilityService', () => {
  let service: ChatVisibilityService;
  const prisma = {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    scheduledLesson: { findMany: jest.fn() },
    chatParticipant: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ChatVisibilityService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(ChatVisibilityService);
  });

  it('forbids messaging yourself', async () => {
    await expect(service.assertCanMessage('u1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('forbids student messaging unrelated peer', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      teacherId: 'teacher-1',
    });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    await expect(service.assertCanMessage('student-1', 'student-2')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows student to message assigned teacher', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      teacherId: 'teacher-1',
    });
    prisma.scheduledLesson.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    await expect(service.assertCanMessage('student-1', 'teacher-1')).resolves.toBeUndefined();
  });

  it('assertParticipant throws when not a member', async () => {
    prisma.chatParticipant.findUnique.mockResolvedValue(null);
    await expect(service.assertParticipant('u1', 'conv-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('requireUser throws NotFoundException', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.listContacts('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('admin listContacts includes all other users', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      role: 'ADMIN',
      teacherId: null,
    });
    prisma.user.findMany.mockResolvedValue([
      { id: 's1', displayName: 'Student', avatarUrl: null, role: 'STUDENT' },
    ]);

    const contacts = await service.listContacts('admin-1');
    expect(contacts).toHaveLength(1);
    expect(contacts[0]?.id).toBe('s1');
  });

  it('teacher can message assigned student', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'teacher-1',
      role: 'TEACHER',
      teacherId: null,
    });
    prisma.user.findMany
      .mockResolvedValueOnce([{ id: 'student-1' }])
      .mockResolvedValueOnce([]);
    prisma.scheduledLesson.findMany.mockResolvedValue([]);

    await expect(service.assertCanMessage('teacher-1', 'student-1')).resolves.toBeUndefined();
  });
});
