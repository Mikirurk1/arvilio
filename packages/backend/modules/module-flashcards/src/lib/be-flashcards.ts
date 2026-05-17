import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import { AuthGuard, CurrentUser } from '@soenglish/module-auth';
import type {
  GenerateQuizRequestDto,
  QuizAttemptResultDto,
  QuizCardDto,
  QuizDetailDto,
  StudentQuizCardDto,
  SubmitQuizAttemptRequestDto,
} from '@soenglish/shared-types';

type WordRow = {
  id: string;
  text: string;
  definition: string;
  example: string | null;
  partOfSpeech: string | null;
  category: string | null;
};

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function difficultyFromDto(
  difficulty: 'easy' | 'medium' | 'hard',
): 'EASY' | 'MEDIUM' | 'HARD' {
  return difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD';
}

function sourceFromDto(
  source: 'vocabulary' | 'lesson' | 'mixed' | 'manual',
): 'VOCABULARY' | 'LESSON' | 'MIXED' | 'MANUAL' {
  return source.toUpperCase() as 'VOCABULARY' | 'LESSON' | 'MIXED' | 'MANUAL';
}

@Injectable()
export class QuizGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(actorId: string, body: GenerateQuizRequestDto): Promise<QuizDetailDto> {
    await this.requireStaff(actorId);
    const source = body.source ?? 'vocabulary';
    const difficulty = body.difficulty ?? 'medium';
    const questionCount = Math.min(Math.max(body.questionCount ?? 8, 3), 25);
    const targetStudentId = body.studentId ?? actorId;

    const pool = await this.collectPool(targetStudentId, body.lessonId, source);
    if (pool.length === 0) {
      throw new BadRequestException(
        'Not enough vocabulary to generate a quiz. Add words first.',
      );
    }

    const distractorsBase = await this.collectDistractorPool(pool);
    const questionsData = buildQuestions(pool, distractorsBase, questionCount, difficulty);

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

  async delete(actorId: string, quizId: string): Promise<boolean> {
    await this.requireStaff(actorId);
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
    return true;
  }

