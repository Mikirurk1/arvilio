import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { QuizAttemptResultDto, SubmitQuizAttemptRequestDto } from '@pkg/types';
import { gradeQuizAnswers } from '../domain/quiz-grading.util';
import { QuizAccessService } from './quiz-access.service';

@Injectable()
export class QuizAttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: QuizAccessService,
  ) {}

  async submitAttempt(
    actorId: string,
    body: SubmitQuizAttemptRequestDto,
  ): Promise<QuizAttemptResultDto> {
    const studentId = body.studentId ?? actorId;
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true },
    });
    if (!actor) throw new NotFoundException('User not found');

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: body.quizId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const graded = gradeQuizAnswers(quiz.questions, body.answers);
    const score =
      graded.totalCount > 0
        ? Math.round((graded.correctCount / graded.totalCount) * 100)
        : 0;

    if (body.practiceMode) {
      if (actor.role === 'STUDENT') {
        throw new ForbiddenException('Practice mode is for staff only');
      }
      await this.access.assertQuizAccess(actorId, body.quizId);
      return {
        attemptId: null,
        score,
        correctCount: graded.correctCount,
        totalCount: graded.totalCount,
        practiceMode: true,
      };
    }

    if (actor.role === 'STUDENT' && actorId !== studentId) {
      throw new ForbiddenException('Students can only submit their own attempts');
    }
    await this.access.assertCanViewStudent(actorId, studentId);
    await this.access.assertQuizAccess(studentId, body.quizId);

    const assignment = await this.prisma.quizAssignment.findUnique({
      where: { quizId_studentId: { quizId: body.quizId, studentId } },
    });

    const attempt = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quizAttempt.create({
        data: {
          quizId: body.quizId,
          studentId,
          assignmentId: assignment?.id ?? null,
          score,
          correctCount: graded.correctCount,
          totalCount: graded.totalCount,
          finishedAt: new Date(),
        },
      });
      await tx.quizAnswer.createMany({
        data: graded.answerRows.map((row) => ({
          attemptId: created.id,
          questionId: row.questionId,
          givenAnswer: row.givenAnswer,
          isCorrect: row.isCorrect,
        })),
      });
      if (assignment) {
        await tx.quizAssignment.update({
          where: { id: assignment.id },
          data: { status: 'SUBMITTED', score },
        });
      }
      return created;
    });

    return {
      attemptId: attempt.id,
      score,
      correctCount: graded.correctCount,
      totalCount: graded.totalCount,
      practiceMode: false,
    };
  }
}
