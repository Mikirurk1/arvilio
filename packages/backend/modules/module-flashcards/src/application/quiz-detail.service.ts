import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { QuizDetailDto } from '@pkg/types';
import { toDetail } from './quiz-generator.helpers';

@Injectable()
export class QuizDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async detailFor(userId: string, quizId: string): Promise<QuizDetailDto> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.ownerId !== userId) {
      const assignment = await this.prisma.quizAssignment.findFirst({
        where: { quizId, studentId: userId },
      });
      if (!assignment) throw new NotFoundException('Quiz not found');
    }
    return toDetail(quiz);
  }
}
