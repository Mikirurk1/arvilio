import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type {
  ReviewSpeakingSubmissionRequestDto,
  SpeakingSubmissionDto,
  SubmitSpeakingRecordingRequestDto,
} from '@pkg/types';
import { SpeakingAccessService } from './speaking-access.service';
import { SpeakingAudioService } from './speaking-audio.service';
import { mapSubmissionSummary } from '../presentation/graphql/speaking-graphql.util';

@Injectable()
export class SpeakingSubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: SpeakingAccessService,
    private readonly audio: SpeakingAudioService,
  ) {}

  async submit(
    actorId: string,
    body: SubmitSpeakingRecordingRequestDto,
  ): Promise<SpeakingSubmissionDto> {
    const topic = await this.prisma.speakingTopic.findUnique({
      where: { id: body.topicId },
      include: {
        assignments: {
          where: { studentId: actorId },
        },
      },
    });
    if (!topic) throw new NotFoundException('Speaking topic not found');

    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true },
    });
    if (!actor || actor.role !== 'STUDENT') {
      throw new ForbiddenException('Only students can submit speaking recordings');
    }

    const assignment =
      topic.assignments.find((row) => row.id === body.assignmentId) ??
      topic.assignments[0] ??
      null;

    if (!assignment) {
      throw new BadRequestException('This speaking topic is not assigned to you');
    }

    await this.replacePreviousSubmissions(topic.id, assignment.id, actorId);

    const submission = await this.prisma.speakingSubmission.create({
      data: {
        topicId: topic.id,
        assignmentId: assignment.id,
        studentId: actorId,
        durationSec: body.durationSec ?? null,
      },
    });

    await this.prisma.speakingTopicAssignment.update({
      where: { id: assignment.id },
      data: { status: 'SUBMITTED' },
    });

    return this.mapSubmission(submission, topic);
  }

  async attachAudio(
    actorId: string,
    submissionId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<void> {
    const submission = await this.access.assertCanAccessSubmission(actorId, submissionId);
    if (submission.studentId !== actorId) {
      throw new ForbiddenException('Only the student who recorded can upload audio');
    }

    const storageKey = this.audio.newStorageKey(originalName);
    await this.audio.saveToDisk(buffer, storageKey);
    await this.prisma.speakingSubmission.update({
      where: { id: submissionId },
      data: {
        audioStorageKey: storageKey,
        mimeType,
      },
    });
  }

  async listForStudent(viewerId: string, studentId: string): Promise<SpeakingSubmissionDto[]> {
    await this.access.assertCanViewStudent(viewerId, studentId);

    const rows = await this.prisma.speakingSubmission.findMany({
      where: { studentId },
      include: { topic: true },
      orderBy: [{ status: 'asc' }, { submittedAt: 'desc' }],
    });

    const latestByTopicId = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!latestByTopicId.has(row.topicId)) {
        latestByTopicId.set(row.topicId, row);
      }
    }

    return Array.from(latestByTopicId.values()).map((row) =>
      this.mapSubmission(row, row.topic),
    );
  }

  async review(actorId: string, body: ReviewSpeakingSubmissionRequestDto): Promise<SpeakingSubmissionDto> {
    await this.access.requireStaff(actorId);
    const feedback = body.teacherFeedback.trim();
    if (!feedback) {
      throw new BadRequestException('Teacher feedback is required');
    }

    const submission = await this.prisma.speakingSubmission.findUnique({
      where: { id: body.submissionId },
      include: { topic: true },
    });
    if (!submission) throw new NotFoundException('Speaking submission not found');

    await this.access.assertCanViewStudent(actorId, submission.studentId);

    const updated = await this.prisma.speakingSubmission.update({
      where: { id: submission.id },
      data: {
        teacherFeedback: feedback,
        status: 'REVIEWED',
        reviewedById: actorId,
        reviewedAt: new Date(),
      },
      include: { topic: true },
    });

    if (updated.assignmentId) {
      await this.prisma.speakingTopicAssignment.update({
        where: { id: updated.assignmentId },
        data: { status: 'REVIEWED' },
      });
    }

    return this.mapSubmission(updated, updated.topic);
  }

  async resolveAudioDownload(viewerId: string, submissionId: string) {
    const submission = await this.access.assertCanAccessSubmission(viewerId, submissionId);
    if (!submission.audioStorageKey) {
      throw new NotFoundException('Audio not uploaded yet');
    }
    return {
      storageKey: submission.audioStorageKey,
      mimeType: submission.mimeType ?? 'audio/webm',
    };
  }

  /** One active recording per topic assignment — re-record replaces the previous submission. */
  private async replacePreviousSubmissions(
    topicId: string,
    assignmentId: string,
    studentId: string,
  ): Promise<void> {
    const previous = await this.prisma.speakingSubmission.findMany({
      where: { topicId, assignmentId, studentId },
      select: { id: true, audioStorageKey: true },
    });
    if (previous.length === 0) return;

    await Promise.all(
      previous
        .map((row) => row.audioStorageKey)
        .filter((key): key is string => Boolean(key))
        .map((key) => this.audio.deleteFromDisk(key)),
    );

    await this.prisma.speakingSubmission.deleteMany({
      where: { id: { in: previous.map((row) => row.id) } },
    });
  }

  private mapSubmission(
    row: {
      id: string;
      topicId: string;
      assignmentId: string | null;
      studentId: string;
      status: 'SUBMITTED' | 'REVIEWED';
      durationSec: number | null;
      teacherFeedback: string | null;
      submittedAt: Date;
      audioStorageKey: string | null;
    },
    topic: { title: string; prompt: string; wordIds: string[] },
  ): SpeakingSubmissionDto {
    return {
      ...mapSubmissionSummary(row),
      topicId: row.topicId,
      assignmentId: row.assignmentId,
      studentId: row.studentId,
      topicTitle: topic.title,
      topicPrompt: topic.prompt,
      topicWordIds: topic.wordIds,
    };
  }
}
