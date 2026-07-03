import { ForbiddenException } from '@nestjs/common';
import { SpeakingSubmissionsService } from './speaking-submissions.service';

describe('SpeakingSubmissionsService', () => {
  const prisma = {
    speakingTopic: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    speakingSubmission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    speakingTopicAssignment: { update: jest.fn() },
  };

  const access = {
    requireStaff: jest.fn(),
    assertCanViewStudent: jest.fn(),
    assertCanAccessSubmission: jest.fn(),
  };

  const audio = {
    newStorageKey: jest.fn().mockReturnValue('file.webm'),
    saveToDisk: jest.fn(),
    deleteFromDisk: jest.fn(),
  };

  const tenant = { schoolId: 'school_default' } as never;
  // SpeakingTopic/SpeakingSubmission ops go through the tenant-scoped client.
  const tenantPrisma = { client: prisma } as never;
  const entitlements = { assertCanUpload: jest.fn() } as never;
  const storage = { add: jest.fn() } as never;
  const service = new SpeakingSubmissionsService(
    prisma as never,
    tenant,
    access as never,
    audio as never,
    tenantPrisma,
    entitlements,
    storage,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a submission for an assigned student topic', async () => {
    prisma.speakingTopic.findUnique.mockResolvedValue({
      id: 'topic-1',
      title: 'Travel',
      prompt: 'Describe a trip',
      wordIds: [],
      assignments: [{ id: 'assign-1', studentId: 'student-1' }],
    });
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.speakingSubmission.findMany.mockResolvedValue([]);
    prisma.speakingSubmission.create.mockResolvedValue({
      id: 'sub-1',
      topicId: 'topic-1',
      assignmentId: 'assign-1',
      studentId: 'student-1',
      status: 'SUBMITTED',
      durationSec: 45,
      teacherFeedback: null,
      submittedAt: new Date('2026-05-30T12:00:00.000Z'),
      audioStorageKey: null,
    });

    const result = await service.submit('student-1', {
      topicId: 'topic-1',
      assignmentId: 'assign-1',
      durationSec: 45,
    });

    expect(result.id).toBe('sub-1');
    expect(prisma.speakingTopicAssignment.update).toHaveBeenCalledWith({
      where: { id: 'assign-1' },
      data: { status: 'SUBMITTED' },
    });
  });

  it('replaces previous submission when re-recording the same topic', async () => {
    prisma.speakingTopic.findUnique.mockResolvedValue({
      id: 'topic-1',
      title: 'Travel',
      prompt: 'Describe a trip',
      wordIds: [],
      assignments: [{ id: 'assign-1', studentId: 'student-1' }],
    });
    prisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    prisma.speakingSubmission.findMany.mockResolvedValue([
      { id: 'sub-old', audioStorageKey: 'old.webm' },
    ]);
    prisma.speakingSubmission.create.mockResolvedValue({
      id: 'sub-new',
      topicId: 'topic-1',
      assignmentId: 'assign-1',
      studentId: 'student-1',
      status: 'SUBMITTED',
      durationSec: 30,
      teacherFeedback: null,
      submittedAt: new Date('2026-05-31T12:00:00.000Z'),
      audioStorageKey: null,
    });

    const result = await service.submit('student-1', {
      topicId: 'topic-1',
      assignmentId: 'assign-1',
      durationSec: 30,
    });

    expect(result.id).toBe('sub-new');
    expect(audio.deleteFromDisk).toHaveBeenCalledWith('old.webm');
    expect(prisma.speakingSubmission.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['sub-old'] } },
    });
  });

  it('blocks non-students from submitting', async () => {
    prisma.speakingTopic.findUnique.mockResolvedValue({
      id: 'topic-1',
      assignments: [{ id: 'assign-1', studentId: 'teacher-1' }],
    });
    prisma.user.findUnique.mockResolvedValue({ role: 'TEACHER' });

    await expect(
      service.submit('teacher-1', { topicId: 'topic-1', assignmentId: 'assign-1' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('attachAudio gates on quota and accounts the net byte delta', async () => {
    access.assertCanAccessSubmission.mockResolvedValue({ id: 'sub-1', studentId: 'stu-1' });
    prisma.speakingSubmission.findUnique.mockResolvedValue({ audioSizeBytes: 100 });
    prisma.speakingSubmission.update.mockResolvedValue({});

    await service.attachAudio('stu-1', 'sub-1', Buffer.alloc(250), 'audio/webm', 'r.webm');

    expect(entitlements.assertCanUpload).toHaveBeenCalledWith('school_default', 250);
    expect(prisma.speakingSubmission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: expect.objectContaining({ audioSizeBytes: 250 }),
      }),
    );
    // 250 new − 100 previous = +150
    expect(storage.add).toHaveBeenCalledWith('school_default', 150);
  });
});
