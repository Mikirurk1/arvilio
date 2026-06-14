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

  const service = new SpeakingSubmissionsService(prisma as never, access as never, audio as never);

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
});
