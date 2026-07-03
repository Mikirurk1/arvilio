import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { dedupeById } from '../domain/quiz-generator.logic';
import {
  cardWordInclude,
  type CardWithWord,
  type WordRow,
} from '../application/quiz-generator.types';
import {
  dedupeWordRows,
  weightedShuffleWords,
  wordsFromCards,
} from '../application/quiz-generator.helpers';

@Injectable()
export class QuizRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  /** Tenant-scoped client: StudentWordCard/QuizAttempt reads are auto-filtered by school. */
  private get db() {
    return this.tenantPrisma.client;
  }

  async findNativeLanguageId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nativeLanguageId: true },
    });
    return user?.nativeLanguageId ?? null;
  }

  async collectPool(
    studentId: string,
    lessonId: string | undefined,
    source: 'vocabulary' | 'lesson' | 'mixed' | 'manual',
    nativeLanguageId: string | null,
    mistakesOnly = false,
  ): Promise<WordRow[]> {
    const statusFilter = mistakesOnly ? { status: 'MISTAKES_WORK' as const } : {};
    if (source === 'lesson' || source === 'mixed') {
      if (!lessonId) {
        throw new BadRequestException(
          `lessonId is required when source is ${source}`,
        );
      }
    }

    if (source === 'lesson') {
      const cards = await this.db.studentWordCard.findMany({
        where: { userId: studentId, lessonId, ...statusFilter },
        include: cardWordInclude,
        orderBy: { firstSeenAt: 'desc' },
      });
      return weightedShuffleWords(wordsFromCards(cards as CardWithWord[], nativeLanguageId));
    }

    if (source === 'mixed') {
      const [lessonCards, allCards] = await Promise.all([
        this.db.studentWordCard.findMany({
          where: { userId: studentId, lessonId, ...statusFilter },
          include: cardWordInclude,
          orderBy: { firstSeenAt: 'desc' },
        }),
        this.db.studentWordCard.findMany({
          where: { userId: studentId, ...statusFilter },
          include: cardWordInclude,
          orderBy: { firstSeenAt: 'desc' },
        }),
      ]);
      const lessonWords = wordsFromCards(lessonCards as CardWithWord[], nativeLanguageId);
      const lessonWordIds = new Set(lessonWords.map((word) => word.id));
      const otherCards = (allCards as CardWithWord[]).filter(
        (card) => !card.lessonId || card.lessonId !== lessonId,
      );
      const otherWords = wordsFromCards(otherCards, nativeLanguageId).filter(
        (word) => !lessonWordIds.has(word.id),
      );
      return [
        ...weightedShuffleWords(lessonWords),
        ...weightedShuffleWords(otherWords),
      ];
    }

    const cards = await this.db.studentWordCard.findMany({
      where: { userId: studentId, ...statusFilter },
      include: cardWordInclude,
      orderBy: { firstSeenAt: 'desc' },
    });
    return weightedShuffleWords(wordsFromCards(cards as CardWithWord[], nativeLanguageId));
  }

  async collectDistractorPool(
    pool: WordRow[],
    studentId: string,
    nativeLanguageId: string | null,
  ): Promise<WordRow[]> {
    const cards = await this.db.studentWordCard.findMany({
      where: { userId: studentId },
      include: cardWordInclude,
    });
    const fromUser = wordsFromCards(cards as CardWithWord[], nativeLanguageId);
    const ids = new Set(pool.map((word) => word.id));
    const extra = fromUser.filter((word) => !ids.has(word.id));
    return dedupeWordRows([...pool, ...extra]);
  }

  async mapQuizzesWithAttempts<
    T extends {
      id: string;
      title: string;
      category: string;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      source: 'MANUAL' | 'VOCABULARY' | 'LESSON' | 'MIXED';
      lessonId: string | null;
      createdAt: Date;
      _count: { questions: number };
    },
  >(userId: string, quizzes: T[]) {
    const quizIds = quizzes.map((quiz) => quiz.id);
    const finishedAttempts =
      quizIds.length === 0
        ? []
        : await this.db.quizAttempt.findMany({
            where: { studentId: userId, quizId: { in: quizIds }, finishedAt: { not: null } },
            orderBy: { finishedAt: 'desc' },
          });
    const latestAttemptByQuizId = new Map<string, (typeof finishedAttempts)[number]>();
    for (const attempt of finishedAttempts) {
      if (!latestAttemptByQuizId.has(attempt.quizId)) {
        latestAttemptByQuizId.set(attempt.quizId, attempt);
      }
    }
    return quizzes.map((quiz) => {
      const attempt = latestAttemptByQuizId.get(quiz.id);
      return {
        id: quiz.id,
        title: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        source: quiz.source.toLowerCase() as 'vocabulary' | 'lesson' | 'mixed' | 'manual',
        lessonId: quiz.lessonId,
        questionCount: quiz._count.questions,
        createdAt: quiz.createdAt.toISOString(),
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

  async latestAttemptsByQuizIds(studentId: string, quizIds: string[]) {
    if (quizIds.length === 0) return new Map<string, never>();
    const finishedAttempts = await this.db.quizAttempt.findMany({
      where: { studentId, quizId: { in: quizIds }, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
    });
    const latestAttemptByQuizId = new Map<string, (typeof finishedAttempts)[number]>();
    for (const attempt of finishedAttempts) {
      if (!latestAttemptByQuizId.has(attempt.quizId)) {
        latestAttemptByQuizId.set(attempt.quizId, attempt);
      }
    }
    return latestAttemptByQuizId;
  }

  dedupeWordRows(items: WordRow[]): WordRow[] {
    return dedupeById(items);
  }
}
