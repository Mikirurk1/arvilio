import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, TenantPrismaService } from '@be/prisma';

@Injectable()
export class SpeakingAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  /** Tenant-scoped client: SpeakingTopic/SpeakingSubmission are auto-filtered by school. */
  private get db() {
    return this.tenantPrisma.client;
  }

  async requireStaff(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role === 'STUDENT') {
      throw new ForbiddenException('This action requires teacher, admin, or super admin role');
    }
  }

  async assertCanViewStudent(viewerId: string, studentId: string): Promise<void> {
    if (viewerId === studentId) return;
    await this.requireStaff(viewerId);
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true, teacherId: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      select: { role: true },
    });
    if (viewer?.role === 'TEACHER' && student.teacherId !== viewerId) {
      throw new ForbiddenException('You can only view speaking work for your students');
    }
  }

  async assertCanAccessTopic(userId: string, topicId: string): Promise<void> {
    const topic = await this.db.speakingTopic.findUnique({
      where: { id: topicId },
      include: { assignments: { select: { studentId: true } } },
    });
    if (!topic) throw new NotFoundException('Speaking topic not found');
    if (topic.ownerId === userId) return;
    const assigned = topic.assignments.some((row) => row.studentId === userId);
    if (assigned) return;
    await this.requireStaff(userId);
    for (const row of topic.assignments) {
      await this.assertCanViewStudent(userId, row.studentId);
      return;
    }
    throw new NotFoundException('Speaking topic not found');
  }

  async assertCanAccessSubmission(viewerId: string, submissionId: string): Promise<{
    id: string;
    studentId: string;
    audioStorageKey: string | null;
    mimeType: string | null;
  }> {
    const submission = await this.db.speakingSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        studentId: true,
        audioStorageKey: true,
        mimeType: true,
      },
    });
    if (!submission) throw new NotFoundException('Speaking submission not found');
    if (submission.studentId === viewerId) return submission;
    await this.assertCanViewStudent(viewerId, submission.studentId);
    return submission;
  }
}
