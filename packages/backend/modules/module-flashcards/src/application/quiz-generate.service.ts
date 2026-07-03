import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type { GenerateQuizRequestDto, QuizDetailDto } from '@pkg/types';
import { QuizAccessService } from './quiz-access.service';
import {
  buildQuestions,
  defaultTitle,
  difficultyFromDto,
  MIN_QUIZ_QUESTION_RATIO,
  sourceFromDto,
  toDetail,
} from './quiz-generator.helpers';
import { QuizRepository } from '../infrastructure/quiz.repository';
import { QuizDistractorService } from './quiz-distractor.service';

@Injectable()
export class QuizGenerateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: QuizAccessService,
    private readonly repo: QuizRepository,
    private readonly distractorHints: QuizDistractorService,
    private readonly tenant: TenantContextService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  /** Tenant-scoped client: Quiz/QuizAssignment writes are auto-filtered by school. */
  private get db() {
    return this.tenantPrisma.client;
  }

  async generate(actorId: string, body: GenerateQuizRequestDto): Promise<QuizDetailDto> {
    await this.access.requireStaff(actorId);
    const source = body.source ?? 'vocabulary';
    const difficulty = body.difficulty ?? 'medium';
    const questionCount = Math.min(Math.max(body.questionCount ?? 8, 3), 25);
    const targetStudentId = await this.access.resolveQuizTargetStudentId(actorId, body.studentId);

    const nativeLanguageId = await this.repo.findNativeLanguageId(targetStudentId);
    const pool = await this.repo.collectPool(
      targetStudentId,
      body.lessonId,
      source,
      nativeLanguageId,
      body.mistakesOnly === true,
    );
    if (pool.length === 0) {
      const forStudent = targetStudentId !== actorId;
      throw new BadRequestException(
        forStudent
          ? 'This student has not enough vocabulary to generate a quiz. Add words to their vocabulary first.'
          : 'Not enough vocabulary to generate a quiz. Add words first.',
      );
    }

    const distractorsBase = await this.repo.collectDistractorPool(
      pool,
      targetStudentId,
      nativeLanguageId,
    );
    const targets = pool.slice(0, questionCount);
    const synonymHintsByWordId = await this.distractorHints.synonymPoolRowsByWordId(
      targets,
      distractorsBase,
    );
    const questionsData = buildQuestions(pool, distractorsBase, questionCount, difficulty, {
      includeIrregularVerbDrills: body.includeIrregularVerbDrills !== false,
      synonymHintsByWordId,
    });

    const minRequired = Math.max(3, Math.ceil(questionCount * MIN_QUIZ_QUESTION_RATIO));
    if (questionsData.length < minRequired) {
      throw new BadRequestException(
        body.mistakesOnly
          ? `Not enough words marked for mistakes work to build ${questionCount} questions. Add more practice or lower the question count.`
          : `Could only build ${questionsData.length} of ${questionCount} questions. Add more vocabulary words or lower the question count.`,
      );
    }

    const quiz = await this.db.quiz.create({
      data: {
        // Tenant from request context (auth guard); fallback to default school.
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        title: body.title ?? defaultTitle(body, pool.length),
        category:
          body.category ??
          (source === 'lesson' || source === 'mixed' ? 'Lesson' : 'Vocabulary'),
        difficulty: difficultyFromDto(difficulty),
        source: sourceFromDto(source),
        ownerId: actorId,
        lessonId:
          source === 'lesson' || source === 'mixed' ? (body.lessonId ?? null) : null,
        questions: {
          create: questionsData.map((question, index) => ({
            order: index,
            type: question.type === 'multiple-choice' ? 'MULTIPLE_CHOICE' : 'FILL_IN',
            prompt: question.question,
            options: question.options ?? [],
            correctAnswer: String(question.correct),
            explanation: question.explanation,
            wordId: question.wordId ?? null,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    const assignee = await this.prisma.user.findUnique({
      where: { id: targetStudentId },
      select: { role: true },
    });
    if (assignee?.role === 'STUDENT') {
      await this.db.quizAssignment.upsert({
        where: {
          quizId_studentId: { quizId: quiz.id, studentId: targetStudentId },
        },
        create: {
          quizId: quiz.id,
          studentId: targetStudentId,
          schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
          assignedById: actorId,
          status: 'PENDING',
        },
        update: { status: 'PENDING' },
      });
    }

    return toDetail(quiz);
  }
}
