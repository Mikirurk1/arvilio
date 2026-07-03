import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type {
  CreateSpeakingTopicRequestDto,
  SpeakingTopicCardDto,
} from '@pkg/types';
import { SpeakingAccessService } from './speaking-access.service';
import { mapTopicCard } from '../presentation/graphql/speaking-graphql.util';

@Injectable()
export class SpeakingTopicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: SpeakingAccessService,
    private readonly tenant: TenantContextService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  /** Tenant-scoped client: SpeakingTopic/SpeakingSubmission are auto-filtered by school. */
  private get db() {
    return this.tenantPrisma.client;
  }

  async create(actorId: string, body: CreateSpeakingTopicRequestDto): Promise<SpeakingTopicCardDto> {
    const title = body.title.trim();
    const prompt = body.prompt.trim();
    if (!title || !prompt) {
      throw new BadRequestException('Title and prompt are required');
    }

    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true },
    });
    if (!actor) throw new NotFoundException('User not found');

    const wordIds = [...new Set((body.wordIds ?? []).map((id) => id.trim()).filter(Boolean))];
    const targetStudentId = body.studentId?.trim();
    const dueDate = body.dueDate?.trim()
      ? new Date(body.dueDate)
      : undefined;
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException('dueDate must be a valid ISO date');
    }

    if (targetStudentId && targetStudentId !== actorId) {
      await this.access.assertCanViewStudent(actorId, targetStudentId);
      await this.access.requireStaff(actorId);
      const student = await this.prisma.user.findUnique({
        where: { id: targetStudentId },
        select: { role: true },
      });
      if (!student || student.role !== 'STUDENT') {
        throw new BadRequestException('studentId must refer to a student user');
      }

      const topic = await this.db.speakingTopic.create({
        data: {
          schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
          title,
          prompt,
          ownerId: actorId,
          wordIds,
          assignments: {
            create: {
              studentId: targetStudentId,
              assignedById: actorId,
              personalNote: body.personalNote?.trim() || null,
              dueDate: dueDate ?? null,
            },
          },
        },
        include: { assignments: true },
      });
      const assignment = topic.assignments[0] ?? null;
      return mapTopicCard(topic, assignment, null);
    }

    if (actor.role === 'STUDENT') {
      const topic = await this.db.speakingTopic.create({
        data: {
          schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
          title,
          prompt,
          ownerId: actorId,
          wordIds,
          assignments: {
            create: {
              studentId: actorId,
              assignedById: actorId,
              personalNote: body.personalNote?.trim() || null,
              dueDate: dueDate ?? null,
            },
          },
        },
        include: { assignments: true },
      });
      const assignment = topic.assignments[0] ?? null;
      return mapTopicCard(topic, assignment, null);
    }

    const topic = await this.db.speakingTopic.create({
      data: {
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        title,
        prompt,
        ownerId: actorId,
        wordIds,
      },
    });
    return mapTopicCard(topic, null, null);
  }

  async delete(actorId: string, topicId: string): Promise<boolean> {
    const topic = await this.db.speakingTopic.findUnique({
      where: { id: topicId },
      include: { assignments: { select: { studentId: true } } },
    });
    if (!topic) throw new NotFoundException('Speaking topic not found');

    if (topic.ownerId === actorId) {
      await this.db.speakingTopic.delete({ where: { id: topicId } });
      return true;
    }

    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true },
    });
    if (actor?.role === 'ADMIN' || actor?.role === 'SUPER_ADMIN') {
      await this.db.speakingTopic.delete({ where: { id: topicId } });
      return true;
    }
    if (actor?.role === 'TEACHER') {
      for (const row of topic.assignments) {
        const student = await this.prisma.user.findUnique({
          where: { id: row.studentId },
          select: { teacherId: true },
        });
        if (student?.teacherId === actorId) {
          await this.db.speakingTopic.delete({ where: { id: topicId } });
          return true;
        }
      }
    }
    throw new ForbiddenException('You can only delete speaking topics you created or assigned');
  }

  async listForUser(userId: string): Promise<SpeakingTopicCardDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) return [];

    if (user.role === 'STUDENT') {
      return this.listForStudent(userId, userId);
    }

    const ownedTopics = await this.db.speakingTopic.findMany({
      where: { ownerId: userId },
      include: {
        assignments: { where: { studentId: userId } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const topicIds = ownedTopics.map((topic) => topic.id);
    const latestByTopicId = await this.loadLatestSubmissions(userId, topicIds);

    return ownedTopics.map((topic) => {
      const assignment = topic.assignments[0] ?? null;
      return mapTopicCard(topic, assignment, latestByTopicId.get(topic.id) ?? null);
    });
  }

  async listForStudent(viewerId: string, studentId: string): Promise<SpeakingTopicCardDto[]> {
    await this.access.assertCanViewStudent(viewerId, studentId);

    const assignments = await this.db.speakingTopicAssignment.findMany({
      where: { studentId },
      include: { topic: true },
      orderBy: { createdAt: 'desc' },
    });

    const topicIds = assignments.map((row) => row.topicId);
    const latestByTopicId = await this.loadLatestSubmissions(studentId, topicIds);

    return assignments.map((row) =>
      mapTopicCard(row.topic, row, latestByTopicId.get(row.topicId) ?? null),
    );
  }

  private async loadLatestSubmissions(studentId: string, topicIds: string[]) {
    if (topicIds.length === 0) return new Map<string, Awaited<ReturnType<typeof this.db.speakingSubmission.findFirst>>>();

    const rows = await this.db.speakingSubmission.findMany({
      where: { studentId, topicId: { in: topicIds } },
      orderBy: { submittedAt: 'desc' },
    });

    const map = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!map.has(row.topicId)) map.set(row.topicId, row);
    }
    return map;
  }
}
