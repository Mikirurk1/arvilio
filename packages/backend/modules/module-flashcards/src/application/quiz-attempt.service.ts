import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type { QuizAttemptResultDto, SubmitQuizAttemptRequestDto } from '@pkg/types';
import { gradeQuizAnswers } from '../domain/quiz-grading.util';
import { QuizAccessService } from './quiz-access.service';

@Injectable()
export class QuizAttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly access: QuizAccessService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  /** Tenant-scoped client: Quiz/QuizAssignment/QuizAttempt are auto-filtered by school. */
  private get db() {
    return this.tenantPrisma.client;
  }

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

    const quiz = await this.db.quiz.findUnique({
      where: { id: body.quizId },
      include: {
        questions: { orderBy: { order: 'asc' }, select: { id: true, type: true, correctAnswer: true, wordId: true } },
      },
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

    const assignment = await this.db.quizAssignment.findUnique({
      where: { quizId_studentId: { quizId: body.quizId, studentId } },
    });

    const wrongWordIds = new Set<string>();
    for (const row of graded.answerRows) {
      if (row.isCorrect) continue;
      const question = quiz.questions.find((q) => q.id === row.questionId);
      if (question?.wordId) wrongWordIds.add(question.wordId);
    }

    const attempt = await this.db.$transaction(async (tx) => {
      const created = await tx.quizAttempt.create({
        data: {
          quizId: body.quizId,
          studentId,
          schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
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
      if (wrongWordIds.size > 0) {
        await tx.studentWordCard.updateMany({
          where: {
            userId: studentId,
            wordId: { in: [...wrongWordIds] },
            status: { not: 'LEARNED' },
          },
          data: { status: 'MISTAKES_WORK' },
        });
      }
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