  async listForStudent(viewerId: string, studentId: string): Promise<StudentQuizCardDto[]> {
    await this.assertCanViewStudent(viewerId, studentId);
    const rows = await this.prisma.quizAssignment.findMany({
      where: { studentId },
      include: {
        quiz: { include: { _count: { select: { questions: true } } } },
        attempts: {
          where: { studentId, finishedAt: { not: null } },
          orderBy: { finishedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => {
      const attempt = row.attempts[0];
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
      await this.assertQuizAccess(actorId, body.quizId);
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
    await this.assertCanViewStudent(actorId, studentId);
    await this.assertQuizAccess(studentId, body.quizId);

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

  private async requireStaff(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role === 'STUDENT') {
      throw new ForbiddenException('This action requires teacher, admin, or super admin role');
    }
  }

  private async assertCanViewStudent(viewerId: string, studentId: string): Promise<void> {
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

  private async assertQuizAccess(userId: string, quizId: string): Promise<void> {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.ownerId === userId) return;
    const assignment = await this.prisma.quizAssignment.findFirst({
      where: { quizId, studentId: userId },
    });
    if (!assignment) throw new NotFoundException('Quiz not found');
  }

  private async collectPool(
    studentId: string,
    lessonId: string | undefined,
    source: 'vocabulary' | 'lesson' | 'mixed' | 'manual',
  ): Promise<WordRow[]> {
    if (source === 'lesson' || (source === 'mixed' && lessonId)) {
      const cards = await this.prisma.studentWordCard.findMany({
        where: { userId: studentId, lessonId: lessonId ?? undefined },
        include: { word: true },
      });
      if (cards.length > 0) return cards.map((card) => card.word);
    }
    const cards = await this.prisma.studentWordCard.findMany({
      where: { userId: studentId, OR: [{ status: 'NEW' }, { status: 'MISTAKES_WORK' }, { status: 'REPEATED' }] },
      include: { word: true },
      take: 50,
    });
    if (cards.length > 0) return cards.map((card) => card.word);
    return this.prisma.word.findMany({ take: 50 });
  }

  private async collectDistractorPool(pool: WordRow[]): Promise<WordRow[]> {
    const ids = new Set(pool.map((word) => word.id));
    const extra = await this.prisma.word.findMany({
      where: { id: { notIn: Array.from(ids) } },
      take: 100,
    });
    return [...pool, ...extra];
  }

  async listFor(userId: string): Promise<QuizCardDto[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: { OR: [{ ownerId: userId }, { assignments: { some: { studentId: userId } } }] },
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty.toLowerCase() as QuizCardDto['difficulty'],
      source: quiz.source.toLowerCase() as QuizCardDto['source'],
      lessonId: quiz.lessonId,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt.toISOString(),
    }));
  }

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

function defaultTitle(body: GenerateQuizRequestDto, poolSize: number): string {
  if (body.lessonId) return `Lesson quiz (${poolSize} words)`;
  if (body.source === 'vocabulary') return `Vocabulary quiz (${poolSize} words)`;
  return 'Generated quiz';
}

function toDetail(quiz: {
  id: string;
  title: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  source: 'MANUAL' | 'VOCABULARY' | 'LESSON' | 'MIXED';
  lessonId: string | null;
  createdAt: Date;
  questions: Array<{
    id: string;
    type: 'MULTIPLE_CHOICE' | 'FILL_IN';
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string | null;
    wordId: string | null;
  }>;
}): QuizDetailDto {
  return {
    id: quiz.id,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty.toLowerCase() as QuizDetailDto['difficulty'],
    source: quiz.source.toLowerCase() as QuizDetailDto['source'],
    lessonId: quiz.lessonId,
    questionCount: quiz.questions.length,
    createdAt: quiz.createdAt.toISOString(),
    questions: quiz.questions.map((question) => ({
      id: question.id,
      type: question.type === 'MULTIPLE_CHOICE' ? 'multiple-choice' : 'fill-in',
      question: question.prompt,
      options: question.options,
      correct: question.type === 'MULTIPLE_CHOICE'
        ? Number.parseInt(question.correctAnswer, 10) || 0
        : question.correctAnswer,
      explanation: question.explanation ?? '',
      wordId: question.wordId,
    })),
  };
}

type GeneratedQuestion = {
  type: 'multiple-choice' | 'fill-in';
  question: string;
  options?: string[];
  correct: number | string;
  explanation: string;
  wordId: string;
};

function buildQuestions(
  pool: WordRow[],
  distractorPool: WordRow[],
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
): GeneratedQuestion[] {
  const ordered = shuffle(pool).slice(0, count);
  const out: GeneratedQuestion[] = [];

  ordered.forEach((word, index) => {
    const template = pickTemplate(index, difficulty, Boolean(word.example));
    const question = buildSingle(template, word, distractorPool);
    if (question) out.push(question);
  });

  if (out.length === 0) {
    // Ensure at least one question
    for (const word of ordered) {
      const fallback = buildSingle('definitionMcq', word, distractorPool);
      if (fallback) {
        out.push(fallback);
        break;
      }
    }
  }
  return out;
}

type QuestionTemplate = 'definitionMcq' | 'reverseMcq' | 'cloze';

function pickTemplate(
  index: number,
  difficulty: 'easy' | 'medium' | 'hard',
  hasExample: boolean,
): QuestionTemplate {
  if (difficulty === 'easy') return 'definitionMcq';
  if (difficulty === 'hard') {
    if (hasExample && index % 2 === 0) return 'cloze';
    return 'reverseMcq';
  }
  const cycle: QuestionTemplate[] = hasExample
    ? ['definitionMcq', 'reverseMcq', 'cloze']
    : ['definitionMcq', 'reverseMcq'];
  return cycle[index % cycle.length];
}

function buildSingle(
  template: QuestionTemplate,
  word: WordRow,
  pool: WordRow[],
): GeneratedQuestion | null {
  if (template === 'definitionMcq') {
    const distractors = pickDistractors(pool, word, (candidate) => candidate.definition).slice(0, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([word.definition, ...distractors.map((row) => row.definition)]);
    return {
      type: 'multiple-choice',
      question: `Choose the correct definition for "${word.text}":`,
      options,
      correct: options.indexOf(word.definition),
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
    };
  }
  if (template === 'reverseMcq') {
    const distractors = pickDistractors(pool, word, (candidate) => candidate.text).slice(0, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([word.text, ...distractors.map((row) => row.text)]);
    return {
      type: 'multiple-choice',
      question: `Which word matches: "${word.definition}"?`,
      options,
      correct: options.indexOf(word.text),
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
    };
  }
  if (template === 'cloze' && word.example) {
    const masked = maskWordInExample(word.example, word.text);
    if (!masked) return null;
    return {
      type: 'fill-in',
      question: `Fill in the blank: ${masked}`,
      correct: word.text,
      explanation: `Original sentence: "${word.example}"`,
      wordId: word.id,
    };
  }
  return null;
}

function pickDistractors(
  pool: WordRow[],
  word: WordRow,
  selector: (row: WordRow) => string,
): WordRow[] {
  const sameCategory = pool.filter(
    (candidate) =>
      candidate.id !== word.id &&
      selector(candidate).trim().length > 0 &&
      candidate.category === word.category,
  );
  const samePos = pool.filter(
    (candidate) =>
      candidate.id !== word.id &&
      selector(candidate).trim().length > 0 &&
      candidate.partOfSpeech === word.partOfSpeech,
  );
  const fallback = pool.filter(
    (candidate) => candidate.id !== word.id && selector(candidate).trim().length > 0,
  );
  const merged = dedupeWordRows([...sameCategory, ...samePos, ...fallback]);
  return shuffle(merged);
}

function dedupeWordRows(items: WordRow[]): WordRow[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function maskWordInExample(example: string, word: string): string | null {
  if (!example || !word) return null;
  const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
  if (!pattern.test(example)) return null;
  return example.replace(pattern, '_____');
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Controller('quizzes')
@UseGuards(AuthGuard)
export class QuizController {
  constructor(private readonly quizzes: QuizGeneratorService) {}

  @Get()
  async list(@CurrentUser() userId: string): Promise<QuizCardDto[]> {
    return this.quizzes.listFor(userId);
  }

  @Get('student/:studentId')
  async listForStudent(
    @CurrentUser() userId: string,
    @Param('studentId') studentId: string,
  ): Promise<StudentQuizCardDto[]> {
    return this.quizzes.listForStudent(userId, studentId);
  }

  @Post('generate')
  async generate(
    @CurrentUser() userId: string,
    @Body() body: GenerateQuizRequestDto,
  ): Promise<QuizDetailDto> {
    return this.quizzes.generate(userId, body);
  }

  @Post('submit')
  async submit(
    @CurrentUser() userId: string,
    @Body() body: SubmitQuizAttemptRequestDto,
  ): Promise<QuizAttemptResultDto> {
    return this.quizzes.submitAttempt(userId, body);
  }

  @Get(':id')
  async detail(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<QuizDetailDto> {
    return this.quizzes.detailFor(userId, id);
  }

  @Delete(':id')
  async remove(@CurrentUser() userId: string, @Param('id') id: string): Promise<{ ok: boolean }> {
    const ok = await this.quizzes.delete(userId, id);
    return { ok };
  }
}

function gradeQuizAnswers(
  questions: Array<{
    id: string;
    type: 'MULTIPLE_CHOICE' | 'FILL_IN';
    correctAnswer: string;
  }>,
  answers: Array<{ questionId: string; givenAnswer: string }>,
): {
  correctCount: number;
  totalCount: number;
  answerRows: Array<{ questionId: string; givenAnswer: string; isCorrect: boolean }>;
} {
  let correctCount = 0;
  const answerRows = questions.map((question) => {
    const given = answers.find((a) => a.questionId === question.id)?.givenAnswer ?? '';
    let isCorrect = false;
    if (question.type === 'MULTIPLE_CHOICE') {
      isCorrect = Number.parseInt(given, 10) === Number.parseInt(question.correctAnswer, 10);
    } else {
      isCorrect =
        given.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    }
    if (isCorrect) correctCount += 1;
    return { questionId: question.id, givenAnswer: given, isCorrect };
  });
  return { correctCount, totalCount: questions.length, answerRows };
}

@Module({
  controllers: [QuizController],
  providers: [QuizGeneratorService],
  exports: [QuizGeneratorService],
})
export class FlashcardsModule {}
