import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '@be/prisma';
import type { QuizDetailDto } from '@pkg/types';
import { toDetail } from './quiz-generator.helpers';

@Injectable()
export class QuizDetailService {
  constructor(private readonly tenantPrisma: TenantPrismaService) {}

  /** Tenant-scoped client: Quiz/QuizAssignment reads are auto-filtered by school. */
  private get db() {
    return this.tenantPrisma.client;
  }

  async detailFor(userId: string, quizId: string): Promise<QuizDetailDto> {
    const quiz = await this.db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.ownerId !== userId) {
      const assignment = await this.db.quizAssignment.findFirst({
        where: { quizId, studentId: userId },
      });
      if (!assignment) throw new NotFoundException('Quiz not found');
    }
    return toDetail(quiz);
  }
}
