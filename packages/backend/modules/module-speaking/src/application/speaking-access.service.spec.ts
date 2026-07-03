import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SpeakingAccessService } from './speaking-access.service';

describe('SpeakingAccessService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    speakingTopic: { findUnique: jest.fn() },
    speakingSubmission: { findUnique: jest.fn() },
  };

  // SpeakingTopic/SpeakingSubmission reads go through the tenant-scoped client.
  const tenantPrisma = { client: prisma } as never;
  const service = new SpeakingAccessService(prisma as never, tenantPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows a student to view their own submission', async () => {
    prisma.speakingSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      studentId: 'student-1',
      audioStorageKey: 'key.webm',
      mimeType: 'audio/webm',
    });

    const row = await service.assertCanAccessSubmission('student-1', 'sub-1');
    expect(row.id).toBe('sub-1');
  });

  it('blocks students from viewing another student submission', async () => {
    prisma.speakingSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      studentId: 'student-2',
      audioStorageKey: 'key.webm',
      mimeType: 'audio/webm',
    });
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });

    await expect(service.assertCanAccessSubmission('student-1', 'sub-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows assigned teacher to view student submission', async () => {
    prisma.speakingSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      studentId: 'student-2',
      audioStorageKey: 'key.webm',
      mimeType: 'audio/webm',
    });
    prisma.user.findUnique
      .mockResolvedValueOnce({ role: 'TEACHER' })
      .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 'teacher-1' });

    const row = await service.assertCanAccessSubmission('teacher-1', 'sub-1');
    expect(row.studentId).toBe('student-2');
  });

  it('throws when submission is missing', async () => {
    prisma.speakingSubmission.findUnique.mockResolvedValue(null);
    await expect(service.assertCanAccessSubmission('student-1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
