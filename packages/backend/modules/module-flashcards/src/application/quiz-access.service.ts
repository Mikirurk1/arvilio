import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';

@Injectable()
export class QuizAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveQuizTargetStudentId(
    actorId: string,
    studentId: string | undefined,
  ): Promise<string> {
    const explicit = studentId?.trim();
    if (!explicit || explicit === actorId) {
      return actorId;
    }
    await this.assertCanViewStudent(actorId, explicit);
    const student = await this.prisma.user.findUnique({
      where: { id: explicit },
      select: { role: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new BadRequestException('studentId must refer to a student user');
    }
    return explicit;
  }

  async listForWhere(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role === 'STUDENT') {
      return {
        OR: [{ ownerId: userId }, { assignments: { some: { studentId: userId } } }],
      };
    }
    return {
      OR: [
        { ownerId: userId },
        { assignments: { some: { studentId: userId } } },
      ],
    };
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
      throw new ForbiddenException('You can only view quizzes for your students');
    }
  }

  async assertQuizAccess(userId: string, quizId: string): Promise<void> {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.ownerId === userId) return;
    const assignment = await this.prisma.quizAssignment.findFirst({
      where: { quizId, studentId: userId },
    });
    if (!assignment) throw new NotFoundException('Quiz not found');
  }
}
