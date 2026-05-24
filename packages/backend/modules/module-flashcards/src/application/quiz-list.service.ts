import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { QuizCardDto, StudentQuizCardDto } from '@pkg/types';
import { encodeQuizCursor } from '../domain/quiz-generator.logic';
import { QuizAccessService } from './quiz-access.service';
import { parseQuizCursor } from './quiz-generator.helpers';
import { QuizRepository } from '../infrastructure/quiz.repository';

@Injectable()
export class QuizListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: QuizAccessService,
    private readonly repo: QuizRepository,
  ) {}

  async delete(actorId: string, quizId: string): Promise<boolean> {
    await this.access.requireStaff(actorId);
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true },
    });
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    const isOwner = quiz.ownerId === actorId;
    const isAdmin = actor?.role === 'ADMIN' || actor?.role === 'SUPER_ADMIN';
    if (isAdmin || isOwner) {
      await this.prisma.quiz.delete({ where: { id: quizId } });
      return true;
    }
    if (actor?.role === 'TEACHER') {
      const canDeleteForStudent = await this.prisma.quizAssignment.findFirst({
        where: {
          quizId,
          student: { teacherId: actorId },
        },
        select: { id: true },
      });
      if (canDeleteForStudent) {
        await this.prisma.quiz.delete({ where: { id: quizId } });
        return true;
      }
    }
    throw new ForbiddenException('You can only delete quizzes you created or assigned to your students');
  }

  async listForStudent(viewerId: string, studentId: string): Promise<StudentQuizCardDto[]> {
    await this.access.assertCanViewStudent(viewerId, studentId);
    const rows = await this.prisma.quizAssignment.findMany({
      where: { studentId },
      include: {
        quiz: { include: { _count: { select: { questions: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const quizIds = rows.map((row) => row.quizId);
    const latestAttemptByQuizId = await this.repo.latestAttemptsByQuizIds(studentId, quizIds);
    return rows.map((row) => {
      const attempt = latestAttemptByQuizId.get(row.quizId);
      return {
        id: row.quiz.id,
        title: row.quiz.title,
        category: row.quiz.category,
        difficulty: row.quiz.difficulty.toLowerCase() as QuizCardDto['difficulty'],
        source: row.quiz.source.toLowerCase() as QuizCardDto['source'],
        lessonId: row.quiz.lessonId,
        questionCount: row.quiz._count.questions,
        createdAt: row.quiz.createdAt.toISOString(),
        assignmentId: row.id,
        attempt: attempt
          ? {
              id: attempt.id,
              score: attempt.score,
              correctCount: attempt.correctCount,
              totalCount: attempt.totalCount,
              finishedAt: attempt.finishedAt?.toISOString() ?? null,
            }
          : null,
      };
    });
  }

  async listFor(userId: string): Promise<QuizCardDto[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: await this.access.listForWhere(userId),
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return this.repo.mapQuizzesWithAttempts(userId, quizzes);
  }

  async listForPage(
    userId: string,
    limit = 25,
    cursor?: string,
  ): Promise<{ items: QuizCardDto[]; hasMore: boolean; nextCursor: string | null }> {
    const take = Math.min(Math.max(limit, 1), 100);
    const cursorRow = cursor ? parseQuizCursor(cursor) : null;
    const cursorWhere = cursorRow
      ? {
          OR: [
            { createdAt: { lt: cursorRow.createdAt } },
            {
              AND: [{ createdAt: cursorRow.createdAt }, { id: { lt: cursorRow.id } }],
            },
          ],
        }
      : {};
    const quizzes = await this.prisma.quiz.findMany({
      where: { AND: [await this.access.listForWhere(userId), cursorWhere] },
      include: { _count: { select: { questions: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    });
    const hasMore = quizzes.length > take;
    const page = hasMore ? quizzes.slice(0, take) : quizzes;
    const items = await this.repo.mapQuizzesWithAttempts(userId, page);
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last ? encodeQuizCursor({ createdAt: last.createdAt, id: last.id }) : null;
    return { items, hasMore, nextCursor };
  }

  async listForStudentPage(
    viewerId: string,
    studentId: string,
    limit = 25,
    cursor?: string,
  ): Promise<{ items: StudentQuizCardDto[]; hasMore: boolean; nextCursor: string | null }> {
    await this.access.assertCanViewStudent(viewerId, studentId);
    const take = Math.min(Math.max(limit, 1), 100);
    const cursorRow = cursor ? parseQuizCursor(cursor) : null;
    const cursorWhere = cursorRow
      ? {
          OR: [
            { createdAt: { lt: cursorRow.createdAt } },
            {
              AND: [{ createdAt: cursorRow.createdAt }, { id: { lt: cursorRow.id } }],
            },
          ],
        }
      : {};
    const rows = await this.prisma.quizAssignment.findMany({
      where: { studentId, ...cursorWhere },
      include: { quiz: { include: { _count: { select: { questions: true } } } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    });
    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    const quizIds = page.map((row) => row.quizId);
    const latestAttemptByQuizId = await this.repo.latestAttemptsByQuizIds(studentId, quizIds);
    const items = page.map((row) => {
      const attempt = latestAttemptByQuizId.get(row.quizId);
      return {
        id: row.quiz.id,
        title: row.quiz.title,
        category: row.quiz.category,
        difficulty: row.quiz.difficulty.toLowerCase() as QuizCardDto['difficulty'],
        source: row.quiz.source.toLowerCase() as QuizCardDto['source'],
        lessonId: row.quiz.lessonId,
        questionCount: row.quiz._count.questions,
        createdAt: row.quiz.createdAt.toISOString(),
        assignmentId: row.id,
        attempt: attempt
          ? {
              id: attempt.id,
              score: attempt.score,
              correctCount: attempt.correctCount,
              totalCount: attempt.totalCount,
              finishedAt: attempt.finishedAt?.toISOString() ?? null,
            }
          : null,
      };
    });
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last ? encodeQuizCursor({ createdAt: last.createdAt, id: last.id }) : null;
    return { items, hasMore, nextCursor };
  }
}
