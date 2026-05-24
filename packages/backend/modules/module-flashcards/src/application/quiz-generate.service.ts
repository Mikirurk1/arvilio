import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { GenerateQuizRequestDto, QuizDetailDto } from '@pkg/types';
import { QuizAccessService } from './quiz-access.service';
import {
  buildQuestions,
  defaultTitle,
  difficultyFromDto,
  sourceFromDto,
  toDetail,
} from './quiz-generator.helpers';
import { QuizRepository } from '../infrastructure/quiz.repository';

@Injectable()
export class QuizGenerateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: QuizAccessService,
    private readonly repo: QuizRepository,
  ) {}

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
    const questionsData = buildQuestions(pool, distractorsBase, questionCount, difficulty, {
      includeIrregularVerbDrills: body.includeIrregularVerbDrills !== false,
    });

    const quiz = await this.prisma.quiz.create({
      data: {
        title: body.title ?? defaultTitle(body, pool.length),
        category: body.category ?? (body.lessonId ? 'Lesson' : 'Vocabulary'),
        difficulty: difficultyFromDto(difficulty),
        source: sourceFromDto(source),
        ownerId: actorId,
        lessonId: body.lessonId ?? null,
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
      await this.prisma.quizAssignment.upsert({
        where: {
          quizId_studentId: { quizId: quiz.id, studentId: targetStudentId },
        },
        create: {
          quizId: quiz.id,
          studentId: targetStudentId,
          assignedById: actorId,
          status: 'PENDING',
        },
        update: { status: 'PENDING' },
      });
    }

    return toDetail(quiz);
  }
}
